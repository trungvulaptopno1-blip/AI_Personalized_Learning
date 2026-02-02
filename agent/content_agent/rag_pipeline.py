# agents/content_agent/rag_pipeline.py
"""
RAG Pipeline cho Content Agent:
- Embedding từng chunk text
- Lưu vector + metadata + text gốc vào ChromaDB
"""

import logging
from typing import List, Dict, Any
import uuid
import numpy as np

try:
    from sentence_transformers import SentenceTransformer
    import chromadb
    from chromadb.utils import embedding_functions
except ImportError as e:
    logging.error(f"Thiếu thư viện RAG: {e}. Cài đặt: pip install sentence-transformers chromadb")
    raise

logger = logging.getLogger(__name__)

# Load model embedding một lần (global)
try:
    EMBEDDING_MODEL = SentenceTransformer('all-MiniLM-L6-v2')  # 384 chiều, hỗ trợ tiếng Việt cơ bản
    DIMENSION = EMBEDDING_MODEL.get_sentence_embedding_dimension()
    logger.info(f"Loaded embedding model: all-MiniLM-L6-v2 | dim={DIMENSION}")
except Exception as e:
    logger.critical(f"Không load được embedding model: {e}")
    raise

# ChromaDB client (persistent)
CHROMA_CLIENT = chromadb.PersistentClient(path="./chroma_db")

def embed_chunks(chunks: List[Dict[str, Any]]) -> List[List[float]]:
    """
    Embed tất cả chunks thành vector
    """
    texts = [chunk["text"] for chunk in chunks]
    if not texts:
        return []

    try:
        embeddings = EMBEDDING_MODEL.encode(
            texts,
            convert_to_numpy=True,
            normalize_embeddings=True,
            show_progress_bar=False
        )
        return embeddings.tolist()
    except Exception as e:
        logger.error(f"Embedding error: {e}")
        return [ [0.0] * DIMENSION for _ in texts ]  # fallback


def store_in_vector_db(
    chunks: List[Dict[str, Any]],
    embeddings: List[List[float]],
    filename: str,
    uploader_id: str | int
) -> Dict[str, Any]:
    """
    Lưu vào ChromaDB collection
    """
    if not chunks or not embeddings:
        raise ValueError("Không có chunk hoặc embedding để lưu")

    # Tạo tên collection unique
    safe_name = filename.replace(".", "_").replace(" ", "_").lower()[:80]
    collection_name = f"doc_{uploader_id}_{safe_name}_{uuid.uuid4().hex[:8]}"

    try:
        collection = CHROMA_CLIENT.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"}
        )

        ids = []
        metadatas = []
        documents = []
        vectors = []

        for i, chunk in enumerate(chunks):
            chunk_id = f"chunk_{i}_{uuid.uuid4().hex[:8]}"
            meta = chunk["metadata"].copy()
            meta.update({
                "filename": filename,
                "uploader_id": str(uploader_id),
                "chunk_index": i,
            })

            ids.append(chunk_id)
            metadatas.append(meta)
            documents.append(chunk["text"])
            vectors.append(embeddings[i])

        collection.add(
            ids=ids,
            embeddings=vectors,
            metadatas=metadatas,
            documents=documents
        )

        logger.info(f"Stored {len(chunks)} vectors in collection: {collection_name}")

        return {
            "status": "success",
            "collection_name": collection_name,
            "vector_count": len(chunks),
            "dimension": DIMENSION,
            "message": f"Đã lưu {len(chunks)} chunk vào vector DB"
        }

    except Exception as e:
        logger.error(f"Vector DB error for {filename}: {e}", exc_info=True)
        raise


async def process_rag_pipeline(result_from_extract_chunk: Dict[str, Any]) -> Dict[str, Any]:
    """
    Hàm chính để gọi từ coordinator hoặc API
    Nhận kết quả từ extract + chunk → embed + lưu
    """
    chunks = result_from_extract_chunk.get("chunks", [])
    filename = result_from_extract_chunk.get("filename")
    uploader_id = result_from_extract_chunk.get("uploader_id")

    if not chunks:
        raise ValueError("Không có chunk để xử lý RAG")

    embeddings = embed_chunks(chunks)
    vector_result = store_in_vector_db(chunks, embeddings, filename, uploader_id)

    return {
        "rag_status": "success",
        "full_result": {**result_from_extract_chunk, **vector_result}
    }
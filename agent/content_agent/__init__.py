# agents/content_agent/__init__.py
"""
Content Agent - Coordinator
Entry point chính của Content Agent.
Nhận file từ API → điều phối các bước:
1. Trích xuất text + metadata
2. Làm sạch & chia thành chunks
3. (sẽ gọi tiếp embedding ở rag_pipeline.py)
"""

from typing import Dict, Any, List
import logging
from fastapi import HTTPException

from .content_extractor import extract_text_from_file
from .utils import clean_and_chunk_text

logger = logging.getLogger(__name__)

async def process_uploaded_document(
    file_content: bytes,
    filename: str,
    uploader_id: int | str,
    chunk_size: int = 600,
    chunk_overlap: int = 120,
) -> Dict[str, Any]:
    """
    Hàm chính xử lý một file upload.
    
    Args:
        file_content: bytes của file
        filename: tên file gốc
        uploader_id: id của người upload (có thể là string hoặc int)
        chunk_size: kích thước mỗi chunk (ký tự)
        chunk_overlap: độ chồng lấn giữa các chunk
    
    Returns:
        dict chứa kết quả xử lý:
        - status
        - chunks (list các chunk đã clean)
        - metadata
        - chunk_count
        - message
    """
    try:
        logger.info(f"Processing document: {filename} by user {uploader_id}")

        # Bước 1: Trích xuất nội dung text thô + metadata
        raw_text, metadata = extract_text_from_file(file_content, filename)
        logger.info(f"Extracted {len(raw_text)} characters from {filename}")

        if not raw_text.strip():
            raise ValueError("Không trích xuất được nội dung từ file")

        # Bước 2: Làm sạch và chia thành chunks
        chunks: List[Dict[str, Any]] = clean_and_chunk_text(
            raw_text=raw_text,
            metadata=metadata,
            chunk_size=chunk_size,
            overlap=chunk_overlap,
            min_chunk_length=80,
        )
        logger.info(f"Created {len(chunks)} chunks")

        if not chunks:
            raise ValueError("Không tạo được chunk nào từ tài liệu")

        # Kết quả trả về (sẽ được dùng tiếp ở rag_pipeline.py hoặc API)
        return {
            "status": "success",
            "filename": filename,
            "uploader_id": uploader_id,
            "chunk_count": len(chunks),
            "chunks": chunks,                    # list các dict {'text': ..., 'metadata': ...}
            "raw_text_length": len(raw_text),
            "metadata": metadata,
            "message": f"Đã xử lý thành công {filename} thành {len(chunks)} chunk"
        }

    except Exception as e:
        logger.error(f"Error processing {filename}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi xử lý tài liệu {filename}: {str(e)}"
        ) from e


# Hàm tiện ích (dùng khi debug hoặc test riêng)
def process_document_sync(file_content: bytes, filename: str, uploader_id: int | str) -> Dict[str, Any]:
    """Phiên bản đồng bộ để test nhanh trong console"""
    import asyncio
    return asyncio.run(process_uploaded_document(file_content, filename, uploader_id))

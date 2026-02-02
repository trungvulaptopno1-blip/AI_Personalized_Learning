# backend/api/upload_router.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import logging

from agents.content_agent import process_uploaded_document
from agents.content_agent.rag_pipeline import process_rag_pipeline

router = APIRouter(prefix="/api", tags=["upload"])
logger = logging.getLogger(__name__)

@router.post("/upload/documents")
async def upload_documents(
    files: List[UploadFile] = File(...),
    # current_user = Depends(get_current_user)  # thêm auth sau
):
    """
    Nhận nhiều file → xử lý từng file qua Content Agent → embedding & lưu vector
    """
    if not files:
        raise HTTPException(status_code=400, detail="Không có file nào được gửi lên")

    results = []
    errors = []

    for file in files:
        try:
            content = await file.read()

            # Bước 1: Extract + Chunk
            extract_result = await process_uploaded_document(
                file_content=content,
                filename=file.filename,
                uploader_id="guest_user"  # thay bằng current_user.id sau khi có auth
            )

            # Bước 2: Embedding + lưu vector DB
            rag_result = await process_rag_pipeline(extract_result)

            results.append({
                "filename": file.filename,
                "status": "success",
                "chunks": extract_result["chunk_count"],
                "collection_name": rag_result["full_result"]["collection_name"],
                "message": rag_result["full_result"]["message"]
            })

        except Exception as e:
            logger.error(f"Upload error {file.filename}: {e}")
            errors.append({
                "filename": file.filename,
                "status": "error",
                "message": str(e)
            })

    return {
        "total_files": len(files),
        "successful": len(results),
        "failed": len(errors),
        "results": results,
        "errors": errors
    }
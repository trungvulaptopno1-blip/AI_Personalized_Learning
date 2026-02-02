# agents/content_agent/utils.py
"""
Hàm tiện ích cho Content Agent:
- Làm sạch văn bản
- Chia nhỏ thành chunks có overlap
"""

import re
import uuid
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

def clean_text(raw_text: str) -> str:
    """Làm sạch văn bản thô trước khi chia chunk"""
    if not raw_text or not raw_text.strip():
        return ""

    # Thay nhiều khoảng trắng thành một
    text = re.sub(r'\s+', ' ', raw_text)

    # Loại bỏ ký tự điều khiển
    text = ''.join(c for c in text if ord(c) >= 32 or c in '\n\t')

    # Loại bỏ khoảng trắng thừa ở đầu/cuối dòng
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    text = '\n'.join(lines)

    # Giảm lặp ký tự đặc biệt
    text = re.sub(r'([!?.]){2,}', r'\1', text)

    return text.strip()


def clean_and_chunk_text(
    raw_text: str,
    metadata: Dict[str, Any],
    chunk_size: int = 600,
    overlap: int = 120,
    min_chunk_length: int = 80,
) -> List[Dict[str, Any]]:
    """
    Làm sạch văn bản và chia thành các chunk có overlap
    
    Returns:
        List[Dict]: [{'text': str, 'metadata': dict}, ...]
    """
    if not raw_text:
        return []

    cleaned = clean_text(raw_text)
    if len(cleaned) < min_chunk_length:
        logger.warning(f"Text too short after cleaning: {len(cleaned)} chars")
        return []

    chunks = []
    start = 0
    chunk_index = 0

    while start < len(cleaned):
        end = min(start + chunk_size, len(cleaned))

        # Cố gắng cắt ở ranh giới câu/đoạn hợp lý
        if end < len(cleaned):
            last_period = cleaned.rfind('. ', start, end)
            if last_period > start + 100:
                end = last_period + 1
            else:
                last_space = cleaned.rfind(' ', start, end)
                if last_space > start + 50:
                    end = last_space + 1

        chunk_text = cleaned[start:end].strip()

        if len(chunk_text) >= min_chunk_length:
            chunk_meta = metadata.copy()
            chunk_meta.update({
                "chunk_index": chunk_index,
                "chunk_uuid": str(uuid.uuid4()),
                "start_pos": start,
                "end_pos": end,
                "length": len(chunk_text),
            })

            chunks.append({
                "text": chunk_text,
                "metadata": chunk_meta
            })
            chunk_index += 1

        start = end - overlap
        if start >= len(cleaned):
            break

    logger.info(f"Created {len(chunks)} chunks (size={chunk_size}, overlap={overlap})")
    return chunks
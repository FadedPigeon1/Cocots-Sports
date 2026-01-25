from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.services.data_fetcher import get_current_standings

router = APIRouter()


@router.get("/standings")
async def read_standings() -> List[Dict[str, Any]]:
    """
    Get current NBA standings
    """
    try:
        standings = await get_current_standings()
        if not standings:
            return []
        return standings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

import asyncio
import io

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from PIL import UnidentifiedImageError

from app.services.svg_processing import optimize_svg, raster_to_svg, svg_to_png

router = APIRouter()


@router.post("/optimize")
async def optimize(file: UploadFile = File(...)) -> StreamingResponse:
    input_bytes = await file.read()
    try:
        output_bytes = await asyncio.to_thread(optimize_svg, input_bytes)
    except Exception:
        raise HTTPException(status_code=400, detail="Fichier SVG invalide")
    return StreamingResponse(io.BytesIO(output_bytes), media_type="image/svg+xml")


@router.post("/convert")
async def convert(
    file: UploadFile = File(...), direction: str = Form(...), width: int | None = Form(None)
) -> StreamingResponse:
    input_bytes = await file.read()
    if direction == "svg-to-png":
        try:
            output_bytes = await asyncio.to_thread(svg_to_png, input_bytes, width)
        except Exception:
            raise HTTPException(status_code=400, detail="Fichier SVG invalide")
        return StreamingResponse(io.BytesIO(output_bytes), media_type="image/png")
    if direction == "png-to-svg":
        try:
            output_bytes = await asyncio.to_thread(raster_to_svg, input_bytes)
        except UnidentifiedImageError:
            raise HTTPException(status_code=400, detail="Fichier image invalide")
        return StreamingResponse(io.BytesIO(output_bytes), media_type="image/svg+xml")
    raise HTTPException(status_code=400, detail=f"Direction inconnue: {direction}")

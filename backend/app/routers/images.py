import io
import zipfile

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from PIL import UnidentifiedImageError

from app.services.image_processing import compress_image, convert_image, match_colors

router = APIRouter()


@router.post("/compress")
async def compress(image: UploadFile = File(...), quality: int = Form(80)) -> StreamingResponse:
    input_bytes = await image.read()
    try:
        output_bytes, media_type = compress_image(input_bytes, quality)
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Fichier image invalide")
    return StreamingResponse(io.BytesIO(output_bytes), media_type=media_type)


@router.post("/convert")
async def convert(image: UploadFile = File(...), target_format: str = Form(...)) -> StreamingResponse:
    input_bytes = await image.read()
    try:
        output_bytes, media_type = convert_image(input_bytes, target_format)
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Fichier image invalide")
    return StreamingResponse(io.BytesIO(output_bytes), media_type=media_type)


@router.post("/color-match")
async def color_match(
    reference: UploadFile = File(...), images: list[UploadFile] = File(...)
) -> StreamingResponse:
    reference_bytes = await reference.read()
    zip_buffer = io.BytesIO()
    try:
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            for img in images:
                img_bytes = await img.read()
                matched_bytes = match_colors(reference_bytes, img_bytes)
                zip_file.writestr(img.filename or "image", matched_bytes)
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Fichier image invalide")
    zip_buffer.seek(0)
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=matched_images.zip"},
    )

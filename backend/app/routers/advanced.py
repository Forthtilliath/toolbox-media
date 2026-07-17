import io

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from PIL import UnidentifiedImageError

from app.routers._common import media_type_of
from app.services.image_advanced import (
    denoise_image,
    deskew_image,
    extract_exif,
    generate_contact_sheet,
    strip_exif,
)

router = APIRouter()


@router.post("/strip-exif")
async def strip_exif_endpoint(image: UploadFile = File(...)) -> StreamingResponse:
    input_bytes = await image.read()
    try:
        output_bytes = strip_exif(input_bytes)
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Fichier image invalide")
    return StreamingResponse(io.BytesIO(output_bytes), media_type=media_type_of(input_bytes))


@router.post("/extract-exif")
async def extract_exif_endpoint(image: UploadFile = File(...)) -> dict[str, dict[str, object]]:
    input_bytes = await image.read()
    try:
        metadata = extract_exif(input_bytes)
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Fichier image invalide")
    return {"metadata": metadata}


@router.post("/deskew")
async def deskew_endpoint(image: UploadFile = File(...)) -> StreamingResponse:
    input_bytes = await image.read()
    try:
        output_bytes = deskew_image(input_bytes)
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Fichier image invalide")
    return StreamingResponse(io.BytesIO(output_bytes), media_type=media_type_of(input_bytes))


@router.post("/denoise")
async def denoise_endpoint(image: UploadFile = File(...), strength: int = Form(10)) -> StreamingResponse:
    input_bytes = await image.read()
    try:
        output_bytes = denoise_image(input_bytes, strength)
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Fichier image invalide")
    return StreamingResponse(io.BytesIO(output_bytes), media_type=media_type_of(input_bytes))


@router.post("/contact-sheet")
async def contact_sheet_endpoint(
    images: list[UploadFile] = File(...), columns: int = Form(4), thumb_size: int = Form(200)
) -> StreamingResponse:
    images_bytes = [await img.read() for img in images]
    try:
        sheet_bytes = generate_contact_sheet(images_bytes, columns, thumb_size)
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Fichier image invalide")
    return StreamingResponse(io.BytesIO(sheet_bytes), media_type="image/jpeg")

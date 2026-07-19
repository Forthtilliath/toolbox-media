import asyncio
import io

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from PIL import Image, UnidentifiedImageError

from app.routers._common import filenames_of, media_type_of, zip_response
from app.services.image_processing import (
    FORMAT_MEDIA_TYPES,
    RATIO_PRESETS,
    WATERMARK_POSITIONS,
    add_watermark,
    adjust_batch,
    compress_image,
    convert_image,
    crop_image,
    match_colors,
    normalize_brightness,
    ratio_crop_box,
    resize_image,
    rotate_flip_image,
)

router = APIRouter()


@router.post("/compress")
async def compress(image: UploadFile = File(...), quality: int = Form(80)) -> StreamingResponse:
    input_bytes = await image.read()
    try:
        output_bytes, media_type = await asyncio.to_thread(compress_image, input_bytes, quality)
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Fichier image invalide") from None
    return StreamingResponse(io.BytesIO(output_bytes), media_type=media_type)


@router.post("/convert")
async def convert(image: UploadFile = File(...), target_format: str = Form(...)) -> StreamingResponse:
    input_bytes = await image.read()
    try:
        output_bytes, media_type = await asyncio.to_thread(convert_image, input_bytes, target_format)
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Fichier image invalide") from None
    return StreamingResponse(io.BytesIO(output_bytes), media_type=media_type)


@router.post("/color-match")
async def color_match(
    reference: UploadFile = File(...), images: list[UploadFile] = File(...)
) -> StreamingResponse:
    filenames = filenames_of(images)
    reference_bytes = await reference.read()
    images_bytes = [await img.read() for img in images]
    try:
        results = await asyncio.to_thread(
            lambda: [match_colors(reference_bytes, data) for data in images_bytes]
        )
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Fichier image invalide") from None
    return zip_response(filenames, results, "matched_images.zip")


@router.post("/normalize-brightness")
async def normalize_brightness_endpoint(
    images: list[UploadFile] = File(...), reference: UploadFile | None = File(None)
) -> StreamingResponse:
    filenames = filenames_of(images)
    images_bytes = [await img.read() for img in images]
    reference_bytes = await reference.read() if reference is not None else None
    try:
        results = await asyncio.to_thread(normalize_brightness, images_bytes, reference_bytes)
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Fichier image invalide") from None
    return zip_response(filenames, results, "normalized_images.zip")


@router.post("/crop")
async def crop(
    image: UploadFile = File(...),
    ratio: str | None = Form(None),
    x: int | None = Form(None),
    y: int | None = Form(None),
    width: int | None = Form(None),
    height: int | None = Form(None),
) -> StreamingResponse:
    input_bytes = await image.read()
    try:
        source = Image.open(io.BytesIO(input_bytes))
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Fichier image invalide") from None

    if ratio is not None:
        if ratio not in RATIO_PRESETS:
            raise HTTPException(status_code=400, detail=f"Ratio inconnu: {ratio}")
        box = ratio_crop_box(*source.size, ratio)
    elif None not in (x, y, width, height):
        box = (x, y, x + width, y + height)
    else:
        raise HTTPException(status_code=400, detail="Fournir soit ratio, soit x/y/width/height")

    output_bytes = await asyncio.to_thread(crop_image, input_bytes, box)
    media_type = FORMAT_MEDIA_TYPES.get((source.format or "").lower(), "application/octet-stream")
    return StreamingResponse(io.BytesIO(output_bytes), media_type=media_type)


@router.post("/resize")
async def resize(
    image: UploadFile = File(...),
    width: int | None = Form(None),
    height: int | None = Form(None),
    percent: float | None = Form(None),
    keep_ratio: bool = Form(True),
) -> StreamingResponse:
    input_bytes = await image.read()
    if percent is None and width is None and height is None:
        raise HTTPException(status_code=400, detail="Fournir percent, ou width/height")
    try:
        output_bytes = await asyncio.to_thread(resize_image, input_bytes, width, height, percent, keep_ratio)
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Fichier image invalide") from None
    return StreamingResponse(io.BytesIO(output_bytes), media_type=media_type_of(input_bytes))


@router.post("/rotate-flip")
async def rotate_flip(
    image: UploadFile = File(...),
    angle: float = Form(0),
    flip_horizontal: bool = Form(False),
    flip_vertical: bool = Form(False),
) -> StreamingResponse:
    input_bytes = await image.read()
    try:
        output_bytes = await asyncio.to_thread(
            rotate_flip_image, input_bytes, angle, flip_horizontal, flip_vertical
        )
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Fichier image invalide") from None
    return StreamingResponse(io.BytesIO(output_bytes), media_type=media_type_of(input_bytes))


@router.post("/watermark")
async def watermark(
    images: list[UploadFile] = File(...),
    text: str | None = Form(None),
    logo: UploadFile | None = File(None),
    opacity: float = Form(50),
    position: str = Form("bottom-right"),
) -> StreamingResponse:
    if not text and logo is None:
        raise HTTPException(status_code=400, detail="Fournir un texte ou un logo")
    if position not in WATERMARK_POSITIONS:
        raise HTTPException(status_code=400, detail=f"Position inconnue: {position}")
    filenames = filenames_of(images)
    images_bytes = [await img.read() for img in images]
    logo_bytes = await logo.read() if logo is not None else None
    try:
        results = await asyncio.to_thread(add_watermark, images_bytes, text, logo_bytes, opacity, position)
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Fichier image invalide") from None
    return zip_response(filenames, results, "watermarked_images.zip")


@router.post("/adjust")
async def adjust(
    images: list[UploadFile] = File(...),
    brightness: float = Form(1.0),
    contrast: float = Form(1.0),
    saturation: float = Form(1.0),
) -> StreamingResponse:
    filenames = filenames_of(images)
    images_bytes = [await img.read() for img in images]
    try:
        results = await asyncio.to_thread(adjust_batch, images_bytes, brightness, contrast, saturation)
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Fichier image invalide") from None
    return zip_response(filenames, results, "adjusted_images.zip")

import asyncio
import io

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from PIL import UnidentifiedImageError

from app.routers._common import filenames_of, zip_response
from app.services.dev_assets import (
    DEFAULT_SRCSET_WIDTHS,
    encode_base64,
    generate_favicon_ico,
    generate_icon_pack,
    generate_lqip,
    generate_placeholder,
    generate_social_formats,
    generate_spritesheet,
    generate_srcset,
)

router = APIRouter()


@router.post("/favicon")
async def favicon(image: UploadFile = File(...)) -> StreamingResponse:
    input_bytes = await image.read()
    try:
        output_bytes = await asyncio.to_thread(generate_favicon_ico, input_bytes)
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Fichier image invalide") from None
    return StreamingResponse(io.BytesIO(output_bytes), media_type="image/x-icon")


@router.post("/icon-pack")
async def icon_pack(image: UploadFile = File(...)) -> StreamingResponse:
    input_bytes = await image.read()
    try:
        files = await asyncio.to_thread(generate_icon_pack, input_bytes)
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Fichier image invalide") from None
    return zip_response([name for name, _ in files], [data for _, data in files], "icon_pack.zip")


@router.post("/srcset")
async def srcset(
    image: UploadFile = File(...), widths: str = Form(",".join(map(str, DEFAULT_SRCSET_WIDTHS)))
) -> StreamingResponse:
    input_bytes = await image.read()
    try:
        width_list = [int(w.strip()) for w in widths.split(",") if w.strip()]
    except ValueError:
        raise HTTPException(status_code=400, detail="Largeurs invalides") from None
    if not width_list:
        raise HTTPException(status_code=400, detail="Fournir au moins une largeur")
    if any(w < 1 for w in width_list):
        raise HTTPException(status_code=400, detail="Les largeurs doivent être supérieures à 0")
    try:
        files, srcset_attr = await asyncio.to_thread(generate_srcset, input_bytes, width_list)
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Fichier image invalide") from None
    names = [name for name, _ in files] + ["srcset.txt"]
    contents = [data for _, data in files] + [srcset_attr.encode("utf-8")]
    return zip_response(names, contents, "srcset_images.zip")


@router.post("/lqip")
async def lqip(image: UploadFile = File(...)) -> dict[str, str]:
    input_bytes = await image.read()
    try:
        data_uri = await asyncio.to_thread(generate_lqip, input_bytes)
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Fichier image invalide") from None
    return {"data_uri": data_uri}


@router.post("/base64")
async def base64_encode(image: UploadFile = File(...)) -> dict[str, str]:
    input_bytes = await image.read()
    try:
        data_uri = await asyncio.to_thread(encode_base64, input_bytes)
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Fichier image invalide") from None
    return {"data_uri": data_uri}


@router.post("/spritesheet")
async def spritesheet(images: list[UploadFile] = File(...)) -> StreamingResponse:
    filenames = filenames_of(images)
    images_bytes = [await img.read() for img in images]
    try:
        sprite_png, css = await asyncio.to_thread(generate_spritesheet, images_bytes, filenames)
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Fichier image invalide") from None
    return zip_response(["sprite.png", "sprite.css"], [sprite_png, css.encode("utf-8")], "spritesheet.zip")


@router.post("/social-formats")
async def social_formats(image: UploadFile = File(...)) -> StreamingResponse:
    input_bytes = await image.read()
    try:
        files = await asyncio.to_thread(generate_social_formats, input_bytes)
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Fichier image invalide") from None
    return zip_response([name for name, _ in files], [data for _, data in files], "social_formats.zip")


@router.post("/placeholder")
async def placeholder(
    width: int = Form(800),
    height: int = Form(600),
    bg_color: str = Form("cccccc"),
    text_color: str = Form("969696"),
    text: str | None = Form(None),
) -> StreamingResponse:
    if width < 1 or height < 1:
        raise HTTPException(status_code=400, detail="width et height doivent être supérieurs ou égaux à 1")
    try:
        image_bytes = await asyncio.to_thread(generate_placeholder, width, height, bg_color, text_color, text)
    except ValueError:
        raise HTTPException(status_code=400, detail="Couleur invalide (format hexadécimal attendu)") from None
    return StreamingResponse(io.BytesIO(image_bytes), media_type="image/png")

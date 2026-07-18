from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from PIL import UnidentifiedImageError

from app.services.image_analysis import compare_images, extract_palette

router = APIRouter()


@router.post("/palette")
async def palette(image: UploadFile = File(...), num_colors: int = Form(5)) -> dict[str, list]:
    if num_colors < 2:
        raise HTTPException(status_code=400, detail="num_colors doit être supérieur ou égal à 2")
    input_bytes = await image.read()
    try:
        colors = extract_palette(input_bytes, num_colors)
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Fichier image invalide")
    return {"colors": colors}


@router.post("/compare")
async def compare(image_a: UploadFile = File(...), image_b: UploadFile = File(...)) -> dict[str, object]:
    bytes_a = await image_a.read()
    bytes_b = await image_b.read()
    try:
        data_uri, score = compare_images(bytes_a, bytes_b)
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Fichier image invalide")
    return {"data_uri": data_uri, "similarity": score}

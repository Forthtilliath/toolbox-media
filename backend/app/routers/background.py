import io

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from PIL import UnidentifiedImageError

from app.services.background_removal import remove_background

router = APIRouter()


@router.post("/remove")
async def remove_bg(image: UploadFile = File(...), alpha_matting: bool = Form(False)) -> StreamingResponse:
    input_bytes = await image.read()
    try:
        output_bytes = remove_background(input_bytes, alpha_matting)
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Fichier image invalide")
    return StreamingResponse(io.BytesIO(output_bytes), media_type="image/png")

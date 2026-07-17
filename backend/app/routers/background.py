import io

from fastapi import APIRouter, File, Form, UploadFile
from fastapi.responses import StreamingResponse

from app.services.background_removal import remove_background

router = APIRouter()


@router.post("/remove")
async def remove_bg(image: UploadFile = File(...), alpha_matting: bool = Form(False)) -> StreamingResponse:
    input_bytes = await image.read()
    output_bytes = remove_background(input_bytes, alpha_matting)
    return StreamingResponse(io.BytesIO(output_bytes), media_type="image/png")

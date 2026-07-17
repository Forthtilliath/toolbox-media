import io

from fastapi import APIRouter, File, UploadFile
from fastapi.responses import StreamingResponse

from app.services.background_removal import remove_background

router = APIRouter()


@router.post("/remove")
async def remove_bg(image: UploadFile = File(...)) -> StreamingResponse:
    input_bytes = await image.read()
    output_bytes = remove_background(input_bytes)
    return StreamingResponse(io.BytesIO(output_bytes), media_type="image/png")

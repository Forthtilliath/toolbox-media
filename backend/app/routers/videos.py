import os
import subprocess

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask

from app.services.video_processing import trim_video, video_to_gif

router = APIRouter()


def _cleanup(path: str) -> None:
    if os.path.exists(path):
        os.remove(path)


@router.post("/trim")
async def trim(
    video: UploadFile = File(...), start: float = Form(...), end: float = Form(...)
) -> FileResponse:
    input_bytes = await video.read()
    suffix = os.path.splitext(video.filename or "")[1] or ".mp4"
    try:
        output_path = trim_video(input_bytes, start, end, suffix)
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=400, detail=e.stderr.decode(errors="ignore"))
    return FileResponse(
        output_path,
        media_type="video/mp4",
        filename=f"trimmed{suffix}",
        background=BackgroundTask(_cleanup, output_path),
    )


@router.post("/to-gif")
async def to_gif(
    video: UploadFile = File(...),
    start: float = Form(0),
    duration: float = Form(...),
    fps: int = Form(12),
    width: int = Form(480),
) -> FileResponse:
    input_bytes = await video.read()
    try:
        output_path = video_to_gif(input_bytes, start, duration, fps, width)
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=400, detail=e.stderr.decode(errors="ignore"))
    return FileResponse(
        output_path,
        media_type="image/gif",
        filename="output.gif",
        background=BackgroundTask(_cleanup, output_path),
    )

import io
import os
import subprocess

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse, StreamingResponse
from starlette.background import BackgroundTask

from app.services.video_processing import (
    AUDIO_CODECS,
    VIDEO_CODECS,
    burn_subtitles,
    change_speed,
    compress_video,
    concat_videos,
    convert_video_format,
    create_seamless_loop,
    extract_audio,
    extract_frame,
    generate_waveform,
    remove_audio,
    replace_audio,
    trim_video,
    video_to_gif,
)

router = APIRouter()


def _cleanup(path: str) -> None:
    if os.path.exists(path):
        os.remove(path)


def _suffix_of(filename: str | None) -> str:
    return os.path.splitext(filename or "")[1] or ".mp4"


@router.post("/trim")
async def trim(
    video: UploadFile = File(...), start: float = Form(...), end: float = Form(...)
) -> FileResponse:
    input_bytes = await video.read()
    suffix = _suffix_of(video.filename)
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


@router.post("/convert")
async def convert(video: UploadFile = File(...), target_format: str = Form(...)) -> FileResponse:
    if target_format not in VIDEO_CODECS:
        raise HTTPException(status_code=400, detail=f"Format inconnu: {target_format}")
    input_bytes = await video.read()
    try:
        output_path = convert_video_format(input_bytes, _suffix_of(video.filename), target_format)
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=400, detail=e.stderr.decode(errors="ignore"))
    return FileResponse(
        output_path,
        media_type=f"video/{target_format}",
        filename=f"converted.{target_format}",
        background=BackgroundTask(_cleanup, output_path),
    )


@router.post("/compress")
async def compress(
    video: UploadFile = File(...), bitrate_kbps: int | None = Form(None), width: int | None = Form(None)
) -> FileResponse:
    if bitrate_kbps is None and width is None:
        raise HTTPException(status_code=400, detail="Fournir bitrate_kbps et/ou width")
    input_bytes = await video.read()
    suffix = _suffix_of(video.filename)
    try:
        output_path = compress_video(input_bytes, suffix, bitrate_kbps, width)
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=400, detail=e.stderr.decode(errors="ignore"))
    return FileResponse(
        output_path,
        media_type="video/mp4",
        filename=f"compressed{suffix}",
        background=BackgroundTask(_cleanup, output_path),
    )


@router.post("/extract-frame")
async def extract_frame_endpoint(
    video: UploadFile = File(...), timestamp: float = Form(0)
) -> StreamingResponse:
    input_bytes = await video.read()
    try:
        frame_bytes = extract_frame(input_bytes, _suffix_of(video.filename), timestamp)
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=400, detail=e.stderr.decode(errors="ignore"))
    return StreamingResponse(io.BytesIO(frame_bytes), media_type="image/png")


@router.post("/concat")
async def concat(videos: list[UploadFile] = File(...)) -> FileResponse:
    if len(videos) < 2:
        raise HTTPException(status_code=400, detail="Fournir au moins 2 extraits")
    suffixes = [_suffix_of(v.filename) for v in videos]
    clips_bytes = [await v.read() for v in videos]
    try:
        output_path = concat_videos(clips_bytes, suffixes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=400, detail=e.stderr.decode(errors="ignore"))
    return FileResponse(
        output_path,
        media_type="video/mp4",
        filename="concatenated.mp4",
        background=BackgroundTask(_cleanup, output_path),
    )


@router.post("/audio-track")
async def audio_track(
    video: UploadFile = File(...), action: str = Form(...), audio: UploadFile | None = File(None)
) -> FileResponse:
    input_bytes = await video.read()
    suffix = _suffix_of(video.filename)
    if action == "remove":
        try:
            output_path = remove_audio(input_bytes, suffix)
        except subprocess.CalledProcessError as e:
            raise HTTPException(status_code=400, detail=e.stderr.decode(errors="ignore"))
    elif action == "replace":
        if audio is None:
            raise HTTPException(status_code=400, detail="Fournir un fichier audio")
        audio_bytes = await audio.read()
        try:
            output_path = replace_audio(input_bytes, suffix, audio_bytes, _suffix_of(audio.filename))
        except subprocess.CalledProcessError as e:
            raise HTTPException(status_code=400, detail=e.stderr.decode(errors="ignore"))
    else:
        raise HTTPException(status_code=400, detail=f"Action inconnue: {action}")
    return FileResponse(
        output_path,
        media_type="video/mp4",
        filename=f"audio_track{suffix}",
        background=BackgroundTask(_cleanup, output_path),
    )


@router.post("/extract-audio")
async def extract_audio_endpoint(
    video: UploadFile = File(...), target_format: str = Form("mp3")
) -> FileResponse:
    if target_format not in AUDIO_CODECS:
        raise HTTPException(status_code=400, detail=f"Format inconnu: {target_format}")
    input_bytes = await video.read()
    try:
        output_path = extract_audio(input_bytes, _suffix_of(video.filename), target_format)
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=400, detail=e.stderr.decode(errors="ignore"))
    return FileResponse(
        output_path,
        media_type=f"audio/{target_format}",
        filename=f"audio.{target_format}",
        background=BackgroundTask(_cleanup, output_path),
    )


@router.post("/speed")
async def speed_endpoint(video: UploadFile = File(...), speed: float = Form(...)) -> FileResponse:
    if not 0.5 <= speed <= 2.0:
        raise HTTPException(status_code=400, detail="La vitesse doit être comprise entre 0.5 et 2.0")
    input_bytes = await video.read()
    suffix = _suffix_of(video.filename)
    try:
        output_path = change_speed(input_bytes, suffix, speed)
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=400, detail=e.stderr.decode(errors="ignore"))
    return FileResponse(
        output_path,
        media_type="video/mp4",
        filename=f"speed{suffix}",
        background=BackgroundTask(_cleanup, output_path),
    )


@router.post("/subtitles")
async def subtitles_endpoint(video: UploadFile = File(...), srt: UploadFile = File(...)) -> FileResponse:
    input_bytes = await video.read()
    srt_bytes = await srt.read()
    suffix = _suffix_of(video.filename)
    try:
        output_path = burn_subtitles(input_bytes, suffix, srt_bytes)
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=400, detail=e.stderr.decode(errors="ignore"))
    return FileResponse(
        output_path,
        media_type="video/mp4",
        filename=f"sous-titres{suffix}",
        background=BackgroundTask(_cleanup, output_path),
    )


@router.post("/loop")
async def loop_endpoint(video: UploadFile = File(...), fade_duration: float = Form(1.0)) -> FileResponse:
    input_bytes = await video.read()
    suffix = _suffix_of(video.filename)
    try:
        output_path = create_seamless_loop(input_bytes, suffix, fade_duration)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=400, detail=e.stderr.decode(errors="ignore"))
    return FileResponse(
        output_path,
        media_type="video/mp4",
        filename="loop.mp4",
        background=BackgroundTask(_cleanup, output_path),
    )


@router.post("/waveform")
async def waveform_endpoint(
    video: UploadFile = File(...), width: int = Form(1280), height: int = Form(240)
) -> StreamingResponse:
    input_bytes = await video.read()
    try:
        image_bytes = generate_waveform(input_bytes, _suffix_of(video.filename), width, height)
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=400, detail=e.stderr.decode(errors="ignore"))
    return StreamingResponse(io.BytesIO(image_bytes), media_type="image/png")

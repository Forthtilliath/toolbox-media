import io
import zipfile

from fastapi import UploadFile
from fastapi.responses import StreamingResponse
from PIL import Image

from app.services.image_processing import FORMAT_MEDIA_TYPES


def filenames_of(images: list[UploadFile]) -> list[str]:
    return [img.filename or f"image_{i}.png" for i, img in enumerate(images)]


def media_type_of(data: bytes) -> str:
    fmt = (Image.open(io.BytesIO(data)).format or "").lower()
    return FORMAT_MEDIA_TYPES.get(fmt, "application/octet-stream")


def _safe_zip_entry_name(filename: str) -> str:
    # Uploaded filenames (and misc.rename's user-supplied pattern, which can
    # embed one via {name}) are attacker-controlled. Collapsing to just the
    # final path segment — checking both separators, since the server's OS
    # isn't necessarily the client's — prevents a crafted name like
    # "../../etc/cron.d/x" from writing outside the archive root.
    name = filename.replace("\\", "/").split("/")[-1]
    return name or "file"


def zip_response(filenames: list[str], contents: list[bytes], download_name: str) -> StreamingResponse:
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for filename, data in zip(filenames, contents, strict=True):
            zip_file.writestr(_safe_zip_entry_name(filename), data)
    zip_buffer.seek(0)
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={download_name}"},
    )

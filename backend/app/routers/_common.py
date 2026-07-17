import io
import zipfile

from fastapi import UploadFile
from fastapi.responses import StreamingResponse


def filenames_of(images: list[UploadFile]) -> list[str]:
    return [img.filename or f"image_{i}.png" for i, img in enumerate(images)]


def zip_response(filenames: list[str], contents: list[bytes], download_name: str) -> StreamingResponse:
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for filename, data in zip(filenames, contents):
            zip_file.writestr(filename, data)
    zip_buffer.seek(0)
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={download_name}"},
    )

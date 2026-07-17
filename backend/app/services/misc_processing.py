import io
import os

import fitz
import qrcode
from PIL import Image


def generate_qrcode(data: str, box_size: int) -> bytes:
    qr = qrcode.QRCode(box_size=box_size, border=2)
    qr.add_data(data)
    qr.make(fit=True)
    image = qr.make_image(fill_color="black", back_color="white")
    output = io.BytesIO()
    image.save(output, format="PNG")
    return output.getvalue()


def images_to_pdf(images_bytes: list[bytes]) -> bytes:
    images = [Image.open(io.BytesIO(data)).convert("RGB") for data in images_bytes]
    output = io.BytesIO()
    images[0].save(output, format="PDF", save_all=True, append_images=images[1:])
    return output.getvalue()


def pdf_to_images(pdf_bytes: bytes, dpi: int) -> list[bytes]:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    zoom = dpi / 72
    matrix = fitz.Matrix(zoom, zoom)
    try:
        return [page.get_pixmap(matrix=matrix).tobytes("png") for page in doc]
    finally:
        doc.close()


def rename_batch(filenames: list[str], pattern: str, start: int) -> list[str]:
    used: set[str] = set()
    results = []
    for i, filename in enumerate(filenames):
        stem, ext = os.path.splitext(filename)
        ext = ext.lstrip(".")
        new_name = pattern.format(n=start + i, name=stem, ext=ext)
        if "." not in new_name and ext:
            new_name = f"{new_name}.{ext}"

        if new_name in used:
            base, dot, extension = new_name.rpartition(".")
            candidate = new_name
            counter = 2
            while candidate in used:
                candidate = f"{base}-{counter}.{extension}" if dot else f"{new_name}-{counter}"
                counter += 1
            new_name = candidate

        used.add(new_name)
        results.append(new_name)
    return results

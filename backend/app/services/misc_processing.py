import hashlib
import io
import os
import string

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


def merge_pdfs(pdfs_bytes: list[bytes]) -> bytes:
    merged = fitz.open()
    try:
        for data in pdfs_bytes:
            doc = fitz.open(stream=data, filetype="pdf")
            merged.insert_pdf(doc)
            doc.close()
        return merged.write()
    finally:
        merged.close()


def compress_pdf(pdf_bytes: bytes) -> bytes:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    try:
        return doc.write(garbage=4, deflate=True, deflate_images=True, deflate_fonts=True)
    finally:
        doc.close()


def compute_hashes(data: bytes) -> dict[str, str]:
    return {"md5": hashlib.md5(data).hexdigest(), "sha256": hashlib.sha256(data).hexdigest()}


def _parse_hex_color(value: str) -> tuple[int, int, int]:
    value = value.lstrip("#")
    if len(value) == 3:
        value = "".join(c * 2 for c in value)
    return (int(value[0:2], 16), int(value[2:4], 16), int(value[4:6], 16))


def _relative_luminance(rgb: tuple[int, int, int]) -> float:
    def channel(value: int) -> float:
        c = value / 255
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4

    r, g, b = rgb
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)


def contrast_ratio(color_a: str, color_b: str) -> dict[str, object]:
    luminance_a = _relative_luminance(_parse_hex_color(color_a))
    luminance_b = _relative_luminance(_parse_hex_color(color_b))
    lighter, darker = max(luminance_a, luminance_b), min(luminance_a, luminance_b)
    ratio = (lighter + 0.05) / (darker + 0.05)
    return {
        "ratio": round(ratio, 2),
        "aa_normal_text": ratio >= 4.5,
        "aa_large_text": ratio >= 3.0,
        "aaa_normal_text": ratio >= 7.0,
        "aaa_large_text": ratio >= 4.5,
    }


class _SafeFormatter(string.Formatter):
    # str.format's field-name grammar also allows attribute/item access
    # (e.g. "{n.__class__.__mro__}"), which lets a user-supplied pattern pull
    # arbitrary attributes off the values we pass in. Rejecting anything but
    # a bare allowed name closes that off while keeping "{n:03d}" etc. working
    # ("n" is the field name; ":03d" is a separate format spec untouched here).
    _ALLOWED_FIELDS = {"n", "name", "ext"}

    def get_field(self, field_name, args, kwargs):
        if field_name not in self._ALLOWED_FIELDS:
            raise KeyError(field_name)
        return super().get_field(field_name, args, kwargs)


_safe_formatter = _SafeFormatter()


def rename_batch(filenames: list[str], pattern: str, start: int) -> list[str]:
    used: set[str] = set()
    results = []
    for i, filename in enumerate(filenames):
        stem, ext = os.path.splitext(filename)
        ext = ext.lstrip(".")
        new_name = _safe_formatter.format(pattern, n=start + i, name=stem, ext=ext)
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

import io

import numpy as np
from PIL import Image
from skimage.exposure import match_histograms

FORMAT_MEDIA_TYPES = {
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "webp": "image/webp",
}


def compress_image(input_bytes: bytes, quality: int) -> tuple[bytes, str]:
    image = Image.open(io.BytesIO(input_bytes))
    fmt = (image.format or "JPEG").upper()
    if fmt == "JPEG" and image.mode in ("RGBA", "P"):
        image = image.convert("RGB")
    save_kwargs: dict[str, object] = {"optimize": True}
    if fmt in ("JPEG", "WEBP"):
        save_kwargs["quality"] = quality
    output = io.BytesIO()
    image.save(output, format=fmt, **save_kwargs)
    output.seek(0)
    media_type = FORMAT_MEDIA_TYPES.get(fmt.lower(), "application/octet-stream")
    return output.getvalue(), media_type


def convert_image(input_bytes: bytes, target_format: str) -> tuple[bytes, str]:
    image = Image.open(io.BytesIO(input_bytes))
    target_format = "JPEG" if target_format.upper() == "JPG" else target_format.upper()
    if target_format == "JPEG" and image.mode in ("RGBA", "P"):
        image = image.convert("RGB")
    output = io.BytesIO()
    image.save(output, format=target_format)
    output.seek(0)
    media_type = FORMAT_MEDIA_TYPES.get(target_format.lower(), "application/octet-stream")
    return output.getvalue(), media_type


def match_colors(reference_bytes: bytes, image_bytes: bytes) -> bytes:
    reference = np.array(Image.open(io.BytesIO(reference_bytes)).convert("RGB"))
    source_image = Image.open(io.BytesIO(image_bytes))
    original_format = source_image.format or "PNG"
    source = np.array(source_image.convert("RGB"))
    matched = match_histograms(source, reference, channel_axis=-1)
    matched_image = Image.fromarray(np.clip(matched, 0, 255).astype(np.uint8))
    output = io.BytesIO()
    matched_image.save(output, format=original_format)
    output.seek(0)
    return output.getvalue()

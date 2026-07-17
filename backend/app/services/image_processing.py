import io

import numpy as np
from PIL import Image
from skimage.color import lab2rgb, rgb2lab
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


def _mean_luminance(rgb: np.ndarray) -> float:
    return float(rgb2lab(rgb / 255.0)[:, :, 0].mean())


def _shift_luminance(rgb: np.ndarray, delta: float) -> np.ndarray:
    lab = rgb2lab(rgb / 255.0)
    lab[:, :, 0] = np.clip(lab[:, :, 0] + delta, 0, 100)
    shifted = np.clip(lab2rgb(lab) * 255.0, 0, 255)
    return shifted.astype(np.uint8)


def normalize_brightness(images_bytes: list[bytes], reference_bytes: bytes | None) -> list[bytes]:
    # Shifting only the LAB L channel (luminance) keeps hue/saturation untouched, unlike
    # match_colors' full histogram match which reshapes the whole color distribution.
    decoded = []
    for data in images_bytes:
        image = Image.open(io.BytesIO(data))
        original_format = image.format or "PNG"
        decoded.append((np.array(image.convert("RGB")), original_format))

    means = [_mean_luminance(rgb) for rgb, _ in decoded]
    if reference_bytes is not None:
        reference_rgb = np.array(Image.open(io.BytesIO(reference_bytes)).convert("RGB"))
        target = _mean_luminance(reference_rgb)
    else:
        target = sum(means) / len(means)

    results = []
    for (rgb, fmt), mean in zip(decoded, means):
        adjusted = _shift_luminance(rgb, target - mean)
        output = io.BytesIO()
        Image.fromarray(adjusted).save(output, format=fmt)
        output.seek(0)
        results.append(output.getvalue())
    return results

import io

import numpy as np
import pillow_avif  # noqa: F401  (registers the AVIF codec with Pillow)
from PIL import Image, ImageDraw, ImageEnhance, ImageFont
from skimage.color import lab2rgb, rgb2lab
from skimage.exposure import match_histograms

RATIO_PRESETS = {"1:1": (1, 1), "4:3": (4, 3), "16:9": (16, 9)}

WATERMARK_POSITIONS = {"bottom-right", "bottom-left", "top-right", "top-left", "center"}

FORMAT_MEDIA_TYPES = {
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "webp": "image/webp",
    "avif": "image/avif",
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


def ratio_crop_box(width: int, height: int, ratio: str) -> tuple[int, int, int, int]:
    ratio_w, ratio_h = RATIO_PRESETS[ratio]
    target_ratio = ratio_w / ratio_h
    current_ratio = width / height
    if current_ratio > target_ratio:
        new_width = round(height * target_ratio)
        left = (width - new_width) // 2
        return (left, 0, left + new_width, height)
    new_height = round(width / target_ratio)
    top = (height - new_height) // 2
    return (0, top, width, top + new_height)


def crop_image(input_bytes: bytes, box: tuple[int, int, int, int]) -> bytes:
    image = Image.open(io.BytesIO(input_bytes))
    fmt = image.format or "PNG"
    cropped = image.crop(box)
    output = io.BytesIO()
    cropped.save(output, format=fmt)
    output.seek(0)
    return output.getvalue()


def resize_image(
    input_bytes: bytes, width: int | None, height: int | None, percent: float | None, keep_ratio: bool
) -> bytes:
    image = Image.open(io.BytesIO(input_bytes))
    fmt = image.format or "PNG"
    orig_w, orig_h = image.size

    if percent is not None:
        new_w = max(1, round(orig_w * percent / 100))
        new_h = max(1, round(orig_h * percent / 100))
    elif keep_ratio:
        if width and height:
            scale = min(width / orig_w, height / orig_h)
        elif width:
            scale = width / orig_w
        elif height:
            scale = height / orig_h
        else:
            scale = 1.0
        new_w = max(1, round(orig_w * scale))
        new_h = max(1, round(orig_h * scale))
    else:
        new_w = width or orig_w
        new_h = height or orig_h

    resized = image.resize((new_w, new_h), Image.LANCZOS)
    output = io.BytesIO()
    resized.save(output, format=fmt)
    output.seek(0)
    return output.getvalue()


def rotate_flip_image(input_bytes: bytes, angle: float, flip_horizontal: bool, flip_vertical: bool) -> bytes:
    image = Image.open(io.BytesIO(input_bytes))
    fmt = image.format or "PNG"
    if flip_horizontal:
        image = image.transpose(Image.FLIP_LEFT_RIGHT)
    if flip_vertical:
        image = image.transpose(Image.FLIP_TOP_BOTTOM)
    if angle:
        # PIL rotates counter-clockwise for a positive angle; negate so positive
        # values match the clockwise convention users expect from photo editors.
        image = image.rotate(-angle, expand=True)
    output = io.BytesIO()
    image.save(output, format=fmt)
    output.seek(0)
    return output.getvalue()


_WATERMARK_MARGIN = 20


def _watermark_position(position: str, canvas_size: tuple[int, int], mark_size: tuple[int, int]) -> tuple[int, int]:
    canvas_w, canvas_h = canvas_size
    mark_w, mark_h = mark_size
    positions = {
        "bottom-right": (canvas_w - mark_w - _WATERMARK_MARGIN, canvas_h - mark_h - _WATERMARK_MARGIN),
        "bottom-left": (_WATERMARK_MARGIN, canvas_h - mark_h - _WATERMARK_MARGIN),
        "top-right": (canvas_w - mark_w - _WATERMARK_MARGIN, _WATERMARK_MARGIN),
        "top-left": (_WATERMARK_MARGIN, _WATERMARK_MARGIN),
        "center": ((canvas_w - mark_w) // 2, (canvas_h - mark_h) // 2),
    }
    return positions[position]


def _build_watermark_layer(
    canvas_size: tuple[int, int], text: str | None, logo_bytes: bytes | None, opacity: float, position: str
) -> Image.Image:
    layer = Image.new("RGBA", canvas_size, (0, 0, 0, 0))
    alpha = round(255 * opacity / 100)

    if logo_bytes is not None:
        logo = Image.open(io.BytesIO(logo_bytes)).convert("RGBA")
        max_logo_w = canvas_size[0] // 4
        if logo.width > max_logo_w:
            scale = max_logo_w / logo.width
            logo = logo.resize((max_logo_w, max(1, round(logo.height * scale))), Image.LANCZOS)
        logo_alpha = logo.split()[-1].point(lambda a: round(a * opacity / 100))
        logo.putalpha(logo_alpha)
        layer.paste(logo, _watermark_position(position, canvas_size, logo.size), logo)
    elif text:
        draw = ImageDraw.Draw(layer)
        font = ImageFont.load_default(size=max(16, canvas_size[0] // 20))
        bbox = draw.textbbox((0, 0), text, font=font)
        text_size = (bbox[2] - bbox[0], bbox[3] - bbox[1])
        xy = _watermark_position(position, canvas_size, text_size)
        draw.text(xy, text, font=font, fill=(255, 255, 255, alpha))

    return layer


def add_watermark(
    images_bytes: list[bytes], text: str | None, logo_bytes: bytes | None, opacity: float, position: str
) -> list[bytes]:
    results = []
    for data in images_bytes:
        image = Image.open(io.BytesIO(data))
        fmt = image.format or "PNG"
        base = image.convert("RGBA")
        layer = _build_watermark_layer(base.size, text, logo_bytes, opacity, position)
        combined = Image.alpha_composite(base, layer)
        if fmt == "JPEG":
            combined = combined.convert("RGB")
        output = io.BytesIO()
        combined.save(output, format=fmt)
        output.seek(0)
        results.append(output.getvalue())
    return results


def _adjust_single(image: Image.Image, brightness: float, contrast: float, saturation: float) -> Image.Image:
    has_alpha = "A" in image.mode
    alpha = image.getchannel("A") if has_alpha else None
    rgb = image.convert("RGB")
    rgb = ImageEnhance.Brightness(rgb).enhance(brightness)
    rgb = ImageEnhance.Contrast(rgb).enhance(contrast)
    rgb = ImageEnhance.Color(rgb).enhance(saturation)
    if has_alpha:
        rgb = rgb.convert("RGBA")
        rgb.putalpha(alpha)
    return rgb


def adjust_batch(images_bytes: list[bytes], brightness: float, contrast: float, saturation: float) -> list[bytes]:
    results = []
    for data in images_bytes:
        image = Image.open(io.BytesIO(data))
        fmt = image.format or "PNG"
        adjusted = _adjust_single(image, brightness, contrast, saturation)
        output = io.BytesIO()
        adjusted.save(output, format=fmt)
        output.seek(0)
        results.append(output.getvalue())
    return results

import base64
import io
import json
import re

from PIL import Image, ImageFilter

from app.services.image_processing import FORMAT_MEDIA_TYPES

ICON_SIZES = [16, 32, 48]
PWA_SIZES = [192, 512]
APPLE_TOUCH_SIZE = 180

DEFAULT_SRCSET_WIDTHS = [320, 640, 960, 1280, 1920]


def generate_favicon_ico(input_bytes: bytes) -> bytes:
    image = Image.open(io.BytesIO(input_bytes)).convert("RGBA")
    output = io.BytesIO()
    image.save(output, format="ICO", sizes=[(s, s) for s in ICON_SIZES])
    output.seek(0)
    return output.getvalue()


def generate_icon_pack(input_bytes: bytes) -> list[tuple[str, bytes]]:
    image = Image.open(io.BytesIO(input_bytes)).convert("RGBA")
    files: list[tuple[str, bytes]] = []

    favicon_output = io.BytesIO()
    image.save(favicon_output, format="ICO", sizes=[(s, s) for s in ICON_SIZES])
    files.append(("favicon.ico", favicon_output.getvalue()))

    apple = image.resize((APPLE_TOUCH_SIZE, APPLE_TOUCH_SIZE), Image.LANCZOS)
    apple_output = io.BytesIO()
    apple.save(apple_output, format="PNG")
    files.append(("apple-touch-icon.png", apple_output.getvalue()))

    manifest_icons = []
    for size in PWA_SIZES:
        resized = image.resize((size, size), Image.LANCZOS)
        output = io.BytesIO()
        resized.save(output, format="PNG")
        filename = f"icon-{size}x{size}.png"
        files.append((filename, output.getvalue()))
        manifest_icons.append({"src": filename, "sizes": f"{size}x{size}", "type": "image/png"})

    manifest = {"name": "App", "icons": manifest_icons}
    files.append(("manifest.json", json.dumps(manifest, indent=2).encode("utf-8")))
    return files


def generate_srcset(input_bytes: bytes, widths: list[int]) -> tuple[list[tuple[str, bytes]], str]:
    image = Image.open(io.BytesIO(input_bytes))
    fmt = image.format or "PNG"
    ext = fmt.lower()
    orig_w, orig_h = image.size

    # Dedupe after clamping: several requested widths can collapse onto the same
    # capped value (never upscale past the source), which would otherwise produce
    # colliding filenames and a repeated entry in the srcset attribute.
    clamped_widths = sorted({min(w, orig_w) for w in widths if w > 0})

    files: list[tuple[str, bytes]] = []
    srcset_parts = []
    for target_w in clamped_widths:
        target_h = max(1, round(orig_h * target_w / orig_w))
        resized = image.resize((target_w, target_h), Image.LANCZOS)
        output = io.BytesIO()
        resized.save(output, format=fmt)
        filename = f"image-{target_w}w.{ext}"
        files.append((filename, output.getvalue()))
        srcset_parts.append(f"{filename} {target_w}w")

    return files, ", ".join(srcset_parts)


def generate_lqip(input_bytes: bytes, width: int = 20) -> str:
    image = Image.open(io.BytesIO(input_bytes)).convert("RGB")
    orig_w, orig_h = image.size
    height = max(1, round(orig_h * width / orig_w))
    small = image.resize((width, height), Image.BILINEAR).filter(ImageFilter.GaussianBlur(radius=2))
    output = io.BytesIO()
    small.save(output, format="JPEG", quality=50)
    encoded = base64.b64encode(output.getvalue()).decode("ascii")
    return f"data:image/jpeg;base64,{encoded}"


def encode_base64(input_bytes: bytes) -> str:
    fmt = (Image.open(io.BytesIO(input_bytes)).format or "").lower()
    mime = FORMAT_MEDIA_TYPES.get(fmt, "application/octet-stream")
    encoded = base64.b64encode(input_bytes).decode("ascii")
    return f"data:{mime};base64,{encoded}"


def _slugify(filename: str) -> str:
    name = filename.rsplit(".", 1)[0]
    return re.sub(r"[^a-zA-Z0-9-]+", "-", name).strip("-").lower() or "icon"


def generate_spritesheet(images_bytes: list[bytes], filenames: list[str]) -> tuple[bytes, str]:
    images = [Image.open(io.BytesIO(data)).convert("RGBA") for data in images_bytes]
    max_height = max(img.height for img in images)
    total_width = sum(img.width for img in images)
    sprite = Image.new("RGBA", (total_width, max_height), (0, 0, 0, 0))

    css_rules = []
    x_offset = 0
    for filename, img in zip(filenames, images):
        sprite.paste(img, (x_offset, 0), img)
        css_rules.append(
            f".icon-{_slugify(filename)} {{ background-image: url('sprite.png'); "
            f"background-position: -{x_offset}px 0; width: {img.width}px; height: {img.height}px; }}"
        )
        x_offset += img.width

    output = io.BytesIO()
    sprite.save(output, format="PNG")
    return output.getvalue(), "\n".join(css_rules)

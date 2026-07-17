import io
import math

import cv2
import numpy as np
from PIL import Image
from PIL.ExifTags import GPSTAGS, TAGS


def strip_exif(input_bytes: bytes) -> bytes:
    image = Image.open(io.BytesIO(input_bytes))
    fmt = image.format or "PNG"
    # Rebuilding the image from raw pixel data (rather than re-saving with exif=b"")
    # drops every metadata block Pillow knows about, not just the EXIF one.
    clean = Image.new(image.mode, image.size)
    clean.putdata(list(image.getdata()))
    output = io.BytesIO()
    clean.save(output, format=fmt)
    output.seek(0)
    return output.getvalue()


def _dms_to_decimal(dms) -> float:
    degrees, minutes, seconds = dms
    return float(degrees) + float(minutes) / 60 + float(seconds) / 3600


def extract_exif(input_bytes: bytes) -> dict[str, object]:
    image = Image.open(io.BytesIO(input_bytes))
    exif = image.getexif()
    result: dict[str, object] = {}
    if not exif:
        return result

    for tag_id, value in exif.items():
        tag = TAGS.get(tag_id, str(tag_id))
        if tag == "GPSInfo":
            continue
        if isinstance(value, bytes):
            value = value.decode(errors="replace")
        result[tag] = value if isinstance(value, (str, int, float)) else str(value)

    gps_ifd = exif.get_ifd(0x8825)  # 0x8825 = ExifTags.IFD.GPSInfo
    if gps_ifd:
        gps = {GPSTAGS.get(tag_id, str(tag_id)): value for tag_id, value in gps_ifd.items()}
        result["GPS"] = {k: str(v) for k, v in gps.items()}
        lat, lat_ref = gps.get("GPSLatitude"), gps.get("GPSLatitudeRef")
        lon, lon_ref = gps.get("GPSLongitude"), gps.get("GPSLongitudeRef")
        if lat and lon:
            latitude = _dms_to_decimal(lat) * (-1 if lat_ref == "S" else 1)
            longitude = _dms_to_decimal(lon) * (-1 if lon_ref == "W" else 1)
            result["gps_decimal"] = {"latitude": latitude, "longitude": longitude}

    return result


def deskew_image(input_bytes: bytes) -> bytes:
    image = Image.open(io.BytesIO(input_bytes))
    fmt = image.format or "PNG"
    rgb = np.array(image.convert("RGB"))
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    coords = np.column_stack(np.where(thresh > 0))

    angle = 0.0
    if coords.size:
        angle = cv2.minAreaRect(coords)[-1]
        angle = -(90 + angle) if angle < -45 else -angle

    height, width = rgb.shape[:2]
    matrix = cv2.getRotationMatrix2D((width // 2, height // 2), angle, 1.0)
    rotated = cv2.warpAffine(rgb, matrix, (width, height), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

    output = io.BytesIO()
    Image.fromarray(rotated).save(output, format=fmt)
    output.seek(0)
    return output.getvalue()


def denoise_image(input_bytes: bytes, strength: int) -> bytes:
    image = Image.open(io.BytesIO(input_bytes))
    fmt = image.format or "PNG"
    rgb = np.array(image.convert("RGB"))
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    denoised = cv2.fastNlMeansDenoisingColored(bgr, None, strength, strength, 7, 21)
    output_image = Image.fromarray(cv2.cvtColor(denoised, cv2.COLOR_BGR2RGB))
    output = io.BytesIO()
    output_image.save(output, format=fmt)
    output.seek(0)
    return output.getvalue()


def generate_contact_sheet(images_bytes: list[bytes], columns: int, thumb_size: int) -> bytes:
    margin = 10
    thumbnails = []
    for data in images_bytes:
        thumb = Image.open(io.BytesIO(data)).convert("RGB")
        thumb.thumbnail((thumb_size, thumb_size))
        canvas = Image.new("RGB", (thumb_size, thumb_size), (240, 240, 240))
        offset = ((thumb_size - thumb.width) // 2, (thumb_size - thumb.height) // 2)
        canvas.paste(thumb, offset)
        thumbnails.append(canvas)

    rows = math.ceil(len(thumbnails) / columns)
    sheet_w = columns * thumb_size + (columns + 1) * margin
    sheet_h = rows * thumb_size + (rows + 1) * margin
    sheet = Image.new("RGB", (sheet_w, sheet_h), (255, 255, 255))
    for index, thumb in enumerate(thumbnails):
        col, row = index % columns, index // columns
        x = margin + col * (thumb_size + margin)
        y = margin + row * (thumb_size + margin)
        sheet.paste(thumb, (x, y))

    output = io.BytesIO()
    sheet.save(output, format="JPEG", quality=90)
    output.seek(0)
    return output.getvalue()

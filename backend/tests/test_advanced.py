import io

import cv2
import numpy as np
from PIL import Image


def test_strip_exif(client, jpeg_with_exif_bytes):
    response = client.post(
        "/api/advanced/strip-exif",
        files={"image": ("photo.jpg", jpeg_with_exif_bytes, "image/jpeg")},
    )
    assert response.status_code == 200
    stripped = Image.open(io.BytesIO(response.content))
    assert not stripped.getexif()


def test_extract_exif(client, jpeg_with_exif_bytes):
    response = client.post(
        "/api/advanced/extract-exif",
        files={"image": ("photo.jpg", jpeg_with_exif_bytes, "image/jpeg")},
    )
    assert response.status_code == 200
    metadata = response.json()["metadata"]
    assert metadata["Make"] == "Apple"
    assert metadata["Model"] == "iPhone 15 Pro"


def test_extract_exif_no_metadata(client, jpeg_bytes):
    response = client.post(
        "/api/advanced/extract-exif",
        files={"image": ("photo.jpg", jpeg_bytes, "image/jpeg")},
    )
    assert response.status_code == 200
    assert response.json()["metadata"] == {}


def test_deskew(client, tilted_jpeg_bytes):
    response = client.post(
        "/api/advanced/deskew",
        files={"image": ("tilted.jpg", tilted_jpeg_bytes, "image/jpeg")},
    )
    assert response.status_code == 200

    img = np.array(Image.open(io.BytesIO(response.content)).convert("RGB"))
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    coords = np.column_stack(np.where(thresh > 0))
    angle = cv2.minAreaRect(coords)[-1]
    angle = -(90 + angle) if angle < -45 else -angle
    assert abs(angle) < 2  # corrected close to horizontal


def test_denoise(client, jpeg_bytes):
    response = client.post(
        "/api/advanced/denoise",
        files={"image": ("photo.jpg", jpeg_bytes, "image/jpeg")},
        data={"strength": "10"},
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/jpeg"


def test_contact_sheet(client, jpeg_bytes, png_rgba_bytes):
    response = client.post(
        "/api/advanced/contact-sheet",
        files=[
            ("images", ("a.jpg", jpeg_bytes, "image/jpeg")),
            ("images", ("b.png", png_rgba_bytes, "image/png")),
        ],
        data={"columns": "2", "thumb_size": "100"},
    )
    assert response.status_code == 200
    # 2 columns x 1 row of 100px thumbs with a 10px margin: 2*100+3*10, 1*100+2*10
    assert Image.open(io.BytesIO(response.content)).size == (230, 120)

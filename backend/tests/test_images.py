import io
import zipfile

from PIL import Image


def test_compress(client, jpeg_bytes):
    response = client.post(
        "/api/images/compress",
        files={"image": ("photo.jpg", jpeg_bytes, "image/jpeg")},
        data={"quality": "50"},
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/jpeg"
    assert len(response.content) > 0


def test_compress_invalid_image(client):
    response = client.post(
        "/api/images/compress",
        files={"image": ("bad.jpg", b"not an image", "image/jpeg")},
    )
    assert response.status_code == 400


def test_convert_to_png(client, jpeg_bytes):
    response = client.post(
        "/api/images/convert",
        files={"image": ("photo.jpg", jpeg_bytes, "image/jpeg")},
        data={"target_format": "png"},
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"
    assert Image.open(io.BytesIO(response.content)).format == "PNG"


def test_convert_to_avif(client, jpeg_bytes):
    response = client.post(
        "/api/images/convert",
        files={"image": ("photo.jpg", jpeg_bytes, "image/jpeg")},
        data={"target_format": "avif"},
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/avif"


def test_color_match(client, jpeg_bytes, png_rgba_bytes):
    response = client.post(
        "/api/images/color-match",
        files=[
            ("reference", ("ref.jpg", jpeg_bytes, "image/jpeg")),
            ("images", ("a.jpg", jpeg_bytes, "image/jpeg")),
            ("images", ("b.png", png_rgba_bytes, "image/png")),
        ],
    )
    assert response.status_code == 200
    zf = zipfile.ZipFile(io.BytesIO(response.content))
    assert set(zf.namelist()) == {"a.jpg", "b.png"}


def test_normalize_brightness_average(client, jpeg_bytes, png_rgba_bytes):
    response = client.post(
        "/api/images/normalize-brightness",
        files=[
            ("images", ("a.jpg", jpeg_bytes, "image/jpeg")),
            ("images", ("b.png", png_rgba_bytes, "image/png")),
        ],
    )
    assert response.status_code == 200
    zf = zipfile.ZipFile(io.BytesIO(response.content))
    assert set(zf.namelist()) == {"a.jpg", "b.png"}


def test_normalize_brightness_reference(client, jpeg_bytes, png_rgba_bytes):
    response = client.post(
        "/api/images/normalize-brightness",
        files=[
            ("images", ("a.jpg", jpeg_bytes, "image/jpeg")),
            ("reference", ("ref.png", png_rgba_bytes, "image/png")),
        ],
    )
    assert response.status_code == 200


def test_crop_ratio(client, jpeg_bytes):
    response = client.post(
        "/api/images/crop",
        files={"image": ("photo.jpg", jpeg_bytes, "image/jpeg")},
        data={"ratio": "1:1"},
    )
    assert response.status_code == 200
    image = Image.open(io.BytesIO(response.content))
    assert image.width == image.height


def test_crop_manual(client, jpeg_bytes):
    response = client.post(
        "/api/images/crop",
        files={"image": ("photo.jpg", jpeg_bytes, "image/jpeg")},
        data={"x": "0", "y": "0", "width": "40", "height": "30"},
    )
    assert response.status_code == 200
    assert Image.open(io.BytesIO(response.content)).size == (40, 30)


def test_crop_missing_params(client, jpeg_bytes):
    response = client.post(
        "/api/images/crop",
        files={"image": ("photo.jpg", jpeg_bytes, "image/jpeg")},
    )
    assert response.status_code == 400


def test_resize_percent(client, jpeg_bytes):
    response = client.post(
        "/api/images/resize",
        files={"image": ("photo.jpg", jpeg_bytes, "image/jpeg")},
        data={"percent": "50"},
    )
    assert response.status_code == 200
    assert Image.open(io.BytesIO(response.content)).size == (60, 40)  # source is 120x80


def test_resize_missing_params(client, jpeg_bytes):
    response = client.post(
        "/api/images/resize",
        files={"image": ("photo.jpg", jpeg_bytes, "image/jpeg")},
    )
    assert response.status_code == 400


def test_rotate_90(client, jpeg_bytes):
    response = client.post(
        "/api/images/rotate-flip",
        files={"image": ("photo.jpg", jpeg_bytes, "image/jpeg")},
        data={"angle": "90"},
    )
    assert response.status_code == 200
    assert Image.open(io.BytesIO(response.content)).size == (80, 120)  # swapped from 120x80


def test_flip_horizontal(client, jpeg_bytes):
    response = client.post(
        "/api/images/rotate-flip",
        files={"image": ("photo.jpg", jpeg_bytes, "image/jpeg")},
        data={"flip_horizontal": "true"},
    )
    assert response.status_code == 200
    assert Image.open(io.BytesIO(response.content)).size == (120, 80)


def test_watermark_text(client, jpeg_bytes, png_rgba_bytes):
    response = client.post(
        "/api/images/watermark",
        files=[
            ("images", ("a.jpg", jpeg_bytes, "image/jpeg")),
            ("images", ("b.png", png_rgba_bytes, "image/png")),
        ],
        data={"text": "Copyright", "opacity": "70", "position": "bottom-right"},
    )
    assert response.status_code == 200
    zf = zipfile.ZipFile(io.BytesIO(response.content))
    assert set(zf.namelist()) == {"a.jpg", "b.png"}


def test_watermark_missing_text_and_logo(client, jpeg_bytes):
    response = client.post(
        "/api/images/watermark",
        files=[("images", ("a.jpg", jpeg_bytes, "image/jpeg"))],
    )
    assert response.status_code == 400


def test_watermark_invalid_position(client, jpeg_bytes):
    response = client.post(
        "/api/images/watermark",
        files=[("images", ("a.jpg", jpeg_bytes, "image/jpeg"))],
        data={"text": "hi", "position": "bogus"},
    )
    assert response.status_code == 400


def test_adjust(client, jpeg_bytes, png_rgba_bytes):
    response = client.post(
        "/api/images/adjust",
        files=[
            ("images", ("a.jpg", jpeg_bytes, "image/jpeg")),
            ("images", ("b.png", png_rgba_bytes, "image/png")),
        ],
        data={"brightness": "1.5", "contrast": "1.0", "saturation": "1.0"},
    )
    assert response.status_code == 200
    zf = zipfile.ZipFile(io.BytesIO(response.content))
    assert set(zf.namelist()) == {"a.jpg", "b.png"}

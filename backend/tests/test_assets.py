import io
import zipfile

from PIL import Image


def test_favicon(client, small_icon_bytes):
    response = client.post(
        "/api/assets/favicon",
        files={"image": ("icon.png", small_icon_bytes, "image/png")},
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/x-icon"


def test_favicon_invalid_image(client):
    response = client.post(
        "/api/assets/favicon",
        files={"image": ("bad.png", b"not an image", "image/png")},
    )
    assert response.status_code == 400


def test_icon_pack(client, small_icon_bytes):
    response = client.post(
        "/api/assets/icon-pack",
        files={"image": ("icon.png", small_icon_bytes, "image/png")},
    )
    assert response.status_code == 200
    zf = zipfile.ZipFile(io.BytesIO(response.content))
    assert set(zf.namelist()) == {
        "favicon.ico",
        "apple-touch-icon.png",
        "icon-192x192.png",
        "icon-512x512.png",
        "manifest.json",
    }


def test_icon_pack_invalid_image(client):
    response = client.post(
        "/api/assets/icon-pack",
        files={"image": ("bad.png", b"not an image", "image/png")},
    )
    assert response.status_code == 400


def test_srcset(client, jpeg_bytes):
    response = client.post(
        "/api/assets/srcset",
        files={"image": ("photo.jpg", jpeg_bytes, "image/jpeg")},
        data={"widths": "40,80,999"},  # source is 120px wide, so 999 clamps down to 120
    )
    assert response.status_code == 200
    zf = zipfile.ZipFile(io.BytesIO(response.content))
    names = zf.namelist()
    assert "image-40w.jpeg" in names
    assert "image-80w.jpeg" in names
    assert "image-120w.jpeg" in names
    assert "srcset.txt" in names


def test_srcset_invalid_widths(client, jpeg_bytes):
    response = client.post(
        "/api/assets/srcset",
        files={"image": ("photo.jpg", jpeg_bytes, "image/jpeg")},
        data={"widths": "not,a,number"},
    )
    assert response.status_code == 400


def test_srcset_zero_width(client, jpeg_bytes):
    response = client.post(
        "/api/assets/srcset",
        files={"image": ("photo.jpg", jpeg_bytes, "image/jpeg")},
        data={"widths": "0"},
    )
    assert response.status_code == 400


def test_lqip(client, jpeg_bytes):
    response = client.post(
        "/api/assets/lqip",
        files={"image": ("photo.jpg", jpeg_bytes, "image/jpeg")},
    )
    assert response.status_code == 200
    assert response.json()["data_uri"].startswith("data:image/jpeg;base64,")


def test_lqip_invalid_image(client):
    response = client.post(
        "/api/assets/lqip",
        files={"image": ("bad.jpg", b"not an image", "image/jpeg")},
    )
    assert response.status_code == 400


def test_base64(client, small_icon_bytes):
    response = client.post(
        "/api/assets/base64",
        files={"image": ("icon.png", small_icon_bytes, "image/png")},
    )
    assert response.status_code == 200
    assert response.json()["data_uri"].startswith("data:image/png;base64,")


def test_base64_invalid_image(client):
    response = client.post(
        "/api/assets/base64",
        files={"image": ("bad.png", b"not an image", "image/png")},
    )
    assert response.status_code == 400


def test_spritesheet(client, small_icon_bytes, png_rgba_bytes):
    response = client.post(
        "/api/assets/spritesheet",
        files=[
            ("images", ("a.png", small_icon_bytes, "image/png")),
            ("images", ("b.png", png_rgba_bytes, "image/png")),
        ],
    )
    assert response.status_code == 200
    zf = zipfile.ZipFile(io.BytesIO(response.content))
    assert set(zf.namelist()) == {"sprite.png", "sprite.css"}


def test_spritesheet_invalid_image(client):
    response = client.post(
        "/api/assets/spritesheet",
        files=[("images", ("bad.png", b"not an image", "image/png"))],
    )
    assert response.status_code == 400


def test_social_formats(client, jpeg_bytes):
    response = client.post(
        "/api/assets/social-formats",
        files={"image": ("photo.jpg", jpeg_bytes, "image/jpeg")},
    )
    assert response.status_code == 200
    zf = zipfile.ZipFile(io.BytesIO(response.content))
    assert set(zf.namelist()) == {
        "instagram-square.jpg",
        "instagram-story.jpg",
        "linkedin-banner.jpg",
        "twitter-card.jpg",
        "og-image.jpg",
    }
    assert Image.open(io.BytesIO(zf.read("instagram-square.jpg"))).size == (1080, 1080)
    assert Image.open(io.BytesIO(zf.read("linkedin-banner.jpg"))).size == (1584, 396)


def test_social_formats_invalid_image(client):
    response = client.post(
        "/api/assets/social-formats",
        files={"image": ("bad.jpg", b"not an image", "image/jpeg")},
    )
    assert response.status_code == 400


def test_placeholder_default_size(client):
    response = client.post(
        "/api/assets/placeholder",
        data={"width": "300", "height": "200"},
    )
    assert response.status_code == 200
    assert Image.open(io.BytesIO(response.content)).size == (300, 200)


def test_placeholder_custom_colors(client):
    response = client.post(
        "/api/assets/placeholder",
        data={"width": "100", "height": "100", "bg_color": "1e3a8a", "text_color": "ffffff"},
    )
    assert response.status_code == 200
    image = Image.open(io.BytesIO(response.content)).convert("RGB")
    assert image.getpixel((2, 2)) == (30, 58, 138)


def test_placeholder_invalid_color(client):
    response = client.post(
        "/api/assets/placeholder",
        data={"bg_color": "notacolor"},
    )
    assert response.status_code == 400


def test_placeholder_invalid_size(client):
    response = client.post(
        "/api/assets/placeholder",
        data={"width": "0", "height": "100"},
    )
    assert response.status_code == 400

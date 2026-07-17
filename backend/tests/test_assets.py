import io
import zipfile


def test_favicon(client, small_icon_bytes):
    response = client.post(
        "/api/assets/favicon",
        files={"image": ("icon.png", small_icon_bytes, "image/png")},
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/x-icon"


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


def test_lqip(client, jpeg_bytes):
    response = client.post(
        "/api/assets/lqip",
        files={"image": ("photo.jpg", jpeg_bytes, "image/jpeg")},
    )
    assert response.status_code == 200
    assert response.json()["data_uri"].startswith("data:image/jpeg;base64,")


def test_base64(client, small_icon_bytes):
    response = client.post(
        "/api/assets/base64",
        files={"image": ("icon.png", small_icon_bytes, "image/png")},
    )
    assert response.status_code == 200
    assert response.json()["data_uri"].startswith("data:image/png;base64,")


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

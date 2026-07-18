# Requires network access on first run: rembg downloads the U2Net ONNX model
# from GitHub releases the first time it's used, then caches it under ~/.u2net.
def test_remove_background(client, jpeg_bytes):
    response = client.post(
        "/api/background/remove",
        files={"image": ("photo.jpg", jpeg_bytes, "image/jpeg")},
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"


def test_remove_background_alpha_matting(client, jpeg_bytes):
    response = client.post(
        "/api/background/remove",
        files={"image": ("photo.jpg", jpeg_bytes, "image/jpeg")},
        data={"alpha_matting": "true"},
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"


def test_remove_background_invalid_image(client):
    response = client.post(
        "/api/background/remove",
        files={"image": ("bad.jpg", b"not an image", "image/jpeg")},
    )
    assert response.status_code == 400

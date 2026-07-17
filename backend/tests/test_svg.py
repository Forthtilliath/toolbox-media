def test_optimize(client, svg_bytes):
    response = client.post(
        "/api/svg/optimize",
        files={"file": ("logo.svg", svg_bytes, "image/svg+xml")},
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/svg+xml"
    assert b"<!--" not in response.content  # comment stripped by scour


def test_optimize_invalid_svg(client):
    response = client.post(
        "/api/svg/optimize",
        files={"file": ("bad.svg", b"<svg><unclosed>", "image/svg+xml")},
    )
    assert response.status_code == 400


def test_svg_to_png(client, svg_bytes):
    response = client.post(
        "/api/svg/convert",
        files={"file": ("logo.svg", svg_bytes, "image/svg+xml")},
        data={"direction": "svg-to-png", "width": "100"},
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"


def test_png_to_svg(client, small_icon_bytes):
    response = client.post(
        "/api/svg/convert",
        files={"file": ("icon.png", small_icon_bytes, "image/png")},
        data={"direction": "png-to-svg"},
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/svg+xml"
    assert response.content.startswith(b"<svg")


def test_convert_invalid_direction(client, svg_bytes):
    response = client.post(
        "/api/svg/convert",
        files={"file": ("logo.svg", svg_bytes, "image/svg+xml")},
        data={"direction": "bogus"},
    )
    assert response.status_code == 400

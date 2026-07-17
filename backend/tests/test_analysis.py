def test_palette(client, two_color_png_bytes):
    response = client.post(
        "/api/analysis/palette",
        files={"image": ("photo.png", two_color_png_bytes, "image/png")},
        data={"num_colors": "2"},
    )
    assert response.status_code == 200
    colors = response.json()["colors"]
    assert colors[0]["hex"] == "#ff0000"
    assert colors[0]["percentage"] == 70.0
    assert colors[1]["hex"] == "#0000ff"
    assert colors[1]["percentage"] == 30.0


def test_compare_identical_images(client, jpeg_bytes):
    response = client.post(
        "/api/analysis/compare",
        files={
            "image_a": ("a.jpg", jpeg_bytes, "image/jpeg"),
            "image_b": ("b.jpg", jpeg_bytes, "image/jpeg"),
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["similarity"] == 1.0
    assert data["data_uri"].startswith("data:image/png;base64,")


def test_compare_different_images(client, jpeg_bytes, png_rgba_bytes):
    response = client.post(
        "/api/analysis/compare",
        files={
            "image_a": ("a.jpg", jpeg_bytes, "image/jpeg"),
            "image_b": ("b.png", png_rgba_bytes, "image/png"),
        },
    )
    assert response.status_code == 200
    assert response.json()["similarity"] < 1.0

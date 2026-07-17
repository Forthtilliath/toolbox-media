import io
import zipfile


def test_qrcode(client):
    response = client.post(
        "/api/misc/qrcode",
        data={"data": "https://example.com", "box_size": "5"},
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"


def test_images_to_pdf(client, jpeg_bytes, png_rgba_bytes):
    response = client.post(
        "/api/misc/images-to-pdf",
        files=[
            ("images", ("a.jpg", jpeg_bytes, "image/jpeg")),
            ("images", ("b.png", png_rgba_bytes, "image/png")),
        ],
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.content.startswith(b"%PDF")


def test_pdf_to_images(client, pdf_bytes):
    response = client.post(
        "/api/misc/pdf-to-images",
        files={"file": ("doc.pdf", pdf_bytes, "application/pdf")},
        data={"dpi": "72"},
    )
    assert response.status_code == 200
    zf = zipfile.ZipFile(io.BytesIO(response.content))
    assert zf.namelist() == ["page-001.png", "page-002.png"]


def test_pdf_to_images_invalid_pdf(client):
    response = client.post(
        "/api/misc/pdf-to-images",
        files={"file": ("bad.pdf", b"not a pdf", "application/pdf")},
    )
    assert response.status_code == 400


def test_rename_with_number_pattern(client, jpeg_bytes, png_rgba_bytes):
    response = client.post(
        "/api/misc/rename",
        files=[
            ("files", ("original1.jpg", jpeg_bytes, "image/jpeg")),
            ("files", ("original2.png", png_rgba_bytes, "image/png")),
        ],
        data={"pattern": "vacances-{n:03d}", "start": "1"},
    )
    assert response.status_code == 200
    zf = zipfile.ZipFile(io.BytesIO(response.content))
    assert set(zf.namelist()) == {"vacances-001.jpg", "vacances-002.png"}


def test_rename_collision_gets_disambiguated(client, jpeg_bytes, png_rgba_bytes):
    response = client.post(
        "/api/misc/rename",
        files=[
            ("files", ("a.jpg", jpeg_bytes, "image/jpeg")),
            ("files", ("b.jpg", png_rgba_bytes, "image/jpeg")),
        ],
        data={"pattern": "cover"},
    )
    assert response.status_code == 200
    zf = zipfile.ZipFile(io.BytesIO(response.content))
    assert set(zf.namelist()) == {"cover.jpg", "cover-2.jpg"}

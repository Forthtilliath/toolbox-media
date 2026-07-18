import hashlib
import io
import zipfile

import fitz


def test_qrcode(client):
    response = client.post(
        "/api/misc/qrcode",
        data={"data": "https://example.com", "box_size": "5"},
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"


def test_qrcode_invalid_box_size(client):
    response = client.post(
        "/api/misc/qrcode",
        data={"data": "https://example.com", "box_size": "0"},
    )
    assert response.status_code == 400


def test_qrcode_missing_data(client):
    response = client.post("/api/misc/qrcode", data={})
    assert response.status_code == 422


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


def test_images_to_pdf_invalid_image(client):
    response = client.post(
        "/api/misc/images-to-pdf",
        files=[("images", ("bad.jpg", b"not an image", "image/jpeg"))],
    )
    assert response.status_code == 400


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


def test_rename_invalid_pattern(client, jpeg_bytes):
    response = client.post(
        "/api/misc/rename",
        files=[("files", ("a.jpg", jpeg_bytes, "image/jpeg"))],
        data={"pattern": "{bogus}"},
    )
    assert response.status_code == 400


def test_merge_pdf(client, pdf_bytes):
    # pdf_bytes already has 2 pages; merging two copies should yield 4.
    response = client.post(
        "/api/misc/merge-pdf",
        files=[
            ("files", ("a.pdf", pdf_bytes, "application/pdf")),
            ("files", ("b.pdf", pdf_bytes, "application/pdf")),
        ],
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    doc = fitz.open(stream=response.content, filetype="pdf")
    try:
        assert doc.page_count == 4
    finally:
        doc.close()


def test_merge_pdf_single_file(client, pdf_bytes):
    response = client.post(
        "/api/misc/merge-pdf",
        files=[("files", ("a.pdf", pdf_bytes, "application/pdf"))],
    )
    assert response.status_code == 400


def test_compress_pdf(client, pdf_bytes):
    response = client.post(
        "/api/misc/compress-pdf",
        files={"file": ("doc.pdf", pdf_bytes, "application/pdf")},
    )
    assert response.status_code == 200
    assert response.content.startswith(b"%PDF")


def test_compress_pdf_invalid(client):
    response = client.post(
        "/api/misc/compress-pdf",
        files={"file": ("bad.pdf", b"not a pdf", "application/pdf")},
    )
    assert response.status_code == 400


def test_hash(client):
    data = b"hello toolbox"
    response = client.post(
        "/api/misc/hash",
        files={"file": ("test.txt", data, "text/plain")},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["md5"] == hashlib.md5(data).hexdigest()
    assert body["sha256"] == hashlib.sha256(data).hexdigest()


def test_hash_missing_file(client):
    response = client.post("/api/misc/hash")
    assert response.status_code == 422


def test_contrast_black_white(client):
    response = client.post(
        "/api/misc/contrast",
        data={"color_a": "000000", "color_b": "ffffff"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["ratio"] == 21.0
    assert body["aaa_normal_text"] is True


def test_contrast_low(client):
    response = client.post(
        "/api/misc/contrast",
        data={"color_a": "888888", "color_b": "999999"},
    )
    assert response.status_code == 200
    assert response.json()["aa_normal_text"] is False


def test_contrast_invalid_color(client):
    response = client.post(
        "/api/misc/contrast",
        data={"color_a": "notacolor", "color_b": "ffffff"},
    )
    assert response.status_code == 400

def test_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_rejects_oversized_upload_before_processing(client):
    # A spoofed Content-Length is enough to exercise the middleware without
    # actually uploading hundreds of megabytes in a test.
    oversized = 600 * 1024 * 1024
    response = client.post(
        "/api/images/compress",
        headers={"content-length": str(oversized)},
        content=b"small",
    )
    assert response.status_code == 413
    assert "trop volumineux" in response.json()["detail"]


def test_allows_upload_under_the_limit(client, jpeg_bytes):
    response = client.post(
        "/api/images/compress",
        files={"image": ("photo.jpg", jpeg_bytes, "image/jpeg")},
    )
    assert response.status_code == 200


def test_unhandled_exceptions_are_logged(client, monkeypatch, caplog):
    def boom(*args, **kwargs):
        raise RuntimeError("kaboom")

    monkeypatch.setattr("app.routers.misc.compute_hashes", boom)

    with caplog.at_level("ERROR"):
        response = client.post(
            "/api/misc/hash",
            files={"file": ("test.txt", b"hello", "text/plain")},
        )

    assert response.status_code == 500
    assert response.json() == {"detail": "kaboom"}
    assert any("Unhandled exception" in record.message for record in caplog.records)

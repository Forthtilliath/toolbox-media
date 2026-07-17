def test_trim(client, video_clip_bytes):
    response = client.post(
        "/api/videos/trim",
        files={"video": ("clip.mp4", video_clip_bytes, "video/mp4")},
        data={"start": "0", "end": "1"},
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "video/mp4"


def test_to_gif(client, video_clip_bytes):
    response = client.post(
        "/api/videos/to-gif",
        files={"video": ("clip.mp4", video_clip_bytes, "video/mp4")},
        data={"start": "0", "duration": "1", "fps": "10", "width": "80"},
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/gif"


def test_convert(client, video_clip_bytes):
    response = client.post(
        "/api/videos/convert",
        files={"video": ("clip.mp4", video_clip_bytes, "video/mp4")},
        data={"target_format": "webm"},
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "video/webm"


def test_convert_invalid_format(client, video_clip_bytes):
    response = client.post(
        "/api/videos/convert",
        files={"video": ("clip.mp4", video_clip_bytes, "video/mp4")},
        data={"target_format": "bogus"},
    )
    assert response.status_code == 400


def test_compress(client, video_clip2_bytes):
    response = client.post(
        "/api/videos/compress",
        files={"video": ("clip2.mp4", video_clip2_bytes, "video/mp4")},
        data={"bitrate_kbps": "200", "width": "160"},
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "video/mp4"


def test_compress_missing_params(client, video_clip_bytes):
    response = client.post(
        "/api/videos/compress",
        files={"video": ("clip.mp4", video_clip_bytes, "video/mp4")},
    )
    assert response.status_code == 400


def test_extract_frame(client, video_clip_bytes):
    response = client.post(
        "/api/videos/extract-frame",
        files={"video": ("clip.mp4", video_clip_bytes, "video/mp4")},
        data={"timestamp": "0.5"},
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"


def test_concat(client, video_clip_bytes, video_clip2_bytes):
    response = client.post(
        "/api/videos/concat",
        files=[
            ("videos", ("clip.mp4", video_clip_bytes, "video/mp4")),
            ("videos", ("clip2.mp4", video_clip2_bytes, "video/mp4")),
        ],
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "video/mp4"


def test_concat_single_clip(client, video_clip_bytes):
    response = client.post(
        "/api/videos/concat",
        files=[("videos", ("clip.mp4", video_clip_bytes, "video/mp4"))],
    )
    assert response.status_code == 400


def test_concat_missing_audio(client, video_clip_bytes, video_no_audio_bytes):
    response = client.post(
        "/api/videos/concat",
        files=[
            ("videos", ("clip.mp4", video_clip_bytes, "video/mp4")),
            ("videos", ("silent.mp4", video_no_audio_bytes, "video/mp4")),
        ],
    )
    assert response.status_code == 400


def test_audio_track_remove(client, video_clip_bytes):
    response = client.post(
        "/api/videos/audio-track",
        files={"video": ("clip.mp4", video_clip_bytes, "video/mp4")},
        data={"action": "remove"},
    )
    assert response.status_code == 200


def test_audio_track_replace(client, video_no_audio_bytes, audio_bytes):
    response = client.post(
        "/api/videos/audio-track",
        files={
            "video": ("clip.mp4", video_no_audio_bytes, "video/mp4"),
            "audio": ("audio.aac", audio_bytes, "audio/aac"),
        },
        data={"action": "replace"},
    )
    assert response.status_code == 200


def test_audio_track_replace_without_file(client, video_clip_bytes):
    response = client.post(
        "/api/videos/audio-track",
        files={"video": ("clip.mp4", video_clip_bytes, "video/mp4")},
        data={"action": "replace"},
    )
    assert response.status_code == 400


def test_audio_track_invalid_action(client, video_clip_bytes):
    response = client.post(
        "/api/videos/audio-track",
        files={"video": ("clip.mp4", video_clip_bytes, "video/mp4")},
        data={"action": "bogus"},
    )
    assert response.status_code == 400

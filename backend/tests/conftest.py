import io
import subprocess
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from PIL import Image, ImageDraw

from app.main import app


@pytest.fixture(scope="session")
def client():
    return TestClient(app)


@pytest.fixture
def jpeg_bytes():
    image = Image.new("RGB", (120, 80), (200, 100, 50))
    output = io.BytesIO()
    image.save(output, format="JPEG", quality=90)
    return output.getvalue()


@pytest.fixture
def png_rgba_bytes():
    image = Image.new("RGBA", (100, 100), (50, 150, 200, 255))
    output = io.BytesIO()
    image.save(output, format="PNG")
    return output.getvalue()


@pytest.fixture
def two_color_png_bytes():
    # 70% red / 30% blue split — lets palette tests assert exact percentages.
    image = Image.new("RGB", (100, 100), (255, 0, 0))
    ImageDraw.Draw(image).rectangle([0, 70, 100, 100], fill=(0, 0, 255))
    output = io.BytesIO()
    image.save(output, format="PNG")
    return output.getvalue()


@pytest.fixture
def small_icon_bytes():
    image = Image.new("RGBA", (32, 32), (10, 200, 10, 255))
    output = io.BytesIO()
    image.save(output, format="PNG")
    return output.getvalue()


@pytest.fixture
def svg_bytes():
    return (
        b'<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50">'
        b'<!-- comment --><rect width="50" height="50" fill="#336699"/></svg>'
    )


def _make_clip(path: Path, duration: float, size: str, fps: int, with_audio: bool) -> None:
    cmd = ["ffmpeg", "-y", "-f", "lavfi", "-i", f"testsrc=duration={duration}:size={size}:rate={fps}"]
    if with_audio:
        cmd += ["-f", "lavfi", "-i", f"sine=frequency=440:duration={duration}"]
    cmd += ["-pix_fmt", "yuv420p", "-c:v", "libx264"]
    cmd += ["-c:a", "aac"] if with_audio else ["-an"]
    cmd.append(str(path))
    subprocess.run(cmd, check=True, capture_output=True)


@pytest.fixture(scope="session")
def video_clip_bytes(tmp_path_factory):
    path = tmp_path_factory.mktemp("video") / "clip.mp4"
    _make_clip(path, duration=2, size="160x120", fps=15, with_audio=True)
    return path.read_bytes()


@pytest.fixture(scope="session")
def video_clip2_bytes(tmp_path_factory):
    # Different resolution/fps than video_clip_bytes to exercise concat's normalization.
    path = tmp_path_factory.mktemp("video2") / "clip2.mp4"
    _make_clip(path, duration=1, size="320x240", fps=25, with_audio=True)
    return path.read_bytes()


@pytest.fixture(scope="session")
def video_no_audio_bytes(tmp_path_factory):
    path = tmp_path_factory.mktemp("video3") / "clip_no_audio.mp4"
    _make_clip(path, duration=1, size="160x120", fps=15, with_audio=False)
    return path.read_bytes()


@pytest.fixture(scope="session")
def audio_bytes(tmp_path_factory):
    path = tmp_path_factory.mktemp("audio") / "audio.aac"
    subprocess.run(
        ["ffmpeg", "-y", "-f", "lavfi", "-i", "sine=frequency=220:duration=2", "-c:a", "aac", str(path)],
        check=True,
        capture_output=True,
    )
    return path.read_bytes()


@pytest.fixture
def pdf_bytes(jpeg_bytes, png_rgba_bytes):
    page1 = Image.open(io.BytesIO(jpeg_bytes)).convert("RGB")
    page2 = Image.open(io.BytesIO(png_rgba_bytes)).convert("RGB")
    output = io.BytesIO()
    page1.save(output, format="PDF", save_all=True, append_images=[page2])
    return output.getvalue()

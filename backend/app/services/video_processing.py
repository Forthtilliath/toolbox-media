import os
import subprocess
import tempfile


def _write_temp_input(input_bytes: bytes, suffix: str) -> str:
    fd, path = tempfile.mkstemp(suffix=suffix)
    with os.fdopen(fd, "wb") as f:
        f.write(input_bytes)
    return path


def trim_video(input_bytes: bytes, start: float, end: float, suffix: str) -> str:
    input_path = _write_temp_input(input_bytes, suffix)
    output_fd, output_path = tempfile.mkstemp(suffix=suffix)
    os.close(output_fd)
    duration = end - start
    try:
        subprocess.run(
            [
                "ffmpeg", "-y",
                "-ss", str(start),
                "-i", input_path,
                "-t", str(duration),
                "-c:v", "libx264",
                "-c:a", "aac",
                output_path,
            ],
            check=True,
            capture_output=True,
        )
    finally:
        os.remove(input_path)
    return output_path


def video_to_gif(input_bytes: bytes, start: float, duration: float, fps: int, width: int) -> str:
    input_path = _write_temp_input(input_bytes, ".mp4")
    palette_fd, palette_path = tempfile.mkstemp(suffix=".png")
    os.close(palette_fd)
    output_fd, output_path = tempfile.mkstemp(suffix=".gif")
    os.close(output_fd)
    scale_filter = f"fps={fps},scale={width}:-1:flags=lanczos"
    try:
        subprocess.run(
            [
                "ffmpeg", "-y",
                "-ss", str(start), "-t", str(duration), "-i", input_path,
                "-vf", f"{scale_filter},palettegen",
                palette_path,
            ],
            check=True,
            capture_output=True,
        )
        subprocess.run(
            [
                "ffmpeg", "-y",
                "-ss", str(start), "-t", str(duration), "-i", input_path,
                "-i", palette_path,
                "-filter_complex", f"{scale_filter}[x];[x][1:v]paletteuse",
                output_path,
            ],
            check=True,
            capture_output=True,
        )
    finally:
        os.remove(input_path)
        os.remove(palette_path)
    return output_path

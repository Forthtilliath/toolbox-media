import os
import subprocess
import tempfile

VIDEO_CODECS = {
    "mp4": ("libx264", "aac"),
    "webm": ("libvpx-vp9", "libopus"),
    "mov": ("libx264", "aac"),
    "mkv": ("libx264", "aac"),
    "avi": ("mpeg4", "mp3"),
}


def _write_temp_input(input_bytes: bytes, suffix: str) -> str:
    fd, path = tempfile.mkstemp(suffix=suffix)
    with os.fdopen(fd, "wb") as f:
        f.write(input_bytes)
    return path


def _probe_video_info(path: str) -> tuple[int, int, float]:
    result = subprocess.run(
        [
            "ffprobe", "-v", "error",
            "-select_streams", "v:0",
            "-show_entries", "stream=width,height,r_frame_rate",
            "-of", "csv=p=0",
            path,
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    width_str, height_str, fps_str = result.stdout.strip().split(",")
    num, den = fps_str.split("/")
    fps = float(num) / float(den) if float(den) else float(num)
    return int(width_str), int(height_str), fps


def _has_audio_stream(path: str) -> bool:
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "a", "-show_entries", "stream=index", "-of", "csv=p=0", path],
        capture_output=True,
        text=True,
    )
    return bool(result.stdout.strip())


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


def convert_video_format(input_bytes: bytes, input_suffix: str, target_format: str) -> str:
    input_path = _write_temp_input(input_bytes, input_suffix)
    video_codec, audio_codec = VIDEO_CODECS[target_format]
    output_fd, output_path = tempfile.mkstemp(suffix=f".{target_format}")
    os.close(output_fd)
    try:
        subprocess.run(
            ["ffmpeg", "-y", "-i", input_path, "-c:v", video_codec, "-c:a", audio_codec, output_path],
            check=True,
            capture_output=True,
        )
    finally:
        os.remove(input_path)
    return output_path


def compress_video(input_bytes: bytes, suffix: str, bitrate_kbps: int | None, width: int | None) -> str:
    input_path = _write_temp_input(input_bytes, suffix)
    output_fd, output_path = tempfile.mkstemp(suffix=suffix)
    os.close(output_fd)
    cmd = ["ffmpeg", "-y", "-i", input_path]
    if width:
        cmd += ["-vf", f"scale={width}:-2"]
    if bitrate_kbps:
        cmd += ["-b:v", f"{bitrate_kbps}k", "-maxrate", f"{bitrate_kbps}k", "-bufsize", f"{bitrate_kbps * 2}k"]
    cmd += ["-c:v", "libx264", "-c:a", "aac", output_path]
    try:
        subprocess.run(cmd, check=True, capture_output=True)
    finally:
        os.remove(input_path)
    return output_path


def extract_frame(input_bytes: bytes, suffix: str, timestamp: float) -> bytes:
    input_path = _write_temp_input(input_bytes, suffix)
    output_fd, output_path = tempfile.mkstemp(suffix=".png")
    os.close(output_fd)
    try:
        subprocess.run(
            ["ffmpeg", "-y", "-ss", str(timestamp), "-i", input_path, "-frames:v", "1", output_path],
            check=True,
            capture_output=True,
        )
        with open(output_path, "rb") as f:
            return f.read()
    finally:
        os.remove(input_path)
        os.remove(output_path)


def concat_videos(clips_bytes: list[bytes], suffixes: list[str]) -> str:
    input_paths = [_write_temp_input(data, suffix) for data, suffix in zip(clips_bytes, suffixes)]
    try:
        missing_audio = [i for i, path in enumerate(input_paths) if not _has_audio_stream(path)]
        if missing_audio:
            raise ValueError(
                f"Les extraits {missing_audio} n'ont pas de piste audio. "
                "Ajoutez-en une (outil piste audio) avant de concaténer."
            )

        width, height, fps = _probe_video_info(input_paths[0])

        filter_parts = []
        concat_inputs = []
        for i in range(len(input_paths)):
            filter_parts.append(f"[{i}:v]scale={width}:{height},setsar=1,fps={fps}[v{i}]")
            filter_parts.append(f"[{i}:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo[a{i}]")
            concat_inputs.append(f"[v{i}][a{i}]")
        filter_complex = (
            ";".join(filter_parts)
            + ";"
            + "".join(concat_inputs)
            + f"concat=n={len(input_paths)}:v=1:a=1[outv][outa]"
        )

        output_fd, output_path = tempfile.mkstemp(suffix=".mp4")
        os.close(output_fd)
        cmd = ["ffmpeg", "-y"]
        for path in input_paths:
            cmd += ["-i", path]
        cmd += [
            "-filter_complex", filter_complex,
            "-map", "[outv]", "-map", "[outa]",
            "-c:v", "libx264", "-c:a", "aac",
            output_path,
        ]
        subprocess.run(cmd, check=True, capture_output=True)
    finally:
        for path in input_paths:
            os.remove(path)
    return output_path


def remove_audio(input_bytes: bytes, suffix: str) -> str:
    input_path = _write_temp_input(input_bytes, suffix)
    output_fd, output_path = tempfile.mkstemp(suffix=suffix)
    os.close(output_fd)
    try:
        subprocess.run(
            ["ffmpeg", "-y", "-i", input_path, "-c:v", "copy", "-an", output_path],
            check=True,
            capture_output=True,
        )
    finally:
        os.remove(input_path)
    return output_path


def replace_audio(video_bytes: bytes, video_suffix: str, audio_bytes: bytes, audio_suffix: str) -> str:
    video_path = _write_temp_input(video_bytes, video_suffix)
    audio_path = _write_temp_input(audio_bytes, audio_suffix)
    output_fd, output_path = tempfile.mkstemp(suffix=video_suffix)
    os.close(output_fd)
    try:
        subprocess.run(
            [
                "ffmpeg", "-y",
                "-i", video_path, "-i", audio_path,
                "-c:v", "copy",
                "-map", "0:v:0", "-map", "1:a:0",
                "-shortest",
                output_path,
            ],
            check=True,
            capture_output=True,
        )
    finally:
        os.remove(video_path)
        os.remove(audio_path)
    return output_path

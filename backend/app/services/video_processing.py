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


def _probe_duration(path: str) -> float:
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
        check=True,
        capture_output=True,
        text=True,
    )
    return float(result.stdout.strip())


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


AUDIO_CODECS = {"mp3": "libmp3lame", "wav": "pcm_s16le"}


def extract_audio(input_bytes: bytes, suffix: str, target_format: str) -> str:
    input_path = _write_temp_input(input_bytes, suffix)
    output_fd, output_path = tempfile.mkstemp(suffix=f".{target_format}")
    os.close(output_fd)
    try:
        subprocess.run(
            ["ffmpeg", "-y", "-i", input_path, "-vn", "-acodec", AUDIO_CODECS[target_format], output_path],
            check=True,
            capture_output=True,
        )
    finally:
        os.remove(input_path)
    return output_path


def change_speed(input_bytes: bytes, suffix: str, speed: float) -> str:
    input_path = _write_temp_input(input_bytes, suffix)
    output_fd, output_path = tempfile.mkstemp(suffix=suffix)
    os.close(output_fd)
    has_audio = _has_audio_stream(input_path)
    cmd = ["ffmpeg", "-y", "-i", input_path, "-filter:v", f"setpts={1 / speed}*PTS"]
    if has_audio:
        # atempo only accepts 0.5-2.0 per instance; that's also the range this tool
        # exposes, so a single filter is always enough here.
        cmd += ["-filter:a", f"atempo={speed}", "-c:a", "aac"]
    else:
        cmd += ["-an"]
    cmd += ["-c:v", "libx264", output_path]
    try:
        subprocess.run(cmd, check=True, capture_output=True)
    finally:
        os.remove(input_path)
    return output_path


def burn_subtitles(video_bytes: bytes, video_suffix: str, srt_bytes: bytes) -> str:
    video_path = _write_temp_input(video_bytes, video_suffix)
    srt_path = _write_temp_input(srt_bytes, ".srt")
    output_fd, output_path = tempfile.mkstemp(suffix=video_suffix)
    os.close(output_fd)
    try:
        subprocess.run(
            ["ffmpeg", "-y", "-i", video_path, "-vf", f"subtitles={srt_path}", "-c:a", "copy", output_path],
            check=True,
            capture_output=True,
        )
    finally:
        os.remove(video_path)
        os.remove(srt_path)
    return output_path


def create_seamless_loop(input_bytes: bytes, suffix: str, fade_duration: float) -> str:
    # Video-only: the transition segment is built by cross-fading the last `fade_duration`
    # seconds into the first `fade_duration` seconds, so looping playback shows no cut.
    # Audio isn't cross-faded (acrossfade would need its own careful timing), so it's
    # dropped here — this tool targets silent background loops.
    input_path = _write_temp_input(input_bytes, suffix)
    try:
        duration = _probe_duration(input_path)
        _, _, fps = _probe_video_info(input_path)
        fade = min(fade_duration, duration / 2 - 0.05)
        if fade <= 0:
            raise ValueError("Vidéo trop courte pour ce fondu")

        middle_fd, middle_path = tempfile.mkstemp(suffix=".mp4")
        os.close(middle_fd)
        transition_fd, transition_path = tempfile.mkstemp(suffix=".mp4")
        os.close(transition_fd)
        list_fd, list_path = tempfile.mkstemp(suffix=".txt")
        os.close(list_fd)
        output_fd, output_path = tempfile.mkstemp(suffix=".mp4")
        os.close(output_fd)
        try:
            subprocess.run(
                [
                    "ffmpeg", "-y", "-i", input_path,
                    "-ss", str(fade), "-to", str(duration - fade),
                    "-an", "-c:v", "libx264",
                    middle_path,
                ],
                check=True,
                capture_output=True,
            )
            # xfade requires a constant frame rate on its inputs; trim+setpts alone
            # leaves that unset, so it must be pinned explicitly here.
            filter_complex = (
                f"[0:v]trim=start={duration - fade}:end={duration},setpts=PTS-STARTPTS,fps={fps}[e];"
                f"[0:v]trim=start=0:end={fade},setpts=PTS-STARTPTS,fps={fps}[b];"
                f"[e][b]xfade=transition=fade:duration={fade}:offset=0[x]"
            )
            subprocess.run(
                [
                    "ffmpeg", "-y", "-i", input_path,
                    "-filter_complex", filter_complex,
                    "-map", "[x]", "-c:v", "libx264",
                    transition_path,
                ],
                check=True,
                capture_output=True,
            )
            with open(list_path, "w") as f:
                f.write(f"file '{middle_path}'\nfile '{transition_path}'\n")
            subprocess.run(
                ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", list_path, "-c", "copy", output_path],
                check=True,
                capture_output=True,
            )
        finally:
            os.remove(middle_path)
            os.remove(transition_path)
            os.remove(list_path)
    finally:
        os.remove(input_path)
    return output_path


def generate_waveform(input_bytes: bytes, suffix: str, width: int, height: int) -> bytes:
    input_path = _write_temp_input(input_bytes, suffix)
    output_fd, output_path = tempfile.mkstemp(suffix=".png")
    os.close(output_fd)
    try:
        subprocess.run(
            [
                "ffmpeg", "-y", "-i", input_path,
                "-filter_complex", f"showwavespic=s={width}x{height}:colors=white",
                "-frames:v", "1",
                output_path,
            ],
            check=True,
            capture_output=True,
        )
        with open(output_path, "rb") as f:
            return f.read()
    finally:
        os.remove(input_path)
        os.remove(output_path)

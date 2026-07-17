import base64
import io

import cairosvg
import scour.scour as scour
from PIL import Image

_SCOUR_OPTIONS = scour.parse_args(["--enable-comment-stripping", "--shorten-ids", "--indent=none"])


def optimize_svg(svg_bytes: bytes) -> bytes:
    svg_text = svg_bytes.decode("utf-8")
    optimized = scour.scourString(svg_text, _SCOUR_OPTIONS)
    return optimized.encode("utf-8")


def svg_to_png(svg_bytes: bytes, width: int | None) -> bytes:
    return cairosvg.svg2png(bytestring=svg_bytes, output_width=width)


def raster_to_svg(input_bytes: bytes) -> bytes:
    # Not real vectorization — embeds the raster image inside an <svg> wrapper so it can
    # be dropped in wherever an .svg file is expected (e.g. an <img src="*.svg">).
    image = Image.open(io.BytesIO(input_bytes))
    width, height = image.size
    output = io.BytesIO()
    image.save(output, format="PNG")
    encoded = base64.b64encode(output.getvalue()).decode("ascii")
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" '
        f'viewBox="0 0 {width} {height}">'
        f'<image width="{width}" height="{height}" href="data:image/png;base64,{encoded}"/></svg>'
    )
    return svg.encode("utf-8")

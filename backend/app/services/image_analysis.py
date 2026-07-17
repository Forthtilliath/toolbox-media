import base64
import io

import numpy as np
from PIL import Image
from skimage.metrics import structural_similarity


def extract_palette(input_bytes: bytes, num_colors: int) -> list[dict[str, object]]:
    image = Image.open(io.BytesIO(input_bytes)).convert("RGB")
    image.thumbnail((150, 150))  # downscale for speed, doesn't affect the dominant colors
    quantized = image.quantize(colors=num_colors, method=Image.MEDIANCUT)
    palette = quantized.getpalette() or []
    color_counts = sorted(quantized.getcolors(), reverse=True)
    total = sum(count for count, _ in color_counts)

    results = []
    for count, index in color_counts:
        r, g, b = palette[index * 3 : index * 3 + 3]
        results.append(
            {
                "hex": f"#{r:02x}{g:02x}{b:02x}",
                "rgb": [r, g, b],
                "percentage": round(count / total * 100, 1),
            }
        )
    return results


def compare_images(bytes_a: bytes, bytes_b: bytes) -> tuple[str, float]:
    image_a = Image.open(io.BytesIO(bytes_a)).convert("RGB")
    image_b = Image.open(io.BytesIO(bytes_b)).convert("RGB")
    if image_b.size != image_a.size:
        # SSIM needs matching dimensions; resizing B onto A's frame is an approximation
        # when the two photos weren't shot at the same resolution/crop.
        image_b = image_b.resize(image_a.size, Image.LANCZOS)

    arr_a = np.array(image_a)
    arr_b = np.array(image_b)
    score, diff = structural_similarity(arr_a, arr_b, channel_axis=-1, full=True)

    # Per-pixel dissimilarity (mean across channels), painted in red over a dimmed
    # version of image A so differing regions stand out as a heatmap.
    dissimilarity = np.clip((1 - diff.mean(axis=-1)) * 255, 0, 255).astype(np.uint8)
    overlay = (arr_a * 0.4).astype(np.uint8)
    overlay[:, :, 0] = np.clip(overlay[:, :, 0].astype(int) + dissimilarity, 0, 255).astype(np.uint8)

    output = io.BytesIO()
    Image.fromarray(overlay).save(output, format="PNG")
    encoded = base64.b64encode(output.getvalue()).decode("ascii")
    return f"data:image/png;base64,{encoded}", float(score)

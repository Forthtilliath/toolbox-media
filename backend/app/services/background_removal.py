from rembg import remove


def remove_background(input_bytes: bytes, alpha_matting: bool = False) -> bytes:
    if not alpha_matting:
        return remove(input_bytes)
    # Alpha matting (pymatting, already pulled in by rembg) refines soft edges —
    # hair, fur, fine strands — that the plain segmentation mask cuts too sharply.
    return remove(
        input_bytes,
        alpha_matting=True,
        alpha_matting_foreground_threshold=240,
        alpha_matting_background_threshold=10,
        alpha_matting_erode_size=10,
    )

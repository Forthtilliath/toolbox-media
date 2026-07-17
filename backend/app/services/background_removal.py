from rembg import remove


def remove_background(input_bytes: bytes) -> bytes:
    return remove(input_bytes)

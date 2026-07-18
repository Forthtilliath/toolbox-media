import asyncio
import io

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from PIL import UnidentifiedImageError

from app.routers._common import zip_response
from app.services.misc_processing import (
    compress_pdf,
    compute_hashes,
    contrast_ratio,
    generate_qrcode,
    images_to_pdf,
    merge_pdfs,
    pdf_to_images,
    rename_batch,
)

router = APIRouter()


@router.post("/qrcode")
async def qrcode_endpoint(data: str = Form(...), box_size: int = Form(10)) -> StreamingResponse:
    if box_size < 1:
        raise HTTPException(status_code=400, detail="box_size doit être supérieur à 0")
    output_bytes = await asyncio.to_thread(generate_qrcode, data, box_size)
    return StreamingResponse(io.BytesIO(output_bytes), media_type="image/png")


@router.post("/images-to-pdf")
async def images_to_pdf_endpoint(images: list[UploadFile] = File(...)) -> StreamingResponse:
    images_bytes = [await img.read() for img in images]
    try:
        output_bytes = await asyncio.to_thread(images_to_pdf, images_bytes)
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Fichier image invalide")
    return StreamingResponse(
        io.BytesIO(output_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=images.pdf"},
    )


@router.post("/pdf-to-images")
async def pdf_to_images_endpoint(file: UploadFile = File(...), dpi: int = Form(150)) -> StreamingResponse:
    input_bytes = await file.read()
    try:
        pages = await asyncio.to_thread(pdf_to_images, input_bytes, dpi)
    except Exception:
        raise HTTPException(status_code=400, detail="Fichier PDF invalide")
    if not pages:
        raise HTTPException(status_code=400, detail="Le PDF ne contient aucune page")
    filenames = [f"page-{i + 1:03d}.png" for i in range(len(pages))]
    return zip_response(filenames, pages, "pdf_pages.zip")


@router.post("/merge-pdf")
async def merge_pdf_endpoint(files: list[UploadFile] = File(...)) -> StreamingResponse:
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="Fournir au moins 2 fichiers PDF")
    pdfs_bytes = [await f.read() for f in files]
    try:
        output_bytes = await asyncio.to_thread(merge_pdfs, pdfs_bytes)
    except Exception:
        raise HTTPException(status_code=400, detail="Fichier PDF invalide")
    return StreamingResponse(
        io.BytesIO(output_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=merged.pdf"},
    )


@router.post("/compress-pdf")
async def compress_pdf_endpoint(file: UploadFile = File(...)) -> StreamingResponse:
    input_bytes = await file.read()
    try:
        output_bytes = await asyncio.to_thread(compress_pdf, input_bytes)
    except Exception:
        raise HTTPException(status_code=400, detail="Fichier PDF invalide")
    return StreamingResponse(
        io.BytesIO(output_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=compressed.pdf"},
    )


@router.post("/hash")
async def hash_endpoint(file: UploadFile = File(...)) -> dict[str, str]:
    data = await file.read()
    return await asyncio.to_thread(compute_hashes, data)


@router.post("/contrast")
async def contrast_endpoint(color_a: str = Form(...), color_b: str = Form(...)) -> dict[str, object]:
    try:
        return contrast_ratio(color_a, color_b)
    except ValueError:
        raise HTTPException(status_code=400, detail="Couleur invalide (format hexadécimal attendu)")


@router.post("/rename")
async def rename_endpoint(
    files: list[UploadFile] = File(...), pattern: str = Form("{name}"), start: int = Form(1)
) -> StreamingResponse:
    original_names = [f.filename or f"file_{i}" for i, f in enumerate(files)]
    contents = [await f.read() for f in files]
    try:
        new_names = await asyncio.to_thread(rename_batch, original_names, pattern, start)
    except (KeyError, ValueError) as e:
        raise HTTPException(status_code=400, detail=f"Pattern invalide: {e}")
    return zip_response(new_names, contents, "renamed_files.zip")

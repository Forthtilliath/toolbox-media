import logging
import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.routers import advanced, analysis, assets, background, images, misc, svg, videos

logger = logging.getLogger("toolbox_media")
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Toolbox Media API")

# Matches the frontend's MAX_FILE_BYTES (src/api/client.ts) *and* nginx's
# client_max_body_size (frontend/nginx.conf) — the client already rejects
# oversized files before sending, this is the server-side backstop for any
# other caller (curl, a future mobile client, a client running an old build).
MAX_UPLOAD_BYTES = 200 * 1024 * 1024


class MaxBodySizeMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get("content-length")
        if content_length is not None and int(content_length) > MAX_UPLOAD_BYTES:
            max_mb = MAX_UPLOAD_BYTES // (1024 * 1024)
            return JSONResponse(status_code=413, content={"detail": f"Fichier trop volumineux (max {max_mb} Mo)"})
        return await call_next(request)


class CatchAllExceptionMiddleware(BaseHTTPMiddleware):
    # An @app.exception_handler(Exception) is not enough here: FastAPI routes it to
    # the outermost ServerErrorMiddleware, which sits *outside* CORSMiddleware, so the
    # 500 response it builds never gets CORS headers and the browser's fetch() fails
    # with an opaque network error instead of surfacing the real detail. Catching the
    # exception here (added before CORSMiddleware, so it ends up wrapped by it) turns
    # it into a normal response before CORSMiddleware gets a chance to tag it.
    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except Exception as exc:
            logger.exception("Unhandled exception processing %s %s", request.method, request.url.path)
            return JSONResponse(status_code=500, content={"detail": str(exc)})


# In both docker-compose (nginx on :8080 proxying /api/ to this service) and
# `npm run dev` (Vite's proxy on :5173), the browser only ever calls this API
# same-origin — CORS only matters for a caller opening this port directly.
# Wildcard origins would let any third-party page trigger expensive work
# (rembg/ffmpeg) via a visitor's browser; restrict to known frontend origins,
# overridable via env for other deployments.
_default_origins = "http://localhost:8080,http://localhost:5173"
_origins_env = os.environ.get("CORS_ALLOWED_ORIGINS", _default_origins)
CORS_ALLOWED_ORIGINS = [origin.strip() for origin in _origins_env.split(",")]

app.add_middleware(MaxBodySizeMiddleware)
app.add_middleware(CatchAllExceptionMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.include_router(background.router, prefix="/api/background", tags=["background"])
app.include_router(images.router, prefix="/api/images", tags=["images"])
app.include_router(assets.router, prefix="/api/assets", tags=["assets"])
app.include_router(svg.router, prefix="/api/svg", tags=["svg"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["analysis"])
app.include_router(advanced.router, prefix="/api/advanced", tags=["advanced"])
app.include_router(misc.router, prefix="/api/misc", tags=["misc"])
app.include_router(videos.router, prefix="/api/videos", tags=["videos"])


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}

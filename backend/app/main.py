from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.routers import background, images, videos

app = FastAPI(title="Toolbox Media API")


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
            return JSONResponse(status_code=500, content={"detail": str(exc)})


app.add_middleware(CatchAllExceptionMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(background.router, prefix="/api/background", tags=["background"])
app.include_router(images.router, prefix="/api/images", tags=["images"])
app.include_router(videos.router, prefix="/api/videos", tags=["videos"])


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}

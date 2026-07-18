FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libgl1 \
    libcairo2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# The base image's bundled pip/setuptools have known CVEs of their own
# (install-time tooling, not runtime app code, but cheap to keep current).
RUN pip install --no-cache-dir --upgrade pip setuptools

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

# Run as an unprivileged user rather than the image's default root — limits
# what a code-execution bug in this app (or one of its many dependencies)
# could do to the container. rembg caches its ONNX model under $HOME/.u2net,
# which is also where docker-compose.yml mounts the rembg-models volume —
# pre-creating it here, owned by appuser, means Docker copies that ownership
# onto the volume the first time it's mounted (an empty/fresh named volume
# otherwise defaults to root, which would make rembg's model download fail
# with a permission error under this non-root user).
RUN useradd --create-home --home-dir /home/appuser appuser \
    && mkdir -p /home/appuser/.u2net \
    && chown -R appuser:appuser /app /home/appuser
USER appuser

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

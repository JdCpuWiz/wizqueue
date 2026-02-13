# System Dependencies

WizQueue requires some system-level dependencies for PDF processing.

## Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install -y graphicsmagick ghostscript
```

## macOS

```bash
brew install graphicsmagick ghostscript
```

## Docker

The system dependencies are already included in the Docker images. No additional setup needed.

## Why These Dependencies?

- **GraphicsMagick** - Image processing library used by pdf2pic to convert PDF pages to images
- **Ghostscript** - Renders PDF files for conversion

## Verifying Installation

```bash
# Check GraphicsMagick
gm version

# Check Ghostscript
gs --version
```

## Alternative: Using Docker Only

If you don't want to install these dependencies locally, you can run migrations outside Docker and do all development/testing using Docker Compose:

```bash
# Run backend in Docker for development
docker-compose run --rm backend npm run dev

# Access shell in container
docker-compose run --rm backend sh
```

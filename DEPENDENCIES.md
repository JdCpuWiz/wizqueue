# System Dependencies

WizQueue requires some system-level dependencies for PDF processing.

## Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
```

## macOS

```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman
```

## Docker

The system dependencies are already included in the Docker images. No additional setup needed.

## Why These Dependencies?

These packages are required for the `canvas` library, which is used with PDF.js to render PDF pages:
- **cairo** - 2D graphics library
- **pango** - Text rendering
- **libjpeg/libpng/libgif** - Image format support

## Verifying Installation

```bash
# Check if canvas dependencies are installed
pkg-config --exists cairo && echo "Cairo: OK"
pkg-config --exists pango && echo "Pango: OK"
```

## Alternative: Using Docker Only

If you don't want to install these dependencies locally, you can run migrations outside Docker and do all development/testing using Docker Compose:

```bash
# Run backend in Docker for development
docker-compose run --rm backend npm run dev

# Access shell in container
docker-compose run --rm backend sh
```

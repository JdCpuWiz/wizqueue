# WizQueue Deployment Guide

This directory contains Docker and deployment configurations for WizQueue.

## Quick Start with Docker Compose

### Prerequisites

- Docker and Docker Compose installed
- PostgreSQL database (can be on separate server)
- At least 4GB RAM for Ollama

### 1. Configure Environment

Copy the example environment file and configure it:

```bash
cp ../.env.example ../.env
```

Edit `.env` with your settings:
```bash
# Database (external PostgreSQL server)
DATABASE_HOST=your-postgres-server-ip
DATABASE_PORT=5432
DATABASE_NAME=wizqueue
DATABASE_USER=wizqueue_user
DATABASE_PASSWORD=your-secure-password

# Ollama (will run in Docker)
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=llava:latest

# Application
NODE_ENV=production
VITE_API_URL=http://your-server-ip/api
```

### 2. Run Database Migrations

Before starting the application, run migrations on your PostgreSQL server:

```bash
# From project root
npm install
npm run migrate
```

### 3. Pull Ollama Model

Start Ollama and pull the vision model:

```bash
docker-compose up -d ollama
docker exec -it wizqueue-ollama ollama pull llava
```

You can also use other vision models:
- `llava:latest` - Good balance of speed and accuracy
- `llama3.2-vision:latest` - Better accuracy, slower
- `llava:13b` - Higher quality, requires more resources

### 4. Start All Services

```bash
docker-compose up -d
```

This will start:
- **Backend** on port 3000
- **Frontend** on port 80
- **Ollama** on port 11434

### 5. Verify Deployment

Check service health:
```bash
curl http://localhost/health
```

View logs:
```bash
docker-compose logs -f backend
```

## Production Deployment

### SSL/HTTPS Setup

For production, you should use SSL. Here's how to add Let's Encrypt:

1. Install Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
```

2. Update nginx configuration to use SSL:
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # ... rest of config
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

3. Get certificate:
```bash
sudo certbot --nginx -d your-domain.com
```

### Firewall Configuration

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Resource Requirements

**Minimum:**
- 2 CPU cores
- 4GB RAM
- 20GB disk space

**Recommended:**
- 4 CPU cores
- 8GB RAM (more for Ollama with larger models)
- 50GB disk space
- GPU for faster Ollama processing

### External PostgreSQL Setup

If using a separate PostgreSQL server:

1. Create database and user:
```sql
CREATE DATABASE wizqueue;
CREATE USER wizqueue_user WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE wizqueue TO wizqueue_user;
```

2. Configure PostgreSQL to accept remote connections:
```bash
# Edit postgresql.conf
listen_addresses = '*'

# Edit pg_hba.conf
host    wizqueue    wizqueue_user    your-app-server-ip/32    md5
```

3. Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

## Monitoring

### View Service Status

```bash
docker-compose ps
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f ollama
```

### Resource Usage

```bash
docker stats
```

## Backup and Maintenance

### Backup Database

```bash
pg_dump -h your-postgres-server -U wizqueue_user wizqueue > backup.sql
```

### Backup Uploads

```bash
docker run --rm -v wizqueue_uploads:/data -v $(pwd):/backup \
  alpine tar czf /backup/uploads-backup.tar.gz /data
```

### Update Application

```bash
git pull
docker-compose build
docker-compose up -d
```

### Clean Up

Remove unused Docker resources:
```bash
docker system prune -a
```

## Troubleshooting

### Backend can't connect to database

Check database connectivity:
```bash
docker exec -it wizqueue-backend sh
nc -zv your-postgres-server 5432
```

Verify environment variables:
```bash
docker exec wizqueue-backend env | grep DATABASE
```

### Ollama not working

Check Ollama status:
```bash
docker exec -it wizqueue-ollama ollama list
```

Test Ollama API:
```bash
curl http://localhost:11434/api/tags
```

Pull model if missing:
```bash
docker exec -it wizqueue-ollama ollama pull llava
```

### High memory usage

Ollama vision models require significant RAM. If experiencing issues:

1. Use a smaller model (llava:7b instead of llava:13b)
2. Increase Docker memory limit
3. Add swap space to your server

### PDF extraction not working

Check backend logs:
```bash
docker-compose logs backend | grep -i ollama
```

Verify Ollama connectivity from backend:
```bash
docker exec wizqueue-backend wget -O- http://ollama:11434/api/tags
```

## Scaling

For high-traffic deployments:

1. **Multiple backend instances** with load balancer
2. **PostgreSQL replication** for read replicas
3. **Redis** for session/cache storage
4. **CDN** for static frontend assets
5. **Separate Ollama server** with GPU acceleration

## Security Checklist

- [ ] Use strong database passwords
- [ ] Enable SSL/HTTPS
- [ ] Configure firewall rules
- [ ] Regularly update Docker images
- [ ] Implement rate limiting
- [ ] Set up monitoring and alerts
- [ ] Regular database backups
- [ ] Secure file upload directory
- [ ] Use environment variables (never hardcode secrets)

## Support

For issues and questions:
- GitHub Issues: https://github.com/yourusername/wizqueue/issues
- Documentation: https://github.com/yourusername/wizqueue

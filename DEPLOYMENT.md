# Deployment Guide

This guide covers deploying Community Hub to a single VPS (DigitalOcean, Hetzner, Linode, etc.) using Docker.

## 📋 Prerequisites

- VPS with Ubuntu 22.04+ (2GB RAM minimum, 4GB recommended)
- Domain name pointed to your VPS IP
- SSH access to the VPS
- Local: SSH client + Docker (optional)

## 🏗 Architecture Overview

```
Internet
   │
   ▼
[Nginx (reverse proxy + SSL)]
   │
   ├── /api/*    →  backend:5000
   ├── /uploads/* → backend:5000
   └── /*        →  web-admin (static)
```

## Step 1 — Server Setup

```bash
# SSH into server
ssh root@your-server-ip

# Create non-root user
adduser community
usermod -aG sudo community
su - community

# Update system
sudo apt update && sudo apt upgrade -y
```

## Step 2 — Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker community
newgrp docker

# Verify
docker --version
docker compose version
```

## Step 3 — Clone & Configure

```bash
# Clone repo
cd /opt
sudo git clone <your-repo-url> community-hub
sudo chown -R community:community community-hub
cd community-hub

# Create production env file
cp .env.example .env
nano .env   # Fill in real values (see below)
```

**Critical `.env` values for production:**

```env
NODE_ENV=production
POSTGRES_PASSWORD=<strong-random-password>
JWT_ACCESS_SECRET=<openssl-rand-base64-64>
JWT_REFRESH_SECRET=<openssl-rand-base64-64>
# Real Cloudinary, SMTP, etc.
```

## Step 4 — Build & Start

```bash
# Build images
docker compose build

# Start services
docker compose up -d

# Run migrations
docker compose exec backend npx prisma migrate deploy

# (Optional) Seed
docker compose exec backend npm run db:seed

# Verify
curl http://localhost:5000/api/health
```

## Step 5 — Domain & SSL

### Option A: Nginx + Let's Encrypt (recommended)

```bash
# Install nginx + certbot
sudo apt install -y nginx certbot python3-certbot-nginx

# Configure nginx
sudo nano /etc/nginx/sites-available/community
```

```nginx
server {
    listen 80;
    server_name community.example.com;

    location / {
        proxy_pass http://localhost:5000;  # Or 5173 for web-admin
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/community /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL
sudo certbot --nginx -d community.example.com
```

### Option B: Cloudflare Tunnel (zero-config SSL)

If your domain is on Cloudflare:

```bash
# Install cloudflared
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null
echo 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared focal main' | sudo tee /etc/apt/sources.list.d/cloudflared.list
sudo apt update && sudo apt install -y cloudflared

# Authenticate
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create community-hub
cloudflared tunnel route dns community-hub community.example.com

# Run
cloudflared tunnel run community-hub
```

## Step 6 — Backups

```bash
# Create backup script
sudo nano /opt/community-hub/scripts/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR=/opt/backups/community-hub
DATE=$(date +%Y%m%d-%H%M%S)

mkdir -p $BACKUP_DIR
docker compose exec -T postgres pg_dump -U postgres community_db | gzip > $BACKUP_DIR/db-$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -type f -mtime +30 -delete
```

```bash
chmod +x /opt/community-hub/scripts/backup.sh

# Add to crontab (daily 2 AM)
crontab -e
# Add line:
0 2 * * * /opt/community-hub/scripts/backup.sh
```

## Step 7 — Monitoring

### Uptime Monitoring (free)

Use [UptimeRobot](https://uptimerobot.com) or [BetterStack](https://betterstack.com) to monitor:
- `https://community.example.com/api/health`

### Error Tracking

1. Sign up at [sentry.io](https://sentry.io) (free tier: 5K events/month)
2. Create a new project (Node + React)
3. Copy DSN to `.env`:
   ```
   SENTRY_DSN=https://...@sentry.io/...
   ```
4. Restart: `docker compose restart backend`

## Step 8 — App Store / Play Store (later)

When ready to release mobile apps publicly:

### Google Play Store
- Sign up: https://play.google.com/console ($25 one-time)
- Build: `flutter build appbundle --release`
- Upload AAB

### Apple App Store
- Sign up: https://developer.apple.com ($99/year)
- Build: `flutter build ipa --release`
- Submit via Transporter or Xcode

## 🔄 Updates

```bash
cd /opt/community-hub
git pull
docker compose build
docker compose up -d
docker compose exec backend npx prisma migrate deploy
```

## 🆘 Troubleshooting

### Backend won't start
```bash
docker compose logs backend
# Check DATABASE_URL, JWT secrets
```

### Database connection refused
```bash
docker compose ps
docker compose logs postgres
# Check POSTGRES_PASSWORD matches DATABASE_URL
```

### Migrations failed
```bash
docker compose exec backend npx prisma migrate reset
# WARNING: Drops data. Use only in dev/staging.
```

### Out of disk space
```bash
docker system prune -a --volumes   # Nuclear option
# Or selectively:
docker image prune
docker volume prune
```

## 💰 Cost Estimate (DigitalOcean)

| Resource | Size | Monthly Cost |
|----------|------|--------------|
| Droplet   | 4GB / 2 vCPU / 80GB SSD | $24 |
| Backups   | +20% of droplet | $5 |
| Domain    | .com | $12/year |
| Cloudinary | Free tier | $0 |
| UptimeRobot | Free tier | $0 |
| **Total** | | **~$30/mo** |

For production with >1000 users, scale to 8GB droplet ($48/mo).

# Production Deployment Guide: AWS EC2

This guide outlines step-by-step instructions to deploy the AI Resume Builder SaaS application on an **AWS EC2 (Ubuntu 22.04 LTS)** instance using **Docker Compose** and securing it with **Let's Encrypt SSL (HTTPS)**.

---

## Step 1: Launch and Configure AWS EC2 Instance

1. Log in to the **AWS Management Console** and navigate to **EC2**.
2. Click **Launch Instance**:
   * **Name**: `ai-resume-builder-saas`
   * **OS (AMI)**: `Ubuntu Server 22.04 LTS (HVM), SSD Volume Type`
   * **Instance Type**: `t3.medium` (Minimum recommended for building/compiling containers: 2 vCPUs, 4GB RAM)
   * **Key Pair**: Create or select an existing `.pem` key pair for SSH access.
3. **Configure Security Group**:
   Create a new security group and add the following inbound rules:
   * **SSH** (Port 22): Source `My IP` (For secure server command line access)
   * **HTTP** (Port 80): Source `0.0.0.0/0` (For web application traffic and Let's Encrypt validation)
   * **HTTPS** (Port 443): Source `0.0.0.0/0` (For secure encrypted traffic)
   * **Custom TCP** (Port 8080): Source `0.0.0.0/0` (Optional: only if you wish to query the backend port directly)
4. Launch the instance and copy its **Public IPv4 Address**.

---

## Step 2: Configure Domain Name System (DNS)

To secure your application with SSL, you must map a domain name to your EC2 instance's IP.
1. Log in to your DNS registrar (e.g., Route 53, GoDaddy, Namecheap).
2. Add an **A Record** pointing your domain (e.g., `resume.yourdomain.com`) to the **Public IPv4 Address** of your EC2 instance.

---

## Step 3: Install Docker and Docker Compose on EC2

Connect to your EC2 instance via SSH:
```bash
ssh -i /path/to/key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

Run the following commands to update the system and install Docker:
```bash
# Update package database
sudo apt-get update -y
sudo apt-get upgrade -y

# Install Docker dependencies
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up the stable repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.github.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add ubuntu user to docker group (so you don't need 'sudo' for docker commands)
sudo usermod -aG docker ubuntu
```
*Note: Log out and log back in to apply group changes.*

---

## Step 4: Transfer Codebase and Start Application

1. Zip your project files (excluding `node_modules`, `target`, and `maven-bin` directories).
2. Transfer the zip archive to your EC2 server using `scp`:
   ```bash
   scp -i /path/to/key.pem project.zip ubuntu@YOUR_EC2_PUBLIC_IP:/home/ubuntu/
   ```
3. SSH back into the EC2 instance, unzip the archive, and navigate to the directory:
   ```bash
   sudo apt install unzip -y
   unzip project.zip -d ai-resume-builder
   cd ai-resume-builder
   ```
4. Verify/Modify the environment variables inside `docker-compose.yml` (e.g., set your `MISTRAL_API_KEY` for production).
5. Build and launch all services in detached background mode:
   ```bash
   docker compose up --build -d
   ```
6. Verify containers are active:
   ```bash
   docker compose ps
   ```

At this point, you can navigate to `http://resume.yourdomain.com` in your browser. The site will load successfully but will show as "Not Secure" (HTTP).

---

## Step 5: Secure with SSL (HTTPS) via Certbot

To generate and install a free Let's Encrypt SSL certificate:

1. Install Certbot on the EC2 host:
   ```bash
   sudo apt install certbot -y
   ```
2. Stop the docker containers temporarily to free up Port 80 for verification:
   ```bash
   docker compose down
   ```
3. Request the certificate (replace with your actual email and domain):
   ```bash
   sudo certbot certonly --standalone -d resume.yourdomain.com --email webmaster@yourdomain.com --agree-tos --non-interactive
   ```
   *Certbot will save your keys under `/etc/letsencrypt/live/resume.yourdomain.com/`.*

4. Reconfigure your `docker-compose.yml` and Nginx setups to load the SSL certificates. Mount the certificate files from the host to the Nginx frontend container inside your compose configuration:

   *Edit the `frontend` service in `docker-compose.yml` to expose port `443` and map volumes:*
   ```yaml
     frontend:
       build:
         context: ./frontend
         dockerfile: Dockerfile
       container_name: resume-frontend
       restart: always
       ports:
         - "80:80"
         - "443:443"
       volumes:
         - /etc/letsencrypt:/etc/letsencrypt:ro
       depends_on:
         - backend
       networks:
         - resume-net
   ```

5. Modify the Nginx configuration on the server to handle SSL handshakes:
   *Modify `frontend/nginx.conf` (or `/etc/nginx/conf.d/default.conf` inside the frontend image):*
   ```nginx
   server {
       listen 80;
       server_name resume.yourdomain.com;
       # Redirect HTTP to HTTPS
       return 301 https://$host$request_uri;
   }

   server {
       listen 443 ssl;
       server_name resume.yourdomain.com;

       ssl_certificate /etc/letsencrypt/live/resume.yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/resume.yourdomain.com/privkey.pem;

       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers HIGH:!aNULL:!MD5;

       location / {
           root /usr/share/nginx/html;
           index index.html index.htm;
           try_files $uri $uri/ /index.html;
       }

       location /api {
           proxy_pass http://backend:8080;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded-for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

6. Restart the Docker container environment:
   ```bash
   docker compose up --build -d
   ```

Your application is now fully deployed and secured under **`https://resume.yourdomain.com`**!

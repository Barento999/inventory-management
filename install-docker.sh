#!/bin/bash

echo "🐳 Installing Docker for Linux..."

# Update system
echo "📦 Updating package manager..."
sudo apt-get update

# Install Docker
echo "📦 Installing Docker..."
sudo apt-get install -y docker.io docker-compose

# Enable Docker service
echo "⚙️  Enabling Docker service..."
sudo systemctl start docker
sudo systemctl enable docker

# Add current user to docker group (optional - allows docker without sudo)
echo "👤 Adding user to docker group..."
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
echo ""
echo "✅ Docker installation complete!"
echo ""
docker --version
docker-compose --version

echo ""
echo "ℹ️  Note: You may need to log out and log back in for group changes to take effect."
echo ""
echo "📝 Quick start:"
echo "   cd /home/barento/Desktop/inventory-management-SaaS"
echo "   docker-compose up -d"

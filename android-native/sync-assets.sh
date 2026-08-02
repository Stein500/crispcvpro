#!/bin/bash

# Script to sync website files to Android assets
# Run this after making changes to the website

echo "Syncing website files to Android assets..."

# Source directory (website root)
SRC_DIR="$(dirname "$0")/../"

# Destination directory (Android assets)
DEST_DIR="$(dirname "$0")/app/src/main/assets/public"

# Create destination directory
mkdir -p "$DEST_DIR"

# Files and directories to copy
FILES=(
    "index.html"
    "manifest.webmanifest"
    "robots.txt"
    "sitemap.xml"
    "vercel.json"
    "assets"
    "creer-mon-cv"
    "convertisseur"
    "guides"
    "a-propos"
    "notifications"
    "confidentialite"
)

# Copy each file/directory
for item in "${FILES[@]}"; do
    if [ -e "$SRC_DIR/$item" ]; then
        echo "Copying: $item"
        cp -r "$SRC_DIR/$item" "$DEST_DIR/"
    else
        echo "Warning: $item not found"
    fi
done

echo "Sync complete!"
echo "Files copied to: $DEST_DIR"

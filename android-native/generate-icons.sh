#!/bin/bash

# Script to generate Android icons from a source image
# Requires ImageMagick (convert command)

echo "Android Icon Generator"
echo "====================="
echo ""

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ERROR: ImageMagick (convert) is not installed"
    echo ""
    echo "To install in Termux:"
    echo "  pkg install imagemagick"
    echo ""
    echo "To install on Ubuntu/Debian:"
    echo "  sudo apt install imagemagick"
    echo ""
    echo "To install on Mac:"
    echo "  brew install imagemagick"
    exit 1
fi

# Check if source image exists
SRC_IMAGE="assets/img/favicon.png"
if [ ! -f "$SRC_IMAGE" ]; then
    SRC_IMAGE="assets/img/favicon.ico"
    if [ ! -f "$SRC_IMAGE" ]; then
        SRC_IMAGE="assets/img/favicon.svg"
        if [ ! -f "$SRC_IMAGE" ]; then
            echo "ERROR: No source icon found in assets/img/"
            echo "Please add a favicon.png, favicon.ico, or favicon.svg file"
            exit 1
        fi
    fi
fi

echo "Source image: $SRC_IMAGE"
echo ""

# Create mipmap directories
mkdir -p app/src/main/res/{mipmap-mdpi,mipmap-hdpi,mipmap-xhdpi,mipmap-xxhdpi,mipmap-xxxhdpi}

# Generate icons in different sizes
# Android icon sizes:
# mdpi: 48x48
# hdpi: 72x72
# xhdpi: 96x96
# xxhdpi: 144x144
# xxxhdpi: 192x192

echo "Generating icons..."

# mdpi (48x48)
convert "$SRC_IMAGE" -resize 48x48! -background none -gravity center -extent 48x48 app/src/main/res/mipmap-mdpi/ic_launcher.png
echo "✓ mdpi (48x48)"

# hdpi (72x72)
convert "$SRC_IMAGE" -resize 72x72! -background none -gravity center -extent 72x72 app/src/main/res/mipmap-hdpi/ic_launcher.png
echo "✓ hdpi (72x72)"

# xhdpi (96x96)
convert "$SRC_IMAGE" -resize 96x96! -background none -gravity center -extent 96x96 app/src/main/res/mipmap-xhdpi/ic_launcher.png
echo "✓ xhdpi (96x96)"

# xxhdpi (144x144)
convert "$SRC_IMAGE" -resize 144x144! -background none -gravity center -extent 144x144 app/src/main/res/mipmap-xxhdpi/ic_launcher.png
echo "✓ xxhdpi (144x144)"

# xxxhdpi (192x192)
convert "$SRC_IMAGE" -resize 192x192! -background none -gravity center -extent 192x192 app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
echo "✓ xxxhdpi (192x192)"

# Also generate round icons (optional)
# For this, we need a circular mask
# Create a simple circle mask
MASK_FILE="/tmp/circle_mask.png"
convert -size 192x192 xc:none -fill black -draw "circle 96,96 96,0" "$MASK_FILE"

# Generate round icons
for size_dir in mdpi hdpi xhdpi xxhdpi xxxhdpi; do
    size=${size_dir%%-*}
    case $size_dir in
        mdpi) size=48 ;;
        hdpi) size=72 ;;
        xhdpi) size=96 ;;
        xxhdpi) size=144 ;;
        xxxhdpi) size=192 ;;
    esac
    
    # Resize mask
    convert "$MASK_FILE" -resize ${size}x${size}! /tmp/circle_mask_${size}.png
    
    # Apply mask
    convert "$SRC_IMAGE" -resize ${size}x${size}! -background none -gravity center -extent ${size}x${size} \
        /tmp/circle_mask_${size}.png -alpha off -compose CopyOpacity -composite \
        app/src/main/res/mipmap-${size_dir}/ic_launcher_round.png
    echo "✓ ${size_dir} round (${size}x${size})"
done

# Clean up
rm -f "$MASK_FILE" /tmp/circle_mask_*.png

echo ""
echo "Icons generated successfully!"
echo ""
echo "Icon files created in:"
for dir in mdpi hdpi xhdpi xxhdpi xxxhdpi; do
    echo "  - app/src/main/res/mipmap-${dir}/ic_launcher.png"
    echo "  - app/src/main/res/mipmap-${dir}/ic_launcher_round.png"
done

#!/bin/bash

# Exit on error
set -e

# Install dependencies
npm install

# Build the Next.js application
npm run build

# Make the script executable
chmod +x build.sh
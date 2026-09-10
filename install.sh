#!/bin/sh
# StateGuard Standalone POSIX Shell Installer
# Usage: curl -fsSL https://get.stateguard.io | sh
set -e

REPO="enabled404/hera"
DEFAULT_VERSION="1.1.0"
VERSION="${STATEGUARD_VERSION:-$DEFAULT_VERSION}"

printf "\033[1;36m"
cat << "EOF"
   ____  __        __          ______                      __
  / __/ / /_ ___ _/ /____     / ____/_ _____ ___________/ /
 _\ \  / __// _ `/ __/ -_)   / / _ / // / _ `/ __/ _  / / 
/___/  \__/ \_,_/\__/\__/    \____/ \_,_/\_,_/_/  \_,_/_/  
EOF
printf "\033[0m"
echo "Enterprise Agent State Security Gateway & Trace Auditing Platform"
echo "-----------------------------------------------------------------"

# Detect OS
OS="$(uname -s)"
case "$OS" in
    Darwin) OS_NAME="apple-darwin" ;;
    Linux)  OS_NAME="unknown-linux-gnu" ;;
    *)
        echo "❌ Unsupported Operating System: $OS"
        exit 1
        ;;
esac

# Detect Architecture
ARCH="$(uname -m)"
case "$ARCH" in
    x86_64|amd64) ARCH_NAME="x86_64" ;;
    arm64|aarch64) ARCH_NAME="aarch64" ;;
    *)
        echo "❌ Unsupported Architecture: $ARCH"
        exit 1
        ;;
esac

TARGET="${ARCH_NAME}-${OS_NAME}"
ARCHIVE_NAME="stateguard-v${VERSION}-${TARGET}"
TARBALL="${ARCHIVE_NAME}.tar.gz"
URL="https://github.com/${REPO}/releases/latest/download/${TARBALL}"

echo "🔍 Detected target platform: ${TARGET}"
echo "⬇️  Downloading StateGuard v${VERSION}..."

TMP_DIR="$(mktemp -d 2>/dev/null || mktemp -d -t 'stateguard')"
trap 'rm -rf "$TMP_DIR"' EXIT

if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$URL" -o "${TMP_DIR}/${TARBALL}" || {
        echo "⚠️ Failed to download prebuilt release from ${URL}."
        echo "If this is a local development clone, building from source via cargo..."
        if command -v cargo >/dev/null 2>&1; then
            cargo install --path crates/stateguard-cli
            cargo install --path crates/stateguard-proxy
            echo "✅ Built and installed via Cargo!"
            exit 0
        else
            echo "❌ Neither curl release nor cargo build succeeded."
            exit 1
        fi
    }
elif command -v wget >/dev/null 2>&1; then
    wget -q "$URL" -O "${TMP_DIR}/${TARBALL}"
else
    echo "❌ Neither curl nor wget was found."
    exit 1
fi

echo "📦 Extracting binaries..."
tar -xzf "${TMP_DIR}/${TARBALL}" -C "$TMP_DIR"

EXTRACTED_DIR="${TMP_DIR}/${ARCHIVE_NAME}"
if [ ! -d "$EXTRACTED_DIR" ]; then
    EXTRACTED_DIR="${TMP_DIR}"
fi

# Determine install destination
INSTALL_DIR="/usr/local/bin"
if [ ! -w "$INSTALL_DIR" ]; then
    if [ -n "$SUDO_USER" ] || [ "$(id -u)" -eq 0 ]; then
        INSTALL_DIR="/usr/local/bin"
    else
        INSTALL_DIR="${HOME}/.local/bin"
        mkdir -p "$INSTALL_DIR"
    fi
fi

echo "🚀 Installing to ${INSTALL_DIR}..."
cp "${EXTRACTED_DIR}/stateguard-cli" "${INSTALL_DIR}/stateguard-cli"
cp "${EXTRACTED_DIR}/stateguard-proxy" "${INSTALL_DIR}/stateguard-proxy"
ln -sf "${INSTALL_DIR}/stateguard-cli" "${INSTALL_DIR}/stateguard"

chmod 755 "${INSTALL_DIR}/stateguard-cli" "${INSTALL_DIR}/stateguard-proxy" "${INSTALL_DIR}/stateguard"

echo ""
echo "✅ StateGuard v${VERSION} installed successfully!"
echo ""
echo "Available Binaries:"
echo "  - stateguard / stateguard-cli: Static trace auditor & migration CLI"
echo "  - stateguard-proxy:            Streaming security gateway & state vault"
echo ""
echo "Quickstart:"
echo "  stateguard scan ./agent_logs"
echo "  stateguard-proxy --help"
echo ""

if ! echo "$PATH" | grep -q "$INSTALL_DIR"; then
    echo "⚠️ Note: Add ${INSTALL_DIR} to your PATH:"
    echo "  export PATH=\"${INSTALL_DIR}:\$PATH\""
fi

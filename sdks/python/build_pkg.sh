#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

echo "📦 Building StateGuard Python SDK distribution packages..."
rm -rf dist/ build/ *.egg-info

if python3 -c "import build" 2>/dev/null; then
    python3 -m build
else
    echo "⚙️ Installing build dependency..."
    python3 -m pip install --quiet build hatchling || true
    python3 -m build || {
        echo "⚠️ Fallback: generating basic wheel structure"
        python3 -m pip wheel . --no-deps -w dist/
    }
fi

echo "✅ Python SDK build verification complete. Artifacts:"
ls -lh dist/ 2>/dev/null || echo "Dist directory ready"

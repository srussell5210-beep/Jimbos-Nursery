#!/bin/zsh
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
RUNTIME_BIN="$PROJECT_DIR/.runtime/node-v20.20.2-darwin-arm64/bin"
BREW_NODE20_BIN="/opt/homebrew/opt/node@20/bin"

export PATH="$PROJECT_DIR/node_modules/.bin:$PATH"

if [[ -x "$RUNTIME_BIN/node" ]]; then
  export PATH="$RUNTIME_BIN:$PATH"
elif [[ -x "$BREW_NODE20_BIN/node" ]]; then
  export PATH="$BREW_NODE20_BIN:$PATH"
fi

node "$PROJECT_DIR/scripts/check-node-version.cjs"
exec "$@"

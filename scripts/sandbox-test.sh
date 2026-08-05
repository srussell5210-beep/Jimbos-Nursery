#!/usr/bin/env bash
#
# Sandbox test helper for the Clover "Connect" flow.
# Run from the project root:  bash scripts/sandbox-test.sh
#
# It will:
#   1. Check your sandbox App ID/Secret are set in .env
#   2. Start a Cloudflare tunnel and grab its public URL
#   3. Write that URL into SITE_URL in .env (so the OAuth redirect is correct)
#   4. Print the exact redirect URL to register in your Clover sandbox app
#   5. Start the dev server
#
# You still do two things by hand (they need your Clover account):
#   - put your SANDBOX CLOVER_APP_ID / CLOVER_APP_SECRET in .env
#   - register the printed redirect URL in the Clover app's REST Configuration

set -euo pipefail
cd "$(dirname "$0")/.."

# 1. Make sure credentials are filled in
if ! grep -qE '^CLOVER_APP_ID="[^"]+"' .env || ! grep -qE '^CLOVER_APP_SECRET="[^"]+"' .env; then
  echo "❌ Set CLOVER_APP_ID and CLOVER_APP_SECRET (your SANDBOX values) in .env first, then re-run."
  exit 1
fi
echo "✅ Clover app credentials found in .env"

# 2. Start the tunnel
echo "▶  Starting Cloudflare tunnel..."
TUNNEL_LOG="$(mktemp)"
npx -y cloudflared tunnel --url http://localhost:3002 >"$TUNNEL_LOG" 2>&1 &
TUNNEL_PID=$!
trap 'kill "$TUNNEL_PID" 2>/dev/null || true' EXIT

URL=""
for _ in $(seq 1 40); do
  URL="$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$TUNNEL_LOG" | head -1 || true)"
  [ -n "$URL" ] && break
  sleep 1
done
if [ -z "$URL" ]; then
  echo "❌ Could not read a tunnel URL. Tunnel output:"; cat "$TUNNEL_LOG"; exit 1
fi
echo "✅ Tunnel is up: $URL"

# 3. Write SITE_URL into .env
if grep -qE '^SITE_URL=' .env; then
  sed -i '' "s#^SITE_URL=.*#SITE_URL=\"$URL\"#" .env
else
  printf '\nSITE_URL="%s"\n' "$URL" >> .env
fi
echo "✅ SITE_URL set in .env"

# 4. Remind about the Clover-side registration
cat <<EOF

────────────────────────────────────────────────────────────
⚠️  In your Clover SANDBOX app → REST Configuration, set the
    Site URL / redirect URI to EXACTLY:

      $URL/api/admin/clover/callback

    Then open:  $URL/admin
    Log in as cwoolsey and click "Connect Clover".
────────────────────────────────────────────────────────────

▶  Starting dev server (press Ctrl+C to stop the server and tunnel)...
EOF

# 5. Start the dev server (keeps running in foreground)
npm run dev

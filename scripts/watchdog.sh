#!/bin/zsh
set -u

PROJECT_DIR="/Users/samuelrussell/Desktop/Jimbos-Nursery"
PORT="3002"
LOCAL_URL="http://localhost:${PORT}"
RECIPIENTS=("sam@arcestra.ai" "cwooly33@gmail.com")

LOG_DIR="$HOME/Library/Logs/jimbos-nursery"
STATE_DIR="$HOME/Library/Application Support/JimbosNurseryWatchdog"
SITE_LOG="$LOG_DIR/website.log"
TUNNEL_LOG="$LOG_DIR/tunnel.log"
WATCHDOG_LOG="$LOG_DIR/watchdog.log"
SITE_PID_FILE="$STATE_DIR/site.pid"
TUNNEL_PID_FILE="$STATE_DIR/tunnel.pid"
URL_FILE="$STATE_DIR/cloudflare-url.txt"
LAST_NOTIFIED_FILE="$STATE_DIR/last-notified-url.txt"
LOCK_DIR="$STATE_DIR/run.lock"
TUNNEL_RESTARTED=0

PATH="$PROJECT_DIR/.runtime/node-v20.20.2-darwin-arm64/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"

mkdir -p "$LOG_DIR" "$STATE_DIR"

log() {
  print -r -- "$(date '+%Y-%m-%d %H:%M:%S') $*" >> "$WATCHDOG_LOG"
}

url_is_up() {
  local url="$1"
  if /usr/bin/curl --fail --silent --location --max-time 12 --output /dev/null "$url" 2>> "$WATCHDOG_LOG"; then
    return 0
  fi

  if [[ "$url" == https://*.trycloudflare.com* ]]; then
    local host ip
    host="${url#https://}"
    host="${host%%/*}"
    ip="$(/usr/bin/dig +short "$host" @1.1.1.1 A 2>/dev/null | /usr/bin/head -1)"
    if [[ -n "$ip" ]]; then
      /usr/bin/curl --fail --silent --location --max-time 12 --resolve "${host}:443:${ip}" --output /dev/null "$url" 2>> "$WATCHDOG_LOG"
      return $?
    fi
  fi

  return 1
}

local_is_up() {
  /usr/bin/curl --fail --silent --location --max-time 12 "$LOCAL_URL" 2>> "$WATCHDOG_LOG" | /usr/bin/grep -q "Jimbo's Nursery"
}

kill_pid_file() {
  local pid_file="$1"
  if [[ -f "$pid_file" ]]; then
    local pid
    pid="$(cat "$pid_file" 2>/dev/null || true)"
    if [[ -n "$pid" ]] && /bin/kill -0 "$pid" 2>/dev/null; then
      /bin/kill "$pid" 2>/dev/null || true
    fi
    rm -f "$pid_file"
  fi
}

kill_matching_processes() {
  /usr/bin/pkill -f "cloudflared tunnel --url http://localhost:${PORT}" 2>/dev/null || true
  /usr/bin/pkill -f "cloudflared tunnel --url http://localhost:3000" 2>/dev/null || true
}

wait_for_local() {
  local attempts="${1:-45}"
  local i
  for i in {1..$attempts}; do
    if local_is_up; then
      return 0
    fi
    sleep 1
  done
  return 1
}

start_site_if_needed() {
  if local_is_up; then
    log "Website is up at $LOCAL_URL"
    return 0
  fi

  log "Website is down. Restarting Next.js on port $PORT."
  kill_pid_file "$SITE_PID_FILE"
  /usr/bin/pkill -f "$PROJECT_DIR/node_modules/.bin/next dev" 2>/dev/null || true
  /usr/sbin/lsof -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null | /usr/bin/xargs /bin/kill 2>/dev/null || true
  sleep 2

  cd "$PROJECT_DIR" || return 1
  rm -rf .next
  : > "$SITE_LOG"
  /usr/bin/nohup npm run dev >> "$SITE_LOG" 2>&1 &
  print -r -- "$!" > "$SITE_PID_FILE"

  if wait_for_local 60; then
    log "Website recovered at $LOCAL_URL"
    return 0
  fi

  log "Website failed to recover. See $SITE_LOG"
  return 1
}

extract_tunnel_url() {
  /usr/bin/grep -Eo 'https://[a-zA-Z0-9.-]+\.trycloudflare\.com' "$TUNNEL_LOG" 2>/dev/null | /usr/bin/tail -1
}

current_tunnel_is_up() {
  if [[ ! -f "$URL_FILE" ]]; then
    return 1
  fi

  local url
  url="$(cat "$URL_FILE" 2>/dev/null || true)"
  [[ -n "$url" ]] || return 1
  url_is_up "$url"
}

wait_for_tunnel_url() {
  local attempts="${1:-60}"
  local i url
  for i in {1..$attempts}; do
    url="$(extract_tunnel_url)"
    if [[ -n "$url" ]]; then
      print -r -- "$url" > "$URL_FILE"
      if url_is_up "$url"; then
        log "Tunnel verified at $url"
        return 0
      fi
    fi
    sleep 1
  done
  return 1
}

start_tunnel_if_needed() {
  if current_tunnel_is_up; then
    log "Tunnel is up at $(cat "$URL_FILE")"
    return 0
  fi

  log "Tunnel is down or stale. Restarting Cloudflare tunnel."
  local attempt
  for attempt in 1 2 3; do
    log "Starting Cloudflare tunnel attempt $attempt."
    kill_pid_file "$TUNNEL_PID_FILE"
    kill_matching_processes
    rm -f "$URL_FILE"
    sleep 2

    cd "$PROJECT_DIR" || return 1
    : > "$TUNNEL_LOG"
    /usr/bin/nohup npm run demo:tunnel >> "$TUNNEL_LOG" 2>&1 &
    print -r -- "$!" > "$TUNNEL_PID_FILE"

    if wait_for_tunnel_url 75; then
      TUNNEL_RESTARTED=1
      return 0
    fi
  done

  log "Tunnel failed to recover. See $TUNNEL_LOG"
  return 1
}

send_email() {
  local url="$1"
  local previous=""
  if [[ -f "$LAST_NOTIFIED_FILE" ]]; then
    previous="$(cat "$LAST_NOTIFIED_FILE" 2>/dev/null || true)"
  fi

  if [[ "$previous" == "$url" ]]; then
    log "URL $url was already emailed. Skipping duplicate notification."
    return 0
  fi

  local subject="Jimbo's Nursery gateway is online"
  local body
  body="Jimbo's Nursery is up and functioning.

Website: $LOCAL_URL
Cloudflare gateway: $url

This message was sent by the local Jimbo's Nursery watchdog on $(date)."

  if printf '%s\n' "$body" | /usr/bin/mail -s "$subject" "${RECIPIENTS[@]}"; then
    print -r -- "$url" > "$LAST_NOTIFIED_FILE"
    log "Notification email sent for $url to ${RECIPIENTS[*]}"
    return 0
  fi

  local eml="$STATE_DIR/jimbos-gateway-$(date '+%Y%m%d-%H%M%S').eml"
  {
    print -r -- "To: ${RECIPIENTS[*]}"
    print -r -- "Subject: $subject"
    print -r -- ""
    print -r -- "$body"
  } > "$eml"
  log "Email command failed. Wrote fallback message to $eml"
  return 1
}

main() {
  local forced="${1:-}"
  if ! mkdir "$LOCK_DIR" 2>/dev/null; then
    log "Another watchdog check is already running. Exiting."
    exit 0
  fi
  trap 'rm -rf "$LOCK_DIR"' EXIT INT TERM

  log "Watchdog check started."

  if [[ "$forced" == "--restart" ]]; then
    log "Forced restart requested."
    kill_pid_file "$SITE_PID_FILE"
    kill_pid_file "$TUNNEL_PID_FILE"
    /usr/bin/pkill -f "$PROJECT_DIR/node_modules/.bin/next dev" 2>/dev/null || true
    kill_matching_processes
    /usr/sbin/lsof -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null | /usr/bin/xargs /bin/kill 2>/dev/null || true
    rm -f "$URL_FILE"
    sleep 2
  fi

  start_site_if_needed || exit 1
  start_tunnel_if_needed || exit 1

  local tunnel_url
  tunnel_url="$(cat "$URL_FILE" 2>/dev/null || true)"
  if [[ -z "$tunnel_url" ]]; then
    log "No tunnel URL available after recovery."
    exit 1
  fi

  if [[ "$forced" == "--notify" || "$forced" == "--restart" || "$TUNNEL_RESTARTED" == "1" ]]; then
    send_email "$tunnel_url" || exit 1
  fi

  log "Watchdog check complete."
  rm -rf "$LOCK_DIR"
  trap - EXIT INT TERM
}

if [[ "${1:-}" == "--daemon" ]]; then
  while true; do
    main ""
    sleep 60
  done
else
  main "${1:-}"
fi

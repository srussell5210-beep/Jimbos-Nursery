# Jimbo's Nursery — GoDaddy cPanel Deployment Guide

**Stack:** Next.js 14 · Prisma SQLite · Node.js 20 · GoDaddy cPanel Node.js Application Manager

---

## Table of Contents

1. [Prerequisites — Mac Setup](#prerequisites--mac-setup)
2. [Step 1 — Open cPanel](#step-1--open-cpanel)
3. [Step 2 — Create the Node.js Application](#step-2--create-the-nodejs-application)
4. [Step 3 — Upload Project Files](#step-3--upload-project-files)
5. [Step 4 — Set Environment Variables](#step-4--set-environment-variables)
6. [Step 5 — Terminal: Install & Build](#step-5--terminal-install--build)
7. [Step 6 — Start the Application](#step-6--start-the-application)
8. [Step 7 — Enable HTTPS / SSL](#step-7--enable-https--ssl)
9. [Step 8 — Verify the Deployment](#step-8--verify-the-deployment)
10. [Ongoing Maintenance](#ongoing-maintenance)

---

## Prerequisites — Mac Setup

Do both of these on your Mac **before** touching GoDaddy.

### 1 — Create the Upload Archive

```bash
cd /Users/samuelrussell/Desktop/Jimbos-Nursery

tar --exclude='./.DS_Store' \
    --exclude='./node_modules' \
    --exclude='./.next' \
    --exclude='./.runtime' \
    --exclude='./.netlify' \
    --exclude='./.env' \
    --exclude='./Market-Pulse' \
    --exclude='./Jimbos-Nursery' \
    --exclude='./screenshot.js' \
    --exclude='./tsconfig.tsbuildinfo' \
    --exclude='./CLOUDFLARE_DEMO.md' \
    --exclude='./.claude' \
    -czf ~/Desktop/jimbos-deploy.tar.gz .
```

### 2 — Generate a Strong SESSION_SECRET

Run this once and **copy the output**. You will paste it into Step 4.

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> **Important:** Save this value before continuing. You cannot recover it — you would have to regenerate it and restart the app.

---

## Step 1 — Open cPanel

1. Go to **account.godaddy.com** and sign in.
2. Click **My Products** in the top navigation.
3. Under **Web Hosting**, click **Manage** next to your hosting plan.
4. cPanel opens in a new tab.

---

## Step 2 — Create the Node.js Application

1. In cPanel, scroll to the **Software** section.
2. Click the **Node.js** icon (green Node logo).
3. Click the blue **Create Application** button.

Fill in the form with these exact values:

| Field | Value |
|---|---|
| Node.js version | `20` — if not listed, choose the highest available (18 or 22 both work) |
| Application mode | `Production` |
| Application root | `jimbos-nursery` — GoDaddy creates the folder at `~/jimbos-nursery/` |
| Application URL | Select your domain from the dropdown (e.g. `jimbosnursery.com`) |
| Application startup file | `server.js` |

4. Click **Create**.
5. After creation, a panel shows a **virtual environment path** — it looks like:
   ```
   /home/yourusername/nodevenv/jimbos-nursery/20/bin/activate
   ```
   **Copy this full path and save it.** You will use it in Step 5.

---

## Step 3 — Upload Project Files

1. In cPanel, scroll to the **Files** section → click **File Manager**.
2. Navigate to your **home directory** (not `public_html` — the app lives at `~/jimbos-nursery/`).
3. Click the `jimbos-nursery` folder to open it.
4. Click **Upload** in the toolbar.
5. Drag `jimbos-deploy.tar.gz` from your Mac desktop into the upload window. Wait for upload to complete.
6. Back in File Manager, right-click `jimbos-deploy.tar.gz` → click **Extract**.
7. Confirm the destination is `/home/yourusername/jimbos-nursery/` → click **Extract Files**.
8. The folder should now contain `package.json`, `src/`, `prisma/`, `public/`, `server.js`, and other project files.

---

## Step 4 — Set Environment Variables

1. Go back to **cPanel → Node.js**.
2. Click the **pencil (edit) icon** next to the jimbos-nursery app.
3. Scroll down to the **Environment Variables** section.
4. Click **Add Variable** for each row below.
5. Click **Save** when all variables are entered.

| Variable Name | Value |
|---|---|
| `DATABASE_URL` | `file:./prod.db` |
| `SITE_URL` | `https://yourdomain.com` — your real domain, no trailing slash |
| `ADMIN_USERNAME` | `cwoolsey` |
| `ADMIN_PASSWORD_HASH` | `<your-64-character-password-hash>` |
| `SESSION_SECRET` | Paste the 96-character hex string from the Prerequisites step |
| `CLOVER_ENVIRONMENT` | `sandbox` |
| `CLOVER_APP_ID` | *(leave blank until Clover is configured)* |
| `CLOVER_APP_SECRET` | *(leave blank until Clover is configured)* |
| `CLOVER_MERCHANT_ID` | *(leave blank until Clover is configured — optional, skips merchant-selection screen)* |
| `CLOVER_WEBHOOK_SECRET` | *(leave blank until Clover is configured)* |

> **Note:** the app uses Clover's OAuth flow (`CLOVER_APP_ID` / `CLOVER_APP_SECRET`), not the older manual-token variables (`CLOVER_API_TOKEN`, `NEXT_PUBLIC_CLOVER_API_KEY`, `NEXT_PUBLIC_CLOVER_ENVIRONMENT`) — those aren't read by the code and should not be set.

---

## Step 5 — Terminal: Install & Build

1. In cPanel, scroll to the **Advanced** section → click **Terminal**.
2. Run the commands below **in order** — wait for each to finish before running the next.

### Activate the Node.js Environment

Replace `yourusername` with your actual cPanel username (shown in the terminal prompt).

```bash
source ~/nodevenv/jimbos-nursery/20/bin/activate
```

### Navigate to the App Folder

```bash
cd ~/jimbos-nursery
```

### Install Dependencies

The `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD` flag prevents a 300 MB Chromium download that will fail on shared hosting.

```bash
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install
```

### Generate the Prisma Linux Client

This regenerates the database client for the Linux server (the local Mac version won't run here).

```bash
npx prisma generate
```

### Create the Production Database

```bash
npx prisma db push
```

### Seed Starting Data (Optional)

```bash
npm run db:seed
```

### Build the Application

This takes 2–4 minutes. Wait for it to complete fully.

```bash
npm run build
```

A successful build ends with output similar to:

```
✓ Compiled successfully
Route (app)                     Size     First Load JS
┌ ○ /                           ...
...
```

---

## Step 6 — Start the Application

1. Go back to **cPanel → Node.js**.
2. Your app shows a status of **Stopped**.
3. Click the **Start** button (or **Restart** if it shows as Running).
4. The status changes to **Running**. The site is now live.

> If the app fails to start, click the **Show Errors** link. The most common causes are a missing `server.js` file or a missing environment variable.

---

## Step 7 — Enable HTTPS / SSL

1. In cPanel, scroll to the **Security** section.
2. Click **SSL/TLS**.
3. Click **Manage SSL Sites**.
4. Under **Install an SSL Website**, select your domain from the dropdown.
5. Click **Autofill by Domain** — GoDaddy populates the certificate fields automatically.
6. Click **Install Certificate**.

> If Autofill does not work, look for **Let's Encrypt SSL** in the Security section and click **Issue** next to your domain.

---

## Step 8 — Verify the Deployment

Open a browser and test each URL. Replace `yourdomain.com` with your actual domain.

| URL | Expected Result |
|---|---|
| `https://yourdomain.com` | Jimbo's Nursery homepage loads |
| `https://yourdomain.com/crm` | Redirects to `/login?redirect=/crm` — confirms middleware is active |
| `https://yourdomain.com/admin` | Redirects to `/login?redirect=/admin` — confirms admin is protected |
| `https://yourdomain.com/login` | Login form appears |
| Log in as `cwoolsey` | Redirects to `/crm` command center |

---

## Ongoing Maintenance

### Restart the App

After any environment variable change or configuration update:

**cPanel → Node.js → Restart button**

### Update the Code

1. Create a new archive on your Mac (same `tar` command as Prerequisites).
2. Upload via File Manager → Extract into `~/jimbos-nursery/`, overwriting existing files.
3. Open Terminal → activate the environment → run `npm install` and `npm run build`.
4. cPanel → Node.js → **Restart**.

### Connect Clover Payments (When Ready)

1. Get your **App ID** and **App Secret** from the Clover Developer Dashboard → Your Apps → your app → Settings.
2. In the same app, open **REST Configuration** and register this exact redirect URL:
   ```
   https://yourdomain.com/api/admin/clover/callback
   ```
3. cPanel → Node.js → Edit app → Environment Variables. Fill in `CLOVER_APP_ID`, `CLOVER_APP_SECRET`, and optionally `CLOVER_MERCHANT_ID` and `CLOVER_WEBHOOK_SECRET`.
4. Change `CLOVER_ENVIRONMENT` from `sandbox` to `production` when going live — the App ID/Secret you use must match this environment.
5. Restart the app, reload `/admin`, and click **Connect Clover**.

### Change the Admin Password

Generate a new SHA-256 hash of your new password on your Mac:

```bash
node -e "const c=require('crypto');process.stdout.write(c.createHash('sha256').update('YOUR_NEW_PASSWORD').digest('hex')+'\n')"
```

Update `ADMIN_PASSWORD_HASH` in the Node.js app environment variables and restart.

---

*Jimbo's Nursery & Landscaping · GoDaddy cPanel Deployment Guide · Next.js 14 / Prisma SQLite*

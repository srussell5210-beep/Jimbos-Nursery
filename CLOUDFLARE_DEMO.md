# Cloudflare Customer Demo

This project is currently best demoed through Cloudflare Tunnel because the CRM uses local Next.js server rendering, local JSON file reads, and a Prisma SQLite database.

## Temporary Demo Link

1. Start or verify the app is running on port `3002`.
2. Start the Cloudflare tunnel:

```bash
npm run demo:tunnel
```

3. Share the generated `https://*.trycloudflare.com` URL with the customer.

The tunnel stays live only while both processes remain running:

- the Next.js app on `localhost:3002`
- the Cloudflare tunnel command

## Current Demo URL

```text
https://accessed-variety-safari-pubmed.trycloudflare.com/crm
```

This is a quick tunnel URL. It is not guaranteed to stay the same after the tunnel is stopped.

## Permanent Cloudflare Hosting Path

For a permanent Cloudflare deployment, use Cloudflare Workers with the OpenNext adapter and migrate the CRM database layer to Cloudflare D1.

Required work:

1. Add `@opennextjs/cloudflare` and `wrangler`.
2. Add `wrangler.jsonc` with `nodejs_compat`.
3. Add `open-next.config.ts`.
4. Replace local filesystem reads used by the public site/admin APIs.
5. Move Prisma SQLite access to Cloudflare D1 using `@prisma/adapter-d1`.
6. Generate and apply D1 migrations.
7. Seed D1 with customer-demo data.
8. Deploy with `npm run deploy`.

Use the tunnel path for fast customer review. Use the Workers/D1 path for an always-on hosted product.

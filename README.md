# GitHub Portfolio Builder

Drop your GitHub username, get a stunning Apple-style portfolio page published to GitHub Pages in 30 seconds.

## How it works

1. Enter your GitHub username
2. Preview your auto-generated portfolio
3. Customize which repos to show
4. One-click publish to GitHub Pages

## Stack

Vite + TypeScript + Vercel Serverless Functions + GitHub REST API + Stripe

## Development

```bash
npm install
npm run dev
```

## Deploy to Vercel

1. Fork/push this repo to GitHub
2. Import to Vercel
3. Set environment variables:

| Variable | Description |
|----------|-------------|
| `VITE_GITHUB_CLIENT_ID` | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRICE_ID` | Stripe price ID for Pro subscription |

4. Deploy!

## Create a GitHub OAuth App

Go to https://github.com/settings/developers → New OAuth App:
- Homepage URL: your Vercel URL
- Callback URL: `${VERCEL_URL}/api/auth`

## Stripe Setup

1. Create a $9/mo subscription product in Stripe
2. Set up a webhook endpoint pointing to `${VERCEL_URL}/api/stripe/webhook`
3. Copy the signing secret and price ID to env vars

## Project structure

```
src/
├── main.ts              # App entry, routing
├── router.ts            # Hash-based SPA router
├── api/
│   ├── github.ts        # GitHub REST API client
│   └── publish.ts       # Publish + OAuth client
├── pages/
│   ├── landing.ts       # Marketing/landing page
│   ├── builder.ts       # Portfolio builder + preview
│   └── publishing.ts    # Publish modal UI
├── components/
│   ├── nav.ts           # Navigation bar
│   ├── footer.ts        # Footer
│   ├── repo-selector.ts # Repo checkbox list
│   └── preview-frame.ts # Iframe preview
├── engine/
│   ├── generator.ts     # Portfolio HTML generator
│   └── template.ts      # Portfolio HTML template
└── styles/
    ├── variables.css    # Design tokens
    ├── base.css         # Reset + base styles
    ├── landing.css      # Nav styles
    ├── builder.css      # Hero, examples, pricing
    └── publishing.css   # Modal styles

api/                     # Vercel serverless functions
├── auth.ts              # GitHub OAuth handler
├── publish.ts           # Repo creation + file upload
├── stripe-checkout.ts   # Stripe checkout session
└── stripe-webhook.ts    # Stripe event handler
```

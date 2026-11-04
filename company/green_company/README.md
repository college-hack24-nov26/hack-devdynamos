# Green Carbon Marketplace

Responsive React + Vite client with an Express API and SQLite persistence. The app seeds a realistic demonstration dataset on first launch. Farmers, companies, and government review screens read and mutate the same database.

## Run locally

1. Install Node.js 22 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env` if you want to configure payments.
4. Run `npm run dev` and open the local URL printed by Vite.

The API runs at `http://127.0.0.1:4321`; Vite proxies `/api` requests. Vite chooses an available local port automatically and prints the URL at startup. Both services bind to loopback only. `npm run build` creates the production client, and `npm start` serves the built client and API together at `http://127.0.0.1:4321`. The SQLite database is created at `data/marketplace.sqlite` and is ignored by Git.

## Razorpay checkout

The checkout is integrated through Razorpay Orders and Checkout. The server creates orders in paise, keeps the key secret private, verifies checkout signatures, validates captured payments, and accepts signed, idempotent webhooks at `/api/webhooks/razorpay`. The purchase reserves credits before opening checkout and releases them on failure, dismissal, or after a 20-minute timeout. Payout approval is unique per settled purchase and is recorded in the audit log.

Add your own Razorpay **test** credentials to `.env`:

```env
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
DEMO_MODE=true
```

Configure the Razorpay webhook URL as `https://<your-public-host>/api/webhooks/razorpay` and subscribe to `payment.captured` and `payment.failed`. Until both your Razorpay test key ID and secret are configured, the company portal uses a clearly labelled local checkout simulation. No real money is charged in that mode. Only issued and available verified credits can be purchased; estimated credits are never saleable. A successful checkout appears in the government payment ledger as awaiting settlement. Government confirmation settles the payment and creates the company ESG impact report. `.env.example` leaves credentials blank intentionally; use your own Razorpay test credentials.

## Demo scope

Portal sign-ins are demo account selectors, not production authentication. Do not expose this local demo server publicly as-is. Production deployment needs authenticated sessions and role authorization on every endpoint, HTTPS, managed secrets, production database/backup operations, payment reconciliation and refunds, and a formally governed project verification process. Carbon estimates are illustrative; no satellite or soil data provider is connected, and the interface does not claim government authorization.

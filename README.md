# Gloria Leads (Gloria Custom Cabinetry)

Next.js + TypeScript + Tailwind app for:

- CSV-driven lead ingestion and qualification
- source-transparent lead management
- campaign launch and follow-up automation
- inbox/reply triage
- booking status pipeline

## Run

```bash
npm install
npm run db:push
npm run dev
```

Open `http://127.0.0.1:3000` (or `http://localhost:3000`). After a WiFi change, avoid old bookmarks that used your previous LAN IP (`192.168.x.x`). For phone or another device on the same network, run `npm run dev:lan` and use your Mac’s current IP with port 3000.

## Data Inputs Used

- Primary CSV dataset: `resources/customersbench.CSV`
- Branding logo: `public/gloria-logo.svg` (placeholder asset created because no image logo file was found in `resources`)

## Key Paths

- `data/importLeads.ts` - CSV import, normalization, dedupe, summary
- `services/scoringService.ts` - strategic scoring and priority tiers
- `services/replyClassifier.ts` - reply categories and automation actions
- `services/messagingService.ts` - first-touch + follow-up template library
- `components/dashboard/DashboardApp.tsx` - Gloria Leads layout and all MVP views

## Source Transparency

Every lead carries source metadata and provenance:

- source badge in table rows
- source filter
- source section in lead detail panel
- source included in export payload

Source options:

- `CSV Import`
- `Online Enriched`
- `Scraped / External`
- `Manual`

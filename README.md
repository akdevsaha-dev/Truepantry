# TruePantry

> **Your second opinion in the grocery aisle.**  
> Real-time, hands-free visual and voice-driven grocery shopping assistant that personalizes every product decision against your biometrics, health goals, allergens, and current shopping cart.

---

## Overview

Walking down grocery aisles is fraught with deceptive marketing claims ("All Natural", "Immunity Boost", "Zero Added Sugar"), microscopic ingredient panels, and confusing nutritional tables. Furthermore, what is "healthy" for one person can be counterproductive for another:
- A high-calorie, nut-dense snack may derail someone on a **weight loss** calorie deficit, but be ideal for someone working toward **muscle hypertrophy / weight gain**.
- An unverified ingredient trace can trigger severe **allergies or intolerances**.

**TruePantry** eliminates the friction. Shoppers simply hold up their smartphone camera while walking down the aisle—**without pressing any shutter buttons or tapping on the screen**. TruePantry detects products in real time and speaks right into their earbuds with concise, personalized, conversational feedback.

---

## Key Capabilities

- **Zero-Click Ambient Vision**: Continuous real-time video feed. Point the camera at any shelf item; once focused for ~500ms (dwell detection), the app automatically evaluates it.
- **Barcode-First Recognition with Vision Fallback**:
  1. **Tier 1 (On-Device Barcode Scan)**: Decodes UPC/EAN barcodes continuously on the client (ZXing-wasm) at $0 cloud cost, resolving exact SKUs via the TruePantry DB and Open Food Facts.
  2. **Tier 2 (Gemini Vision Fallback)**: If no barcode is read within ~2s of the item being held steady (or the user taps **No barcode**), the sharpest buffered frame is sent to Gemini Vision to identify produce, bakery, butcher cuts, and unreadable packaging.
  - *Deferred*: an on-device produce classifier (custom-trained MediaPipe model) will be added once Tier 2 logs show which common items are worth moving on-device.
- **Audio-First In-Ear Guidance**: Delivers 1–3 sentence spoken verdicts via natural Text-to-Speech (TTS).
- **Instant Audio Interruption**: Seamlessly cuts off ongoing speech (`speechSynthesis.cancel()`) as soon as the shopper swings their camera to a new item.
- **Personalized Biometrics & Goals**:
  - `weight_loss`: Calorie density awareness, sugar reduction, high-satiety fiber optimization.
  - `weight_gain`: Nutrient-dense caloric surplus, high protein, healthy fat maximization.
  - `energy_balance`: Glycemic stability, complex carbohydrates, micronutrient variety.
  - `budget_nutrition`: Unit pricing comparison (price per 100g) and cost-effective swaps.
- **Zero-Tolerance Allergen Safety**: Hard override that immediately warns against peanuts, tree nuts, gluten, dairy, shellfish, or custom allergens before any nutritional advice.
- **Whole-Cart Context Memory**: Tracks the items already in the basket and advises on balance (e.g., warning if snacks exceed healthy macro ratios for that shopping trip).
- **Interactive Workspace**: Includes a **Dashboard**, **Smart Cart**, **Ask TruePantry AI Companion Chat**, and **Profile Manager**.

---

## Recognition Architecture (Barcode-First, Vision Fallback)

```
┌──────────────────────────────────────────────────────────────────────┐
│ Camera active · frames sampled at 5–10 fps · ring buffer of recent   │
│ frames · blur/stability gate (item steady in frame for ~500ms)       │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │
                  [ Tier 1: On-Device Barcode Scan ]
                  (runs continuously, ZXing-wasm)
                                   │
          ┌──── barcode found ─────┴──── no barcode after ~2s steady ────┐
          │                             (or user taps "No barcode")      │
          ▼                                                              ▼
  Exact SKU lookup                                    "Hold the item steady"
  (TruePantry DB)                                                        │
          │ miss                                     Send sharpest buffered frame
          ▼                                                              │
  Open Food Facts lookup                             [ Tier 2: Gemini Vision ]
          │ miss ─────────────────────────────────►  identify → structured JSON
          │                                         {name, brand, is_packaged,
          │                                          confidence}
          │                                                              │
          │       (barcode appears mid-call → cancel Gemini, use barcode)│
          │                                                              │
          │                     packaged? → brand+name → Open Food Facts │
          │                     low confidence? → "Is this X?" / rescan  │
          ▼                                                              ▼
   ┌───────────────────────────────────────────────────────────────────────┐
   │ Deterministic allergen & diet rules (code, not LLM) → hard override   │
   └───────────────────────────────────┬───────────────────────────────────┘
                                       ▼
   ┌───────────────────────────────────────────────────────────────────────┐
   │ LLM verdict (item + profile + goal + cart), streamed token-by-token   │
   └───────────────────────────────────┬───────────────────────────────────┘
                                       ▼
   ┌───────────────────────────────────────────────────────────────────────┐
   │ Streaming TTS, spoken sentence-by-sentence · cancelled on item change │
   └───────────────────────────────────────────────────────────────────────┘
```

**Key design decisions**
- **Barcode first** — exact SKU data in under 1s at $0 cost covers most packaged goods.
- **Timed fallback (~2s)** — most visible barcodes decode in under 1s; 2s leaves margin without feeling slow. The timer only starts once the frame is steady. Tune from logs.
- **"No barcode" skip** — loose produce never has a barcode, so users can skip the wait.
- **Scanner keeps running during the Gemini call** — an exact barcode match always wins over a vision guess.
- **Best frame, not last frame** — the sharpest of the recent buffered frames is sent, to avoid wasted calls on blurry images.
- **Structured vision output** — packaged items identified by vision are re-resolved through Open Food Facts for real nutrition data instead of model estimates.
- **Never guess confidently** — a low-confidence result asks the user to confirm ("Is this X?") or rescan.
- **Allergens are checked in code** — deterministic rules on ingredient data run before, and override, the LLM.
- **Guardrails on cloud calls** — debounce and skip items just identified, per-session rate limits, and perceptual-hash caching.

**Metrics tracked**: share of scans resolved by barcode vs. vision, p50/p95 time to first spoken word, cloud cost per shopping trip, and vision-call frequency per item class (this decides when to add an on-device produce model).

---

## Monorepo Structure

```
truepantry/
├── productIdea.md         # Full product specification & agent guidelines
├── README.md              # Project documentation & local setup guide
├── backend/               # FastAPI backend service (Python 3.12, uv)
│   ├── src/
│   │   ├── api/           # REST endpoints (auth, onboarding, status)
│   │   ├── core/          # Configuration & environment settings
│   │   ├── db/            # Supabase database client
│   │   ├── services/      # Password hashing, JWT auth cookies
│   │   └── validation/    # Pydantic v2 schemas
│   ├── pyproject.toml     # Python dependencies & metadata
│   └── uv.lock            # uv lockfile
└── frontend/              # Next.js 16 frontend (TypeScript, React 19)
    ├── app/               # App Router pages (landing, auth, onboarding, workspace)
    ├── components/        # Reusable UI components & layouts
    ├── lib/               # API client, Zustand stores, auth token helpers
    ├── public/            # Static assets & illustrations
    ├── proxy.ts           # Route protection & auth proxy middleware
    └── tests/             # Unit tests (API client, auth store, onboarding store)
```

---

## Getting Started

### Prerequisites

- **Node.js**: `v20.x` or higher
- **Python**: `3.12` or higher
- **uv**: Fast Python package manager ([installation instructions](https://docs.astral.sh/uv/))

---

### Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies using `uv`:
   ```bash
   uv sync
   ```

3. Configure environment variables in `.env`:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_anon_or_service_key
   JWT_SECRET=your_jwt_secret_key
   ```

4. Run the development server:
   ```bash
   uv run uvicorn src.main:app --reload --port 8000
   ```
   The API will be available at `http://localhost:8000` (docs at `http://localhost:8000/docs`).

---

### Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## Testing & Quality Assurance

### Frontend

Run all unit tests:
```bash
npm test
```

Type checking:
```bash
npx tsc --noEmit
```

Linting:
```bash
npm run lint
```

---

## Design Principles & Agent Instructions

For detailed specifications, user scenarios, and directives for AI agents working on this codebase, refer to **[`productIdea.md`](file:///Users/okayadi/Developer/projects/truepantry/productIdea.md)**.

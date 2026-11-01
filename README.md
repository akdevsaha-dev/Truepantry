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
- **Cascaded 3-Tier Recognition**:
  1. **Tier 1 (On-Device Barcode Detection)**: Decodes UPC/EAN barcodes on the client in ~10ms at $0 cloud cost.
  2. **Tier 2 (On-Device MediaPipe Vision $\ge$ 85%)**: Identifies loose produce (apples, bananas, broccoli, etc.) directly on the device GPU/Wasm at $0 cloud cost.
  3. **Tier 3 (Cloud Vision / Gemini Vision Fallback)**: Silently captures a video frame only when unbarcoded items are ambiguous (<85% confidence), resolving exotic produce, bakery goods, and prepared foods.
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

## Cascaded Recognition Architecture

```
                          ┌────────────────────────┐
                          │   Camera Active (App)  │
                          └───────────┬────────────┘
                                      │
                         [ Tier 1: Barcode Scan ]
                                      │
                         Barcode found in frame?
                                ├── YES ───────────────> [Lookup Exact SKU Database]
                                │                                     │
                                └── NO                                │
                                     │                                │
                       [ Tier 2: On-Device MediaPipe ]                │
                                     │                                │
                       Food detected with >= 85%?                     │
                                ├── YES ───────────────> [Send Detected Food Label]
                                │  (e.g., "Apple" - $0 cost)          │
                                │                                     │
                                └── NO / Ambiguous (<85%)             │
                                     │                                │
                     [ Tier 3: Cloud Vision / Gemini ]                │
                                     │                                │
                        Auto-capture stable frame ────────────────────┤
                                                                      │
                                                                      ▼
                                                       ┌─────────────────────────────┐
                                                       │    Backend LLM Evaluation   │
                                                       │   (Item + Profile + Goals)  │
                                                       └──────────────┬──────────────┘
                                                                      │
                                                                      ▼
                                                       ┌─────────────────────────────┐
                                                       │   Real-Time Voice Stream    │
                                                       │  (Speaks verdict into ear)  │
                                                       └─────────────────────────────┘
```

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

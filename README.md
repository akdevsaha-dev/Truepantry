# TruePantry

**A second opinion in the grocery aisle.** Point your phone at a product and TruePantry tells you, in plain words, whether it fits *your* goal and diet. Everything you scan lands in your cart, and when you're done shopping it turns that cart into a recipe you can chat about.

---

## What it does

1. **Scan.** Open the camera and hold up a product. No shutter button. The app reads the barcode on the device, or recognises the item from the picture if there's no barcode (fresh fruit, bakery, deli).
2. **Get a verdict.** Within a couple of seconds you see a **Good fit / Caution / Not for you** verdict with short reasons, plus Nutri-Score, Eco-Score and NOVA processing level.
3. **Build a cart.** Every scan is added to your cart automatically. Scanning the same product again just bumps the quantity.
4. **Cook.** One click turns the cart into a recipe that respects your diet. Then ask follow-up questions like *"can I make this vegan?"* in a chat next to the recipe.

Every verdict and recipe is personalised from a short onboarding (age, height, goal, diet).

---

## How a scan works

```
 Phone camera (browser)
   │  ~7 frames/sec, checks each frame for motion and sharpness
   │
   ├─ barcode found ─────────────► POST /evaluate {barcode}
   │  (decoded on device with ZXing-wasm, free and instant)
   │
   └─ no barcode after 2s steady ─► POST /evaluate {image}  (sharpest recent frame)

 FastAPI  /evaluate
   1. Already in our product catalog?  ── yes ─► reuse it (no external calls)
   2. Barcode  → Open Food Facts lookup
      Image    → Gemini Vision identifies it → packaged? search Open Food Facts
                 not confident? → ask the user "Is this X?" first
   3. Missing scores → Gemini estimates them (flagged as "estimated" in the UI)
   4. Save to the shared catalog, add to the user's cart
   5. Personal verdict from Gemini (only the first time this product enters the cart)
```

---

## Design decisions (and why)

| Decision                                             | Why                                                                                                                                                                                                                |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Barcode first, vision as fallback**          | A barcode gives the exact product with real nutrition data, decoded on the device for free. Vision costs money and can be wrong, so it only runs when the item has been held steady for 2 seconds with no barcode. |
| **Send the sharpest frame, not the last one**  | The client keeps a small buffer of recent frames and sends the sharpest one, so we don't pay for vision calls on blurry pictures.                                                                                  |
| **A barcode cancels an in-flight vision call** | An exact match always beats a guess.                                                                                                                                                                               |
| **Ask before guessing**                        | Below 70% confidence the user confirms *"Is this X?"*. A wrong verdict would be worse than one extra tap.                                                                                                        |
| **Shared product catalog**                     | Products are stored once and reused across all users, so each product only costs one Open Food Facts lookup and one score estimate.                                                                                |
| **Real data wins over AI estimates**           | Open Food Facts values are never overwritten. Gemini only fills the gaps, and those scores are labelled *estimated*.                                                                                             |
| **Verdict cached per cart item**               | Re-scanning the same product bumps the quantity and reuses the saved verdict, with no second LLM call.                                                                                                             |
| **Recipe cache by cart fingerprint**           | A SHA-256 of the sorted product ids. If the cart hasn't changed, the saved recipe comes back instantly. "Try a different recipe" skips the cache.                                                                  |
| **Stateless recipe chat**                      | The client sends the conversation with each question, so the server stores nothing and any instance can answer.                                                                                                    |
| **Structured LLM output**                      | Every Gemini call uses a JSON response schema, so the backend gets typed data, not free text to parse.                                                                                                             |
| **httpOnly cookie auth**                       | The JWT lives in an httpOnly cookie that JavaScript can't read. The Next.js proxy forwards `/api/v1/*` to FastAPI so the browser only talks to one origin.                                                       |

---

## Tech stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Zustand, Tailwind, ZXing-wasm for barcode decoding
- **Backend:** FastAPI, Pydantic v2, Python 3.12, managed with `uv`
- **Data:** Supabase (Postgres) with SQL migrations
- **AI:** Google Gemini 2.5 Flash for vision, verdicts, score estimates, recipes and chat
- **Product data:** [Open Food Facts](https://world.openfoodfacts.org), a free and open food database

---

## Architecture

The backend has three layers, and each one has a single job:

```
api/v1/endpoints/   HTTP only: read the request, call services, shape the response
services/           business logic and outside data (catalog + cart, Open Food Facts, auth)
llm/                every Gemini call and prompt in one place
validation/         Pydantic models for incoming request bodies only
```

The frontend has the same idea:

```
lib/api/            one small typed client per backend resource (auth, cart, recipes, ...)
lib/scanner/        camera loop, frame quality checks, on-device barcode reader
lib/stores/         global state that outlives a page (auth, onboarding)
components/         UI; workspace pages share the cart through one React context
```

### Data model

```
users ── profiles        (dob, height, gender, goal, diet)
  │
  ├── carts ── cart_items ── products   (shared catalog, one row per real product)
  │            quantity, verdict
  │
  └── recipes            (ingredients link back to products, cart fingerprint, favorite)
```

### API

| Method                 | Path                                                         | What it does                                                      |
| ---------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------- |
| `POST`               | `/auth/signup`, `/auth/signin`, `/auth/logout`         | Account and session cookie                                        |
| `GET`                | `/auth/me`                                                 | The signed-in user                                                |
| `GET` / `PATCH`    | `/onboarding`, `/onboarding/{profile,goals,preferences}` | Read or save the profile                                          |
| `POST`               | `/onboarding/complete`                                     | Finish onboarding                                                 |
| `POST`               | `/evaluate`                                                | Scan a barcode, image or confirmed label, then add it to the cart |
| `GET`                | `/cart`                                                    | Cart items with their products and verdicts                       |
| `PATCH` / `DELETE` | `/cart/items/{id}`                                         | Change a quantity or remove an item                               |
| `GET` / `POST`     | `/recipes`                                                 | Recipe history / make a recipe from the cart                      |
| `GET` / `DELETE`   | `/recipes/{id}`                                            | One recipe                                                        |
| `PATCH`              | `/recipes/{id}/favorite`                                   | Favorite or unfavorite                                            |
| `POST`               | `/recipes/{id}/chat`                                       | Ask a question about a recipe                                     |

Interactive docs are at `http://localhost:8000/docs` once the backend is running.

---

## Running it locally

**You need:** Node 20+, Python 3.12+, [uv](https://docs.astral.sh/uv/), a Supabase project and a [Gemini API key](https://aistudio.google.com/apikey).

### 1. Database

Apply the SQL files in `backend/supabase/migrations` to your Supabase project, in order (`supabase db push`, or paste them into the SQL editor).

### 2. Backend

```bash
cd backend
uv sync
```

Create `backend/.env`:

```env
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_KEY=<service role key>
JWT_SECRET_KEY=<any long random string>
GOOGLE_API_KEY=<Gemini API key from Google AI Studio>
```

```bash
uv run uvicorn src.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. The Next.js server forwards `/api/v1/*` to the backend on port 8000. Set `BACKEND_URL` if your backend runs somewhere else.

> The camera needs `localhost` or HTTPS. To scan from your phone, open the dev server through an HTTPS tunnel.

### Tests

```bash
cd frontend
npm test        # API client, auth store, onboarding store, frame-quality maths
npm run lint
```

---

## Project structure

```
truepantry/
├── backend/
│   ├── src/
│   │   ├── api/v1/endpoints/   auth, onboarding, evaluate, cart, recipes
│   │   ├── services/           catalog.py, openfoodfacts.py, jwt.py, hash.py
│   │   ├── llm/                client.py (Gemini calls), prompts.py (prompts + JSON schemas)
│   │   ├── validation/         request body models
│   │   ├── core/config.py      settings from .env
│   │   └── db/supabase.py      database client
│   └── supabase/migrations/
└── frontend/
    ├── app/                    landing, auth, onboarding, (workspace)/dashboard|cart|recipes|profile
    ├── components/workspace/   workspace shell, scanner, cart, recipes, profile
    ├── lib/                    api clients, scanner, stores
    └── tests/
```

---

## What's next

- **Voice verdicts:** every verdict already includes a short `spoken` sentence, ready for text-to-speech in your earbuds.
- **Allergy checks in code:** hard rules on the ingredient list that run before the LLM and can override it.
- **On-device produce model:** move the most common vision results (bananas, apples...) onto the phone once scan logs show which ones matter.

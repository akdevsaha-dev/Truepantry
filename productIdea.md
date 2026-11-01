# TruePantry — Product Concept & Architecture Guide

> **Note for AI Agents & Developers**: 
> This document defines the vision, core mechanics, user workflows, and design principles of **TruePantry**. 
> Whenever an AI agent or contributor is tasked with building, modifying, or advising on TruePantry features, consult this document first to align with the core product mission.

---

## 1. Executive Summary

**TruePantry** is an intelligent, real-time visual and voice-driven grocery shopping assistant designed to be **"your second opinion in the grocery aisle."**

Instead of forcing shoppers to squint at confusing nutrition facts, decipher deceptive marketing claims, or consult dense spreadsheets while pushing a shopping cart, TruePantry enables shoppers to **scan an item's barcode or packaging and instantly receive personalized, conversational audio/voice feedback tailored directly to their personal health profile, biometrics, dietary rules, and shopping goals.**

### The Elevator Pitch
> *"Walk down the aisle, scan any food item with your phone, and TruePantry speaks right back to you in real time with an honest, personalized verdict—telling you whether that item actually serves your body, fits your specific fitness or weight goals, and respects your dietary restrictions before it enters your cart."*

---

## 2. The Core Problem TruePantry Solves

1. **Information Overload & Deceptive Marketing**: Products are covered with buzzwords ("All Natural", "Immunity Boost", "Zero Added Sugar") that obscure high caloric densities, refined starches, or inflammatory oils.
2. **One-Size-Fits-All Fallacy**: An apple or a pack of trail mix is not universally "healthy" or "unhealthy". For someone trying to cut carbs or enter a steep calorie deficit, calorie-dense or high-sugar foods can derail their progress. For someone trying to build muscle or gain weight, calorie-dense nutrient-rich snacks are ideal. Context and individual biometrics are everything.
3. **Friction in the Aisle**: Shoppers have both hands occupied (holding baskets, bags, or kids). They cannot afford to spend 2 minutes tapping through complex calorie-tracking apps for every single item on the shelf.
4. **Allergy & Intolerance Safety**: Missing a small "may contain traces of peanuts/gluten" disclaimer buried at the bottom of an ingredient panel can have immediate health consequences.

---

## 3. Real-Time Feedback Loop & Voice Experience

The foundational interaction cycle in TruePantry is the **Scan $\rightarrow$ Analyze $\rightarrow$ Speak** loop:

```
+------------------+       +-------------------------+       +-------------------------+
|  User Scans      | ----> |  TruePantry Intelligence| ----> |  Real-Time Voice &      |
|  Barcode / Pack  |       |  Evaluates Context      |       |  Visual Feedback        |
+------------------+       +-------------------------+       +-------------------------+
                                        |
                  +---------------------+---------------------+
                  |                     |                     |
                  v                     v                     v
            User Profile           Shopping Goal         Basket Context
         (Biometrics, Diets,     (Weight Loss, Gain,    (Cumulative Cart
             Allergies)            Protein, Sugar)       Totals & Budget)
```

### 1. Instant Hands-Free Scan (Zero-Click Ambient Vision)
Shoppers do **not** need to press a capture button or snap photos manually. They simply walk the aisle holding up their phone. The engine runs a **Cascaded 3-Tier Recognition Pipeline**:

```
                       ┌────────────────────────┐
                       │   Camera Active (App)  │
                       └───────────┬────────────┘
                                   │
                      [ Tier 1: Barcode Detection ]
                                   │
                      Barcode found in frame?
                             ├── YES ───────────────> [Instant SKU Lookup]
                             │                                    │
                             └── NO                               │
                                  │                               │
                    [ Tier 2: On-Device MediaPipe ]               │
                                  │                               │
                    Food detected with >= 85%?                    │
                             ├── YES ───────────────> [Send Detected Food Label]
                             │  (e.g., "Apple" - $0 cost)         │
                             │                                    │
                             └── NO / Ambiguous (<85%)            │
                                  │                               │
                  [ Tier 3: Cloud Vision / Gemini ]               │
                                  │                               │
                     Auto-grab stable video frame ────────────────┤
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

#### Hands-Free Interaction Engine Rules:
- **Dwell / Stability Trigger (~400–600ms)**: When the camera focuses steadily on an item for ~500ms, the evaluation triggers automatically without requiring user touch.
- **Silent Frame Capture**: If an unbarcoded item is ambiguous for MediaPipe (Tier 3), the app silently extracts a video frame in the background and sends it to the cloud vision API.
- **Deduplication / Cooldown**: Prevents spamming repetitive API calls while the user is still looking at the same item.
- **Audio Interruption on Move**: If the user swings the camera from a soda to a bottle of water, the active speech synthesis is immediately aborted (`speechSynthesis.cancel()`) and the new item's verdict begins speaking in real time.

### 2. Multi-Context Evaluation Engine
TruePantry never assesses a product in isolation. The intelligence engine cross-references:
- **Biometric Profile**: Height, weight, age, biological gender, and activity baseline.
- **Active Goal**: What the user wants to achieve right now (e.g., Weight Loss / Caloric Deficit, Muscle Hypertrophy / Weight Gain, Diabetic / Glucose Stability, Budget Maximization).
- **Hard Constraints (Safety)**: Allergies (peanuts, tree nuts, shellfish, dairy, soy, wheat, etc.) and dietary protocols (Vegan, Halal, Kosher, Keto, Low FODMAP).
- **Whole-Cart Memory**: What is already in the cart for this trip. The first sweet snack may fit fine; the fourth sweet snack pushes the trip past healthy macronutrient ratios.

### 3. Spoken Voice Feedback (Audio-First)
The app speaks immediately into the user's earbuds or phone speaker with concise, conversational, and direct guidance (under 2–3 sentences), accompanied by an on-screen visual summary:

#### Scenario A: User Goal = Weight Loss (Caloric Deficit)
- **User scans**: High-sugar granola bar advertised as "Natural Energy".
- **TruePantry Voice**: *"Heads up: this bar has 24 grams of added sugar and over 280 calories with almost no protein. If you're looking to lose weight, this won't keep you full. Try the roasted chickpeas on aisle 4 instead."*
- **Visual Card**: `Caution` · High sugar density · Low satiety score · Better swap suggested.

#### Scenario B: User Goal = Weight Gain / Muscle Building (Caloric Surplus & High Protein)
- **User scans**: Natural peanut butter or full-fat Greek yogurt.
- **TruePantry Voice**: *"Great choice! It packs 18 grams of clean protein and calorie-dense healthy fats that make it easy to hit your surplus target today."*
- **Visual Card**: `Add it` · High protein density · Calorie target positive.

#### Scenario C: Severe Allergy or Intolerance Detected
- **User scans**: Granola mix with hidden allergen warning.
- **TruePantry Voice**: *"Stop! This package contains may-contain warnings for tree nuts, which violates your severe allergy profile. Do not purchase this."*
- **Visual Card**: `Allergy Alert` (Red banner) · Immediate visual and audio warning override.

---

## 4. Key Functional Pillars

### 1. Audio & Voice Interface
- **Text-to-Speech (TTS) / Voice Synthesis**: Fast, natural-sounding audio responses optimized for quick in-ear delivery.
- **Speech-to-Text (STT) / Voice Queries**: Shoppers can ask questions out loud while holding a product (*"Is there a cheaper version of this?"*, *"Does this have dairy?"*, *"What can I make for dinner with what's in my cart?"*).

### 2. Tailored Personal Profiles & Onboarding
- **Personal Metrics**: Date of birth, height, weight, activity levels.
- **Primary Goals**:
  - `weight_loss`: Calorie density awareness, fiber optimization, sugar reduction.
  - `weight_gain`: Nutrient-dense caloric surplus, high protein, healthy fat maximization.
  - `energy_balance`: Steady glycemic curve, complex carbohydrates, micro-nutrients.
  - `budget_nutrition`: Price per 100g, cost-efficient protein and staple alternatives.
- **Dietary & Allergen Restrictions**: Zero-tolerance lists for allergens and lifestyle preferences (Vegetarian, Vegan, Gluten-Free, Dairy-Free, Low Sodium, Nut-Free).

### 3. Whole-Cart Context (Basket Awareness)
- TruePantry tracks the items currently in the cart.
- It calculates running totals for estimated spend, macronutrients (Protein / Carbs / Fats), and sodium.
- Recommends smart balancing items (e.g., *"Your cart is heavy on carbs and low on fresh produce today—consider picking up some greens before checking out"*).

### 4. Interactive Shopping Workspace
- **Dashboard**: Quick camera access, today's goal, summary of recent scans.
- **Cart & List**: Running shopping list, product quantity controls, price totals, exportable list.
- **Companion Chat ("Ask TruePantry")**: Conversational workspace for meal planning, recipe ideas from cart items, and label interpretations.
- **Profile**: Live editing of dietary rules, health goals, and account preferences.

---

## 5. Technical Architecture Overview

| Layer | Technologies | Responsibilities |
| :--- | :--- | :--- |
| **Frontend** | Next.js (App Router), TypeScript, Tailwind CSS, Zustand, GSAP | Mobile-friendly responsive UI, barcode/camera scanner streaming, audio playback controls, state hydration |
| **Backend API** | FastAPI (Python 3.12, UV package manager), Pydantic v2 | High-performance REST endpoints for auth, user onboarding, profile updates, product resolution, and recommendation algorithms |
| **Database & Auth** | Supabase (PostgreSQL), Argon2, Secure JWT Cookies | Persistent user accounts, biometrics, saved preferences, scan histories, and session management |
| **Evaluation & Voice Engine** | LLM orchestration + TTS/Audio pipeline | Takes product facts + user profile $\rightarrow$ generates conversational verdict and spoken audio stream |

---

## 6. Guidelines for AI Agents Working on TruePantry

When writing code, creating prompts, designing endpoints, or answering questions about TruePantry, adhere to these mandatory principles:

1. **Always Anchor Decisions to the User's Profile**:
   - Never say a food is universally "good" or "bad". Always frame recommendations relative to the user's explicit profile (e.g., *"Because you selected weight gain..."* or *"Since you're managing blood sugar..."*).
2. **Safety First (Allergens & Intolerances Override Everything)**:
   - If an allergen match is detected, all other nutritional advice is superseded by the safety alert.
3. **Concise, Spoken-First Copy**:
   - Voice feedback must be short enough to hear in 5–8 seconds while standing in an aisle. Keep verdicts to 1–3 short sentences.
4. **Empathetic & Objective Tone**:
   - Never shame the shopper for scanning junk food. State the facts neutrally with respect to their goal, and suggest viable alternatives.
5. **Brand Consistency**:
   - The brand is **TruePantry** (or `truePantry`). Never use deprecated working names (e.g., *Carted*).

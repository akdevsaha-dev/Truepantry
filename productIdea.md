# TruePantry — Product Concept & Architecture Guide

> **Note for AI Agents & Developers**: 
> This document defines the vision, core mechanics, user workflows, and design principles of **TruePantry**. 
> Whenever an AI agent or contributor is tasked with building, modifying, or advising on TruePantry features, consult this document first to align with the core product mission.

---

## 1. Executive Summary

**TruePantry** is an intelligent, real-time visual and voice-driven grocery shopping assistant designed to be **"your second opinion in the grocery aisle."**

Instead of forcing shoppers to squint at confusing nutrition facts, decipher deceptive marketing claims, or consult dense spreadsheets while pushing a shopping cart, TruePantry enables shoppers to **simply hold up their smartphone camera as they walk down the aisle. Without pressing any buttons, the app recognizes items in real time and speaks directly into their earbuds with personalized, honest verdicts tailored to their personal health profile, biometrics, dietary rules, and shopping goals.**

### The Elevator Pitch
> *"Walk down the aisle, point your phone at any food item, and TruePantry speaks right back to you in real time with an honest, personalized verdict—telling you whether that item actually serves your body, fits your specific fitness or weight goals, and respects your dietary restrictions before it enters your cart."*

---

## 2. The Core Problem TruePantry Solves

1. **Information Overload & Deceptive Marketing**: Products are covered with buzzwords ("All Natural", "Immunity Boost", "Zero Added Sugar") that obscure high caloric densities, refined starches, or inflammatory oils.
2. **One-Size-Fits-All Fallacy**: An apple or a pack of trail mix is not universally "healthy" or "unhealthy". For someone trying to cut carbs or enter a steep calorie deficit, calorie-dense or high-sugar foods can derail their progress. For someone trying to build muscle or gain weight, calorie-dense nutrient-rich snacks are ideal. Context and individual biometrics are everything.
3. **Friction in the Aisle**: Shoppers have both hands occupied (holding baskets, bags, or kids). They cannot afford to spend 2 minutes tapping through complex calorie-tracking apps or snapping photos of every single item on the shelf.
4. **Unbarcoded Items (Produce & Butcher Cuts)**: Fresh fruits, vegetables, butcher counter cuts, and bakery items lack barcodes. Traditional grocery barcode apps break down completely in the produce aisle.
5. **Allergy & Intolerance Safety**: Missing a small "may contain traces of peanuts/gluten" disclaimer buried at the bottom of an ingredient panel can have immediate health consequences.

---

## 3. Real-Time Feedback Loop & Ambient Voice Experience

The foundational interaction cycle in TruePantry is the **Ambient Scan $\rightarrow$ Analyze $\rightarrow$ Speak** loop:

```
+------------------+       +-------------------------+       +-------------------------+
|  Continuous      | ----> |  TruePantry Intelligence| ----> |  Real-Time Voice &      |
|  Camera Stream   |       |  Evaluates Context      |       |  Visual Feedback        |
+------------------+       +-------------------------+       +-------------------------+
                                        |
                  +---------------------+---------------------+
                  |                     |                     |
                  v                     v                     v
            User Profile           Shopping Goal         Basket Context
         (Biometrics, Diets,     (Weight Loss, Gain,    (Cumulative Cart
             Allergies)            Protein, Sugar)       Totals & Budget)
```

---

## 4. Hands-Free, Zero-Click Vision Engine (Cascaded 3-Tier Pipeline)

TruePantry requires **no shutter buttons, no tapping to capture, and no manual photo taking**. The user opens the scanner and points their camera while walking. 

To achieve sub-second speed, 30+ FPS responsiveness, and near-zero server API costs, the vision system operates as a **Cascaded 3-Tier Recognition Pipeline**:

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

### The Three Recognition Tiers

1. **Tier 1: On-Device Barcode Detection (Fastest & Free)**
   - **Target**: Packaged supermarket goods (cereals, yogurt tubs, pasta, canned items).
   - **Mechanism**: The client-side camera feed decodes UPC/EAN barcodes in **~10ms** using browser-native `BarcodeDetector` or `@zxing/library`.
   - **Cost & Bandwidth**: $0 cloud cost. Sends only a 12-digit string to the backend.

2. **Tier 2: On-Device MediaPipe Vision $\ge$ 85% (Loose Produce & Zero Cost)**
   - **Target**: Standard unbarcoded produce (apples, bananas, oranges, carrots, broccoli).
   - **Mechanism**: Google MediaPipe (`@mediapipe/tasks-vision`) runs directly on the user's device GPU/Wasm.
   - **Confidence Threshold**: If an item is recognized with $\ge 85\%$ confidence, the frontend sends only the detected food label (e.g. `{"item_name": "apple", "confidence": 0.91}`) to the backend. No image is uploaded.
   - **Cost & Latency**: $0 cloud cost, runs at **15–25ms**.

3. **Tier 3: Cloud Vision / Gemini Vision Fallback (Ambiguous & Complex Items)**
   - **Target**: Unbarcoded items where MediaPipe confidence is $< 85\%$ (e.g., butcher cuts of chicken/beef, bakery pastries, prepared hot foods, exotic fruits).
   - **Mechanism**: The app silently extracts a clean video frame from the canvas buffer and transmits it to the backend Vision model (e.g., Gemini Vision).
   - **Hands-Free**: The user **never clicks a button**; the app captures the frame automatically upon detecting a steady subject.

### Essential Zero-Click Runtime Rules

- **Dwell / Stability Detection (~400–600ms)**: The app only triggers an evaluation when an item remains centered and stable in frame for ~500ms. Panning quickly past a shelf does not trigger false evaluations.
- **Deduplication & Cooldown**: Once an item is evaluated (e.g., `apple`), TruePantry will not re-evaluate that same item while it remains in focus.
- **Instant Audio Interruption on Pan**: If the user swings their camera to a different product while an audio verdict is playing, the previous speech is aborted immediately (`speechSynthesis.cancel()`), and the audio shifts seamlessly to the new item.

---

## 5. Multi-Context Evaluation Engine

TruePantry never assesses a product in isolation. The intelligence engine cross-references four data layers:

1. **Biometric Profile**: Height, weight, age, biological gender, and activity baseline.
2. **Active Goal**:
   - `weight_loss`: Calorie density awareness, fiber optimization, sugar reduction, high satiety.
   - `weight_gain`: Nutrient-dense caloric surplus, high protein, healthy fat maximization.
   - `energy_balance`: Steady glycemic curve, complex carbohydrates, micronutrients.
   - `budget_nutrition`: Price per 100g, cost-efficient protein and staple alternatives.
3. **Hard Constraints (Safety Overrides)**:
   - Allergies (peanuts, tree nuts, shellfish, dairy, soy, wheat, etc.) and dietary protocols (Vegan, Halal, Kosher, Keto, Low FODMAP).
   - **Safety First**: Any allergen detection immediately overrides and supersedes all other advice.
4. **Whole-Cart Memory (Basket Awareness)**:
   - Tracks the cumulative nutrition and items already placed in the cart during this shopping trip.
   - The first sweet snack may fit fine; the fourth snack triggers a warning about trip macronutrient balance.

---

## 6. Spoken Feedback Scenarios (Audio-First)

Verdicts are spoken in concise, conversational sentences (under 2–3 sentences) and accompanied by an on-screen visual card:

### Scenario A: User Goal = Weight Loss (Caloric Deficit)
- **User points camera at**: High-sugar granola bar advertised as "Natural Energy".
- **TruePantry Voice**: *"Heads up: this bar has 24 grams of added sugar and 280 calories with almost no protein. For weight loss, this won't keep you full. Try the roasted chickpeas on aisle 4 instead."*
- **Visual Card**: `Caution` · High sugar density · Low satiety · Healthier swap suggested.

### Scenario B: User Goal = Weight Gain / Muscle Building (Caloric Surplus & High Protein)
- **User points camera at**: Natural peanut butter or full-fat Greek yogurt.
- **TruePantry Voice**: *"Great choice! It packs 18 grams of clean protein and calorie-dense healthy fats that make it easy to hit your surplus target today."*
- **Visual Card**: `Add it` · High protein density · Calorie target positive.

### Scenario C: Severe Allergy or Intolerance Detected
- **User points camera at**: Granola mix with hidden allergen warning.
- **TruePantry Voice**: *"Stop! This package contains may-contain warnings for tree nuts, which violates your severe allergy profile. Do not purchase this."*
- **Visual Card**: `Allergy Alert` (Red banner) · Immediate visual and audio warning override.

### Scenario D: Loose Produce / Unbarcoded Food (Apple / Chicken Breast)
- **User points camera at**: Honeycrisp Apple (no barcode).
- **TruePantry Voice**: *"Medium Honeycrisp apple: 95 calories, 4 grams of fiber. Great low-calorie snack with a steady glycemic load."*
- **Visual Card**: `Good Fit` · Whole food · Fiber source.

---

## 7. Key Functional Pillars

### 1. Audio & Voice Interface
- **Text-to-Speech (TTS)**: Fast, natural-sounding audio synthesis optimized for low-latency in-ear delivery.
- **Speech-to-Text (STT) & Voice Queries**: Shoppers can ask questions out loud while holding a product (*"Is there a cheaper version of this?"*, *"Does this have dairy?"*, *"What can I make for dinner with what's in my cart?"*).

### 2. Tailored Personal Profiles & Onboarding
- Multi-step onboarding capturing biometrics, shopping goals, dietary protocols, and zero-tolerance allergen lists.
- Full editing and browser persistence in the profile workspace.

### 3. Whole-Cart Context (Basket Awareness)
- Tracks running basket totals for estimated cost, macronutrients (Protein / Carbs / Fats), and sodium.
- Recommends smart balancing items before checkout.

### 4. Interactive Shopping Workspace
- **Dashboard**: Ambient camera entry point, active goal overview, and recent scans.
- **Smart Cart**: Running cart with quantity controls, calculated totals, and copyable shopping list.
- **Companion Chat ("Ask TruePantry")**: Contextual conversational workspace for meal planning and label inquiries.
- **Profile**: Live editing of dietary rules, health goals, and account preferences.

---

## 8. Technical Architecture Overview

| Layer | Technologies | Responsibilities |
| :--- | :--- | :--- |
| **Frontend** | Next.js 16 (App Router), TypeScript, Tailwind CSS, Zustand, GSAP | Mobile-friendly responsive UI, camera stream processing, MediaPipe/Barcode on-device detection, audio synthesis & interruption |
| **Backend API** | FastAPI (Python 3.12, UV package manager), Pydantic v2 | High-performance REST endpoints for auth, onboarding, profile updates, product resolution, and recommendation algorithms |
| **Database & Auth** | Supabase (PostgreSQL), Argon2, Secure JWT Cookies | Persistent user accounts, biometrics, saved preferences, scan histories, and session management |
| **Vision & Voice Engine** | MediaPipe, BarcodeDetector, Gemini Vision, TTS | Tiered recognition pipeline, context-aware LLM evaluation, and real-time audio generation |

---

## 9. Mandatory Guidelines for AI Agents Working on TruePantry

When writing code, creating prompts, designing endpoints, or answering questions about TruePantry, adhere strictly to these principles:

1. **Always Anchor Decisions to the User's Profile**:
   - Never label a food as universally "good" or "bad". Always frame recommendations relative to the user's explicit profile (e.g., *"Because you selected weight gain..."* or *"Since you're in a calorie deficit..."*).
2. **Safety First (Allergens & Intolerances Override Everything)**:
   - If an allergen match is detected, all other nutritional advice is superseded by the safety alert.
3. **Concise, Spoken-First Copy**:
   - Voice feedback must be short enough to hear in 5–8 seconds while standing in an aisle. Keep verdicts to 1–3 short sentences.
4. **Empathetic & Objective Tone**:
   - Never shame the shopper for scanning junk food. State the facts neutrally with respect to their goal, and suggest viable alternatives.
5. **Brand Consistency**:
   - The brand is **TruePantry** (or `truePantry`). Never use deprecated working names (e.g., *Carted*).

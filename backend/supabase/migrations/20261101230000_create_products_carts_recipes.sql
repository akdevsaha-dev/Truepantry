-- Shared product catalog. One row per real-world product, reused across users so
-- Open Food Facts lookups and LLM scoring only happen once per product.
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barcode VARCHAR(14) UNIQUE, -- NULL for fresh produce / vision / label items
    name VARCHAR(255) NOT NULL,
    normalized_name VARCHAR(255) NOT NULL, -- lowercased "brand name", dedupe key for barcode-less items
    brand VARCHAR(120),
    is_packaged BOOLEAN NOT NULL,
    source VARCHAR(20) NOT NULL CHECK (source IN ('barcode', 'vision', 'label')),
    image_url TEXT,
    ingredients TEXT,

    -- Objective scores (not personalized). Grades follow the a-e scale used by OFF.
    nutri_grade CHAR(1) CHECK (nutri_grade IN ('a', 'b', 'c', 'd', 'e')),
    eco_grade CHAR(1) CHECK (eco_grade IN ('a', 'b', 'c', 'd', 'e')),
    nova_group SMALLINT CHECK (nova_group BETWEEN 1 AND 4),
    scores_source VARCHAR(10) CHECK (scores_source IN ('off', 'llm')),

    nutrition JSONB DEFAULT '{}'::jsonb NOT NULL, -- per 100g: energy_kcal, protein_g, carbs_g, sugar_g, fat_g, sat_fat_g, fiber_g, sodium_mg
    sourcing JSONB DEFAULT '{}'::jsonb NOT NULL,  -- origin, packaging, labels (organic, fairtrade...), notes
    raw JSONB,                                    -- full OFF payload, for re-deriving fields later

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Barcode-less items dedupe on name; barcoded items dedupe on barcode.
CREATE UNIQUE INDEX products_normalized_name_no_barcode_idx
    ON products (normalized_name) WHERE barcode IS NULL;

-- A user's running cart. Lives until the user deletes it.
CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- one cart per user
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Every scan lands here. Re-scanning the same product bumps quantity.
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INT DEFAULT 1 NOT NULL CHECK (quantity > 0),
    verdict JSONB NOT NULL, -- personalized {level, headline, spoken, reasons} at scan time
    added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (cart_id, product_id)
);

CREATE INDEX cart_items_product_id_idx ON cart_items (product_id);

-- Generated recipes. Kept after the cart is deleted for history / favorites.
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cart_id UUID REFERENCES carts(id) ON DELETE SET NULL,
    -- sha256 of the sorted product ids in the cart when generated; same cart contents => reuse, skip the LLM
    cart_fingerprint CHAR(64) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    servings SMALLINT CHECK (servings > 0),
    prep_minutes SMALLINT CHECK (prep_minutes >= 0),
    cook_minutes SMALLINT CHECK (cook_minutes >= 0),
    ingredients JSONB NOT NULL, -- [{name, amount, product_id|null, is_staple}] staples = salt, oil... not from the cart
    steps JSONB NOT NULL,       -- ["step 1", "step 2", ...]
    nutrition JSONB DEFAULT '{}'::jsonb NOT NULL, -- per serving estimate
    is_favorite BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX recipes_user_fingerprint_idx ON recipes (user_id, cart_fingerprint);
CREATE INDEX recipes_user_created_idx ON recipes (user_id, created_at DESC);
CREATE INDEX recipes_user_favorite_idx ON recipes (user_id) WHERE is_favorite;

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

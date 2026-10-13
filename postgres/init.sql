-- Runs once, the first time the postgres container starts.
-- Three layers = three schemas.
CREATE SCHEMA raw;      -- data as it arrived
CREATE SCHEMA staging;  -- cleaned data
CREATE SCHEMA mart;     -- business tables for analysts

-- RAW tables: where the DAGs drop the data
-- (staging and mart tables are created by the DAGs themselves)
CREATE TABLE raw.stores (
    store_id   INT,
    store_name TEXT,
    city       TEXT,
    address    TEXT
);

CREATE TABLE raw.products (
    product_id   INT,
    product_name TEXT,
    category     TEXT,
    subcategory  TEXT,
    brand        TEXT,
    unit_price   NUMERIC
);

CREATE TABLE raw.promotions (
    promo_id     INT,
    product_id   INT,
    discount_pct NUMERIC
);

-- one row per item bought
CREATE TABLE raw.checkouts (
    order_id   TEXT,
    store_id   INT,
    pulled_at  TIMESTAMP,
    product_id INT,
    quantity   INT
);

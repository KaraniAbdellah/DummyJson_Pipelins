DROP TABLE IF EXISTS staging.promotions;
CREATE TABLE staging.promotions AS
SELECT product_id, discount_pct
FROM raw.promotions;

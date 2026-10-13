DROP TABLE IF EXISTS staging.checkouts;
CREATE TABLE staging.checkouts AS
SELECT DISTINCT order_id, store_id, pulled_at, product_id, quantity
FROM raw.checkouts
WHERE quantity > 0;

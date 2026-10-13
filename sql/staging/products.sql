DROP TABLE IF EXISTS staging.products;
CREATE TABLE staging.products AS
SELECT product_id, trim(product_name) AS product_name, trim(category) AS category, unit_price
FROM raw.products;

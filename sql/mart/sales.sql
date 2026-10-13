-- One row per item sold, with the discount applied
DROP TABLE IF EXISTS mart.sales;
CREATE TABLE mart.sales AS
SELECT c.order_id,
       c.store_id,
       c.product_id,
       c.quantity,
       p.unit_price,
       COALESCE(pr.discount_pct, 0) AS discount_pct,
       c.quantity * p.unit_price * (1 - COALESCE(pr.discount_pct, 0) / 100) AS net_amount
FROM staging.checkouts c
JOIN staging.products p ON p.product_id = c.product_id
LEFT JOIN staging.promotions pr ON pr.product_id = c.product_id;

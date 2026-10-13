DROP TABLE IF EXISTS mart.top_products;
CREATE TABLE mart.top_products AS
SELECT p.product_name, p.category, sum(s.quantity) AS units_sold
FROM mart.sales s
JOIN staging.products p ON p.product_id = s.product_id
GROUP BY p.product_name, p.category
ORDER BY units_sold DESC;

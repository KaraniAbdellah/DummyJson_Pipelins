DROP TABLE IF EXISTS mart.revenue_by_store;
CREATE TABLE mart.revenue_by_store AS
SELECT st.city, st.store_name, round(sum(s.net_amount), 2) AS revenue
FROM mart.sales s
JOIN staging.stores st ON st.store_id = s.store_id
GROUP BY st.city, st.store_name
ORDER BY revenue DESC;

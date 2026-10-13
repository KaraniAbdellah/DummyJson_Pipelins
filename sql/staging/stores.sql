DROP TABLE IF EXISTS staging.stores;
CREATE TABLE staging.stores AS
SELECT store_id, trim(store_name) AS store_name, trim(city) AS city
FROM raw.stores;

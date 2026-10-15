# Lesson 3 · Lab 3 — BIM Sales Pipeline (Light version)

**Goal:** build a small data pipeline with Airflow and Postgres.
Two sources go in, three layers come out: **raw → staging → mart**.

Time: ~45 min. Everything runs locally in Docker.

```
 API (carts)  ──► [1_streaming] ──┐
                                  ├──► RAW ──► [3_staging] ──► STAGING ──► [4_marts] ──► MART
 3 CSV files  ──► [2_batch] ──────┘
```

| Layer | Schema | What it contains |
|---|---|---|
| Raw | `raw` | data exactly as received |
| Staging | `staging` | cleaned data (trimmed text, no duplicates, no bad rows) |
| Mart | `mart` | business tables, ready for analysts |

| DAG | Schedule | Job |
|---|---|---|
| `1_streaming` | every minute | call an API, save checkouts in `raw.checkouts` |
| `2_batch` | daily | load the 3 CSV files in `raw.stores`, `raw.products`, `raw.promotions` |
| `3_staging` | every 2 min | wait until `1_streaming` and `2_batch` have each succeeded once, build the `staging.*` tables, then start `4_marts` |
| `4_marts` | started by `3_staging` | build `mart.sales`, `mart.revenue_by_store`, `mart.top_products` |

---

## 0. Before you start

You need Docker Desktop running and an internet connection (the API is on the web).
Ports **8081** (Airflow) and **8085** (Adminer) must be free.

```bash
cd lesson_3_bim_sales_pipeline_light
docker compose version
```

Files you will read:

```
dags/       the 4 DAGs (+ db.py, a tiny helper)
sql/        the SQL of staging and mart
data/       the 3 CSV files (batch source)
postgres/   init.sql = creates the 3 schemas and the 4 raw tables (the only place with column types)
```

**Who creates the tables?**

| Tables | Created by | When |
|---|---|---|
| `raw.*` (4 tables) | `postgres/init.sql` | once, the first time Postgres starts with an empty volume |
| `staging.*`, `mart.*` | the DAGs (`CREATE TABLE AS SELECT`) | at every run, so they appear after the first run |

The SQL in `sql/` has no type conversions: the raw tables already have the right types, and `CREATE TABLE AS` copies them.

---

## 1. Look at the sources

**Batch:** three small CSV files.

```bash
head -n 3 data/products.csv data/stores.csv data/promotions.csv
```

**Streaming:** open `dags/streaming_dag.py`. The whole source is one line:

```python
carts = requests.get(url, timeout=10).json()["carts"]
```

The API gives fake shopping carts. We use its real data and map it onto BIM's catalogue: the cart's `userId` becomes a `store_id` (1–6, `userId % 6 + 1`), each item's `id` becomes a `product_id` (1–25, `(id - 1) % 25 + 1`), and the item's `quantity` is kept as is. Each item bought is saved as one row in `raw.checkouts` (`order_id, store_id, pulled_at, product_id, quantity`), so one checkout with 3 items = 3 rows.

> Question: which source is the fact (sales)? Which are referentials (dimensions)?
> The CSV files are referentials. The checkouts are the facts.

---

## 2. Start everything

```bash
docker compose up -d
```

Wait ~1 minute, then get the Airflow password:

```bash
docker compose exec airflow cat /opt/airflow/standalone_admin_password.txt
```

Open **http://localhost:8081**, login `admin` + that password.
You should see 4 DAGs: `1_streaming`, `2_batch`, `3_staging`, `4_marts`. They start by themselves.

**If `1_streaming` fails with `CERTIFICATE_VERIFY_FAILED`** (a network that inspects HTTPS): in `docker-compose.yml`, change `VERIFY_SSL: "true"` to `"false"`, then run `docker compose up -d` again.

---

## 3. Open the database

Open **http://localhost:8085** (Adminer) and log in:

| Field | Value |
|---|---|
| System | PostgreSQL |
| Server | `postgres` |
| Username | `bim` |
| Password | `bim` |
| Database | `bim` |

On the left, use the **schema** dropdown to switch between `raw`, `staging` and `mart`. Click **SQL command** to run queries.

---

## 4. Follow the data layer by layer

### Raw
```sql
SELECT * FROM raw.checkouts LIMIT 10;
SELECT * FROM raw.products LIMIT 5;
SELECT count(*) FROM raw.checkouts;
```
Run the `count` a few times: `raw.checkouts` grows every minute.

### Staging
```sql
SELECT * FROM staging.checkouts LIMIT 10;
```
Same data as raw, but cleaned: trimmed text, duplicates removed, rows with `quantity` 0 dropped.
Read `sql/staging/checkouts.sql`.

### Mart
```sql
SELECT * FROM mart.sales LIMIT 10;
SELECT * FROM mart.revenue_by_store;
SELECT * FROM mart.top_products LIMIT 5;
```
`mart.sales` joins checkouts + products + promotions and computes `net_amount` (quantity × price, minus the discount).
`revenue_by_store` and `top_products` are one `GROUP BY` each, built from `mart.sales`.
Read `sql/mart/sales.sql`.

---

## 5. Read the DAGs

Open each file in `dags/` (they are 20–40 lines) and look at them in the Airflow **Graph** view.

| File | Look at |
|---|---|
| `streaming_dag.py` | one task, `schedule="* * * * *"` |
| `batch_dag.py` | a `for` loop creates one task per CSV file |
| `staging_dag.py` | 2 sensors (`wait_streaming`, `wait_batch`) must pass before the 4 staging tasks run in parallel, then `TriggerDagRunOperator` starts the marts |
| `marts_dag.py` | `sales >> [revenue_by_store, top_products]` (the 2 marts need `sales` first) |

Every SQL task is a **full rebuild** (`DROP TABLE` + `CREATE TABLE AS`), so re-running a DAG never creates duplicates.

---

## 6. Try it: change the data

1. Open `data/promotions.csv` and change promo 1 `discount_pct` from `10` to `50`.
2. In Airflow, trigger `2_batch` (▶ button).
3. Wait for `3_staging` (max 2 min), then in Adminer:

```sql
SELECT * FROM raw.promotions WHERE promo_id = 1;
SELECT * FROM staging.promotions WHERE product_id = 2;
SELECT DISTINCT product_id, discount_pct FROM mart.sales WHERE product_id = 2;
```

The change flows raw → staging → mart without touching any DAG code.

---

## 7. Try it: break something

Make `3_staging` fail: in `sql/staging/stores.sql` replace `raw.stores` with `raw.storez`, save, and watch the `stg_stores` task turn red in Airflow. Click it → **Logs** to see the SQL error. Because `start_marts` depends on all 4 staging tasks, `4_marts` does **not** run. Fix the file and the next run turns green again.

---

## Cleanup

```bash
docker compose down        # stop (data is kept in the pgdata and airflow_home volumes)
docker compose down -v     # stop and delete the volumes (full reset)
```

Postgres data and Airflow history are stored in Docker volumes, so they survive restarts. `postgres/init.sql` only runs on an empty volume: after editing it, do a full reset with `down -v`.

## Troubleshooting

| Problem | Fix |
|---|---|
| Airflow page not loading | wait 1 min, then `docker compose logs airflow` |
| DAGs not visible yet | wait 30 s and refresh, the scheduler scans the folder regularly |
| `3_staging` run is skipped (pink) | `1_streaming` or `2_batch` has not succeeded yet: trigger it, the next staging run goes through |
| `CERTIFICATE_VERIFY_FAILED` | set `VERIFY_SSL` to `"false"` (step 2) |
| Port already in use | change the left number in `"8081:8080"` / `"8085:8080"` in `docker-compose.yml` |
| Adminer cannot connect | Server must be `postgres` (not `localhost`) |
| Git Bash turns `/opt/...` into a Windows path | prefix the command with `MSYS_NO_PATHCONV=1` |

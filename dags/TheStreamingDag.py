# Dag for Streaming Data
from airflow import DAG
from datetime import datetime, timedelta
from airflow.operators.python import PythonOperator
import random
import requests
import os
from dotenv import load_dotenv
from db import get_connection
load_dotenv()

API_URL = "https://dummyjson.com/carts"


def _get_data_from_api(api_url):
    print(api_url)
    # Get 10 products and skip n products
    url = f"{api_url}?limit=10&skip={random.randint(0, 190)}"
    verify = os.environ.get("VERIFY_SSL", "true") == "true"   # see README if your network blocks HTTPS
    print("Print verify = ", os.getenv("VERIFY_SSL"))
    carts = requests.get(url, timeout=10, verify=verify).json()["carts"]
    print(carts)
    
    now = datetime.utcnow()
    conn = get_connection()
    with conn, conn.cursor() as cur:
        for cart in carts:
            order_id = f"chk_{now:%Y%m%d%H%M%S}_{cart['id']}"
            store_id = cart["userId"] % 6 + 1 # API user -> one of our 6 BIM stores
            for item in cart["products"]:
                product_id = (item["id"] - 1) % 25 + 1 # API product -> one of our 25 BIM products
                cur.execute(
                    "INSERT INTO raw.checkouts VALUES (%s, %s, %s, %s, %s)",
                    [order_id, store_id, now, product_id, item["quantity"]],
                )
    conn.close()
    print(f"{len(carts)} checkouts saved in raw.checkouts")


with DAG(
    "TheStreamingDag",
    start_date=datetime(2026, 10, 13),
    schedule=timedelta(seconds=30),
    catchup=False,
    tags=["bim"]
) as dag:
    get_data_from_api = PythonOperator(
        task_id="_get_data_from_api",
        python_callable=_get_data_from_api,
        op_args=[API_URL]
    )



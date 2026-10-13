# Tha Batch Dag
"""
    This DAG gets CSV files from the data folder
        that we receive from BIM.
"""

from airflow import DAG
from datetime import datetime, timedelta
from airflow.operators.python import PythonOperator
import pandas as pd
from db import get_connection, run_sql_file

DATA_PATH = "/home/abdellah/Documents/git_projects/DummyJson_Pipelins/data"



def _load_csv(table):
    print("Get Data from Data Folder")
    FULL_PATH = f"{DATA_PATH}/{table}.csv"
    
    # Connect to PostGreess DB
    print("Connect to Posgress DB")
    conn = get_connection()
    
    # Open File && Get Data from && Save in DB
    with conn, conn.cursor() as cur, open (FULL_PATH, encoding="utf-8") as f:
        cur.execute(f"TRUNCATE TABLE raw.{table}")
        columns = f.readline().strip()
        f.seek(0) # reset cusrsor to start
        cur.copy_expert(f"COPY raw.{table} ({columns}) FROM STDIN WITH CSV HEADER", f)
    
    return True



with DAG(
    "TheBatchDag",
    start_date=datetime(2026, 10, 13),
    schedule="@daily",
    catchup=False,
    tags=["bim"]
) as dag:
    for table in ["products", "promotions", "stores"]:
        load_data = PythonOperator(
            task_id=f"load_{table}",
            python_callable=_load_csv,
            op_kwargs={"table": table},
        )

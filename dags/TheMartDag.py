# The Mart Dag
"""
    Also Called Mart Dag
    this modeling stage, tha stage where we get data marts based
    in our business need.
"""


from airflow import DAG
from airflow.operators.python import PythonOperator
from db import run_sql_file
from datetime import datetime


def _create_mart_tables(f_name):
    FULL_PATH = f"/opt/airflow/sql/mart/{f_name}.sql"
    run_sql_file(FULL_PATH)
    print("Create Tables in Staging Schema")


with DAG (
    dag_id="TheMartDag",
    start_date=datetime(2026, 10, 14),
    schedule="* * * * *",
    catchup=False,
    tags=["bim"]
) as dag:
    for fname in ["sales", "revenue_by_store", "top_products"]:
        run_sql = PythonOperator(
            task_id=f"create_{fname}",
            python_callable=_create_mart_tables,
            op_args=[fname]
        )

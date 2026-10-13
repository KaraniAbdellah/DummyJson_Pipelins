from airflow import DAG
from datetime import datetime, timedelta
from airflow.operators.python import PythonOperator
from db import run_sql_files



def _run_sql():
    FULL_PATH = "/home/abdellah/Documents/git_projects/DummyJson_Pipelins/sql/staging"
    run_sql_files(FULL_PATH)
    print("Create Tables in STaging Schema")

with DAG(
    "TheStagingArea",
    start_date=datetime(2026, 10, 13),
    schedule=timedelta(seconds=60),
    catchup=False,
    tags=["bim"]
    ) as dag:
    run_sql = PythonOperator(
        task_id = "check_something",
        python_callable=_run_sql,
    )


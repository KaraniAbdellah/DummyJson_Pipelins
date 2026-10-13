from airflow import DAG
from datetime import datetime, timedelta
from airflow.operators.python import PythonOperator


def _check_something():
    print("Check Something")

with DAG(
    "TheStagingArea",
    start_date=datetime(2026, 10, 13),
    schedule=timedelta(seconds=60),
    catchup=False,
    tags=["bim"]
    ) as dag:
    check_something = PythonOperator(
        task_id = "check_something",
        python_callable=_check_something,
    )


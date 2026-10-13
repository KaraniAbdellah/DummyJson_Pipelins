# Dag for Streaming Data
from airflow import DAG
from datetime import datetime, timedelta
from airflow.operators.python import PythonOperator


def _get_data_from_api():
    pass

with DAG(
    "TheBatchDag",
    start_date=datetime(2026, 10, 11),
    schedule=timedelta(seconds=60),
    catchup=False,
    tags=["bim"]
):
    get_data_from_api = PythonOperator(
        task_id="getData",
        python_callable=_get_data_from_api
    )



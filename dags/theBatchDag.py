# Tha Batch Dag
"""
    This DAG gets CSV files from the data folder
        that we receive from BIM.
"""

from airflow import DAG
from datetime import datetime, timedelta
from airflow.operators.python import PythonOperator
import numpy as np


def _load_csv():
    print("CSV Loaded Successfully ...")

    return True


with DAG(
    "TheBatchDag",
    start_date=datetime(2026, 10, 11),
    schedule="@daily",
    catchup=False,
    tags=["bim"]
) as dag:
    load_data = PythonOperator(
        task_id="load_csv",
        python_callable=_load_csv,
    )

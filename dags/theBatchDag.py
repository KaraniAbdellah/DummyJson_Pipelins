# Tha Batch Dag
"""
    This DAG gets CSV files from the data folder
        that we receive from BIM.
"""

from airflow import DAG
from datetime import datetime, timedelta
from airflow.operators.python import PythonOperator
import pandas as pd


DATA_PATH = "/home/abdellah/Documents/git_projects/DummyJson_Pipelins/data"

def _load_csv(file):
    print("Get Data from Data Folder")
    FULL_PATH = f"{DATA_PATH}/{file}"
    df = pd.read_csv(FULL_PATH)
    print(df.head(3))
    print(FULL_PATH)

    print("Connect to Posgress DB")

    print("Add Data to Posgress DB")

    return True


with DAG(
    "TheBatchDag",
    start_date=datetime(2026, 10, 11),
    schedule=timedelta(seconds=10),
    catchup=False,
    tags=["bim"]
) as dag:
    for file in ["products.csv", "promotions.csv", "stores.csv"]:
        load_data = PythonOperator(
            task_id=f"load_{file}",
            python_callable=_load_csv,
            op_kwargs={"file": file},
        )

"""
Also Called Mart Dag
this modeling stage, tha stage where we get data marts based
in our business need.
"""


from airflow import DAG
from airflow.operator imprt PythonOperator
from db import run_sql_file

with DAG (
    dag_id="TheMartDag",
    start_date=datetime(2026, 10, 13),

) as dag:
    run_sql = PythonOperator(
        task_id="run_"
    )

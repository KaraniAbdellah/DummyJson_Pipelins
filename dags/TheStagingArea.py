from airflow import DAG
from airflow.models import DagRun
from datetime import datetime, timedelta
from airflow.sensors.external_task import ExternalTaskSensor
from airflow.operators.python import PythonOperator
from db import run_sql_file



def _run_sql(f_name):
    FULL_PATH = f"/home/abdellah/Documents/git_projects/DummyJson_Pipelins/sql/staging/{f_name}.sql"
    run_sql_file(FULL_PATH)
    print("Create Tables in STaging Schema")


with DAG(
    "TheStagingArea",
    start_date=datetime(2026, 10, 13),
    schedule=timedelta(seconds=120),
    catchup=False,
    tags=["bim"]
    ) as dag:
    
    waits = [
        PythonSensor(
            task_id=f"wait_for_{dag_id}",
            python_callable=has_succeeded,
            op_args=[dag_id],
            mode="reschedule",
            poke_interval=10,
            timeout=90,
            soft_fail=True,
        )
        for dag_id in ["TheBatchDag", "TheStreamingDag"]
    ]
    
    for f_name in ["checkouts", "products", "stores", "promotions"]:
        run_sql = PythonOperator(
            task_id = f"run_sql_{f_name}",
            python_callable=_run_sql,
            op_args=[f_name]
        )

    [ext_task_sen] >> run_sql
from airflow import DAG
from datetime import datetime, timedelta
from airflow.sensors.external_task import ExternalTaskSensor
from airflow.operators.python import PythonOperator
from db import run_sql_file



def _create_staging_table(f_name):
    FULL_PATH = f"/opt/airflow/sql/staging/{f_name}.sql"
    run_sql_file(FULL_PATH)
    print("Create Tables in Staging Schema")


with DAG(
    "TheStagingArea",
    start_date=datetime(2026, 10, 13),
    schedule="* * * * *",
    catchup=False,
    tags=["bim"]
    ) as dag:

    wait_batch_dag = ExternalTaskSensor(
        task_id="WaitBatchDag",
        external_dag_id="TheBatchDag",
        allowed_states=["success"],
        external_task_id=None,  # Wait for the DAG run
        execution_delta=timedelta(0),
        poke_interval=10,                   # check every 10 seconds
        timeout=300,                        # wait up to 5 minutes
        mode="reschedule",
    )

    wait_streaming_dag = ExternalTaskSensor(
        task_id="WaitStreamingDag",
        external_dag_id="TheStreamingDag",
        allowed_states=["success"],
        external_task_id=None, # wait all tasks
        execution_delta=timedelta(0),
        poke_interval=10,                   # check every 10 seconds
        timeout=300,
        mode="reschedule",
    )

    run_sql_tasks_arr = []
    for f_name in ["checkouts", "products", "stores", "promotions"]:
        task = PythonOperator(
            task_id = f"run_sql_{f_name}",
            python_callable=_create_staging_table,
            op_args=[f_name]
        )
        run_sql_tasks_arr.append(task)

    for task in run_sql_tasks_arr:
        [wait_batch_dag, wait_streaming_dag] >> task

# DummyJson_Pipelins


- Downlaod Airflow with UV:
uv tool install "apache-airflow==3.3.2"

- Checking Working Directory:
Add This to Your ~/.bashrc:
AIRFLOW__CORE__DAGS_FOLDER="$HOME/Documents/git_projects/DummyJson_Pipelins/dags"

- Run Apache Airflow:
apache-airflow standalone

- When you want to add new package:
uv tool install --force --with-requirements requirements.txt "apache-airflow==3.3.2"

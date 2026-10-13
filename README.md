# DummyJson_Pipelins

## Airflow Config
- Downlaod Airflow with UV:
uv tool install "apache-airflow==3.3.2"

- Checking Working Directory:
Add This to Your ~/.bashrc:
AIRFLOW__CORE__DAGS_FOLDER="$HOME/Documents/git_projects/DummyJson_Pipelins/dags"

- Run Apache Airflow:
apache-airflow standalone

- When you want to add new package:
uv tool install --force --with-requirements requirements.txt "apache-airflow==3.3.2"


## BD
- create server
- create database
- enter to terminal by your crenditials server (username, password) by using this command: psql -h 127.0.0.1 -p 5432 -U postgres -d postgres
- create and change working databse:
  - Get all Database: SELECT current_database();
  - CREATE DATABASE Ecommerce;
  - Change: \c Ecommerce

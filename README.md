Build a datapipeline that get data as batch as cs files every day and get data as streaming ever minute.

# Archicture
<img src="./images/platform architecture.png">

so this architecture compose for multi dags:
here is picture for all dags from airflow.

<img src="./images/dags.png">

**Explination:** so the Thee Batch Get data from csv file from data folder and process and store it in posgress db.

And Thestreaming Dag get data every minte frm dummyApi and store data into Db. also

So tha The Staging Dag is Transformation Layer.
and The Mart Dag is Where we get products tables.

at the end for visually all data that we get with scheman we can display in web html page.

<img src="./images/web_page.png">



## Technically
### Airflow Config
- Downlaod Airflow with UV:
uv tool install "apache-airflow==3.3.2"

- Checking Working Directory:
Add This to Your ~/.bashrc:
AIRFLOW__CORE__DAGS_FOLDER="$HOME/Documents/git_projects/DummyJson_Pipelins/dags"

- Run Apache Airflow:
apache-airflow standalone

- When you want to add new package:
uv tool install --force --with-requirements requirements.txt "apache-airflow==3.3.2"

### Database Configuration
- create server
- create database
- enter to terminal by your crenditials server (username, password) by using this command: psql -h 127.0.0.1 -p 5432 -U postgres -d postgres
- create and change working databse:
  - Get all Database: SELECT current_database();
  - CREATE DATABASE Ecommerce;
  - Change: \c Ecommerce

### See web Data
to see data use liver server and ppen index.html

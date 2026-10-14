import psycopg2

# Connect to Test DB
def get_connection():
    conn = psycopg2.connect(
        dbname="Ecommerce",
        user="postgres",
        password="postgres",
        host="localhost"
    )
    return conn



def run_sql_file(path):
    """Run one .sql file from the sql/ folder."""
    with open(f"{path}", encoding="utf-8") as f:
        sql = f.read()
        print(f"SQL from {path} is: {sql}")
    conn = get_connection()
    with conn, conn.cursor() as cur:   # "with conn" = commit at the end
        cur.execute(sql)
    conn.close()

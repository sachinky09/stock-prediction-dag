from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime
import os
from utils.db_utils import get_db_connection
from utils.fetch_stock import fetch_stock_data
from utils.train_model import train_and_predict
from utils.send_email import send_prediction_emails

DATA_PATH = "backend/data"
HIST_PATH = os.path.join(DATA_PATH, "historical")
PRED_PATH = os.path.join(DATA_PATH, "predictions", "predictions.csv")

os.makedirs(HIST_PATH, exist_ok=True)
os.makedirs(os.path.dirname(PRED_PATH), exist_ok=True)

def fetch_all_stocks():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT stock_code FROM stocks")
    stocks = [row[0] for row in cur.fetchall()]
    conn.close()

    for stock in stocks:
        output_csv = os.path.join(HIST_PATH, f"{stock}.csv")
        fetch_stock_data(stock, output_csv)

def train_all_stocks():
    for file in os.listdir(HIST_PATH):
        stock_code = file.replace(".csv", "")
        input_csv = os.path.join(HIST_PATH, file)
        train_and_predict(input_csv, stock_code, PRED_PATH)

def send_emails():
    send_prediction_emails(PRED_PATH)

default_args = {"start_date": datetime(2025, 9, 4)}

with DAG("stock_prediction_dag", schedule_interval="@daily", default_args=default_args, catchup=False) as dag:
    task_fetch = PythonOperator(task_id="fetch_data", python_callable=fetch_all_stocks)
    task_train = PythonOperator(task_id="train_models", python_callable=train_all_stocks)
    task_email = PythonOperator(task_id="send_emails", python_callable=send_emails)

    task_fetch >> task_train >> task_email

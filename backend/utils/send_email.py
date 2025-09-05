import smtplib
import os
import pandas as pd
from email.mime.text import MIMEText
from utils.db_utils import get_db_connection

SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

def send_prediction_emails(predictions_csv):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT id, email FROM users")
    users = cur.fetchall()

    predictions = pd.read_csv(predictions_csv)

    for user_id, email in users:
        cur.execute("""
            SELECT s.stock_code FROM user_stocks us
            JOIN stocks s ON us.stock_id = s.id
            WHERE us.user_id = %s
        """, (user_id,))
        stocks = [row[0] for row in cur.fetchall()]

        user_preds = predictions[predictions["stock_code"].isin(stocks)]

        body = "Stock Predictions:\n\n" + user_preds.to_string(index=False)

        msg = MIMEText(body)
        msg["Subject"] = "Daily Stock Predictions"
        msg["From"] = SMTP_EMAIL
        msg["To"] = email

        try:
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login(SMTP_EMAIL, SMTP_PASSWORD)
                server.sendmail(SMTP_EMAIL, email, msg.as_string())
            print(f"[SUCCESS] Email sent to {email}")
        except Exception as e:
            print(f"[ERROR] Email failed to {email}: {e}")

    conn.close()

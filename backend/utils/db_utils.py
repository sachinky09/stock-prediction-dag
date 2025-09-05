import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.getenv("SUPABASE_DB_URL")

def get_db_connection():
    conn = psycopg2.connect(DB_URL)
    return conn

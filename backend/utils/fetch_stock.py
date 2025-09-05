import os
import requests
import pandas as pd

API_KEY = os.getenv("API_KEY")
BASE_URL = "https://api.twelvedata.com/time_series"

def fetch_stock_data(stock_code, output_path):
    params = {
        "symbol": stock_code,
        "interval": "1day",
        "outputsize": 60,
        "apikey": API_KEY
    }

    try:
        response = requests.get(BASE_URL, params=params)
        data = response.json()

        if "values" in data:
            df = pd.DataFrame(data["values"])
            df.to_csv(output_path, index=False)
            print(f"[SUCCESS] Data saved for {stock_code}")
        else:
            print(f"[ERROR] Failed for {stock_code}: {data}")

    except Exception as e:
        print(f"[ERROR] Exception for {stock_code}: {e}")

import pandas as pd
from prophet import Prophet

def train_and_predict(input_csv, stock_code, predictions_csv):
    df = pd.read_csv(input_csv)
    df.rename(columns={"datetime": "ds", "close": "y"}, inplace=True)

    model = Prophet()
    model.fit(df[["ds", "y"]])

    future = model.make_future_dataframe(periods=1)
    forecast = model.predict(future)

    next_day = forecast.iloc[-1][["ds", "yhat"]]
    result = {
        "stock_code": stock_code,
        "date": str(next_day["ds"]),
        "predicted_price": round(next_day["yhat"], 2)
    }

    # Append to predictions.csv
    existing = pd.read_csv(predictions_csv) if os.path.exists(predictions_csv) else pd.DataFrame()
    pd.concat([existing, pd.DataFrame([result])]).to_csv(predictions_csv, index=False)

    print(f"[SUCCESS] Prediction done for {stock_code}")

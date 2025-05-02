from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
from datetime import datetime

app = Flask(__name__)
CORS(app)

# 1. Carga el modelo serializado
model = joblib.load('rf_rolling.pkl')

def make_features(last_prices, timestamp):
    # Lags
    lags = np.array(last_prices).reshape(1, -1)

    # Rolling y momentum
    df_temp = pd.DataFrame({'price': last_prices})
    df_temp['price'] = df_temp['price'].astype(float)
    df_temp['timestamp'] = pd.to_datetime(timestamp)
    df_temp['ma_3']  = df_temp['price'].shift(1).rolling(3).mean()
    df_temp['ma_5']  = df_temp['price'].shift(1).rolling(5).mean()
    df_temp['ma_10'] = df_temp['price'].shift(1).rolling(10).mean()
    df_temp['momentum_1'] = df_temp['price'] - df_temp['price'].shift(1)
    df_temp['momentum_3'] = df_temp['price'] - df_temp['price'].shift(3)
    last = df_temp.iloc[-1]

    ma_vals = np.array([[last['ma_3'], last['ma_5'], last['ma_10'],
                         last['momentum_1'], last['momentum_3']]])

    # Tiempo
    ts = pd.to_datetime(timestamp)
    hour       = ts.hour
    minute     = ts.minute
    weekday    = ts.weekday()
    is_weekend = 1 if weekday >= 5 else 0
    time_vals  = np.array([[hour, minute, weekday, is_weekend]])

    # Concatenar
    return np.hstack([lags, ma_vals, time_vals])

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json(force=True)
    last_prices = data.get('lastPrices')
    ts = data.get('timestamp', datetime.utcnow().isoformat())

    # Validación sencilla
    if not last_prices or len(last_prices) != 10:
        return jsonify({"error": "Se requieren exactamente 10 precios anteriores"}), 400

    X = make_features(last_prices, ts)
    pred = model.predict(X)[0]
    return jsonify({"prediction": round(float(pred), 2)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

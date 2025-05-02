import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error
import matplotlib.pyplot as plt

# 1. Cargar y ordenar datos
df = pd.read_csv('coffee-data.csv')
df['timestamp'] = pd.to_datetime(df['timestamp'])
df.sort_values('timestamp', inplace=True)

# 2. Rolling features (medias móviles) y momentum
df['ma_3']  = df['price'].shift(1).rolling(window=3).mean()
df['ma_5']  = df['price'].shift(1).rolling(window=5).mean()
df['ma_10'] = df['price'].shift(1).rolling(window=10).mean()

df['momentum_1'] = df['price'] - df['price'].shift(1)
df['momentum_3'] = df['price'] - df['price'].shift(3)

# 3. Lags 1–10
for lag in range(1, 11):
    df[f'lag_{lag}'] = df['price'].shift(lag)

# 4. Variables de tiempo
df['hour']       = df['timestamp'].dt.hour
df['minute']     = df['timestamp'].dt.minute
df['weekday']    = df['timestamp'].dt.weekday
df['is_weekend'] = (df['weekday'] >= 5).astype(int)

# 5. Limpiar filas incompletas
df.dropna(inplace=True)

# 6. Definir X e y
feature_cols = [f'lag_{i}' for i in range(1, 11)] + [
    'ma_3', 'ma_5', 'ma_10',
    'momentum_1', 'momentum_3',
    'hour', 'minute', 'weekday', 'is_weekend'
]
X = df[feature_cols]
y = df['price']

# 7. Split train/test (sin shuffle)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, shuffle=False
)

# 8. Modelo con hiperparámetros ya ajustados
model = RandomForestRegressor(
    n_estimators=443,
    max_depth=8,
    min_samples_split=3,
    min_samples_leaf=1,
    random_state=42
)
model.fit(X_train, y_train)

# 9. Predicción y métricas
y_pred = model.predict(X_test)
mae  = mean_absolute_error(y_test, y_pred)
rmse = mean_squared_error(y_test, y_pred) ** 0.5
print(f"RF Rolling — MAE: {mae:.3f}, RMSE: {rmse:.3f}")

# 10. Gráfica real vs predicción
plt.figure()
plt.plot(df['timestamp'], df['price'], label='Precio real', alpha=0.3)
ts_test = df['timestamp'].iloc[-len(y_test):]
plt.plot(ts_test, y_pred, label='Predicción RF Rolling', linestyle='--')
plt.xlabel('Tiempo')
plt.ylabel('Precio')
plt.legend()
plt.tight_layout()
plt.show()

# 11. Predicción del siguiente precio
last = df.iloc[-1]
lags_vals   = last[[f'lag_{i}' for i in range(1,11)]].values.reshape(1,-1)
ma_vals     = np.array([[last['ma_3'], last['ma_5'], last['ma_10'], last['momentum_1'], last['momentum_3']]])
time_vals   = np.array([[pd.Timestamp.utcnow().hour,
                         pd.Timestamp.utcnow().minute,
                         pd.Timestamp.utcnow().weekday(),
                         1 if pd.Timestamp.utcnow().weekday()>=5 else 0]])
X_next = np.hstack([lags_vals, ma_vals, time_vals])
next_price = model.predict(X_next)[0]
print(f"🔮 Próxima predicción RF Rolling: ${next_price:.2f}")
import joblib

# Después de entrenar…
joblib.dump(model, 'rf_rolling.pkl')
print("✅ Modelo guardado en rf_rolling.pkl")

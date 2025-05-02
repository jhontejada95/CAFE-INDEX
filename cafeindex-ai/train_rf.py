import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, TimeSeriesSplit, RandomizedSearchCV
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error
import matplotlib.pyplot as plt
import scipy.stats as stats

# 1. Cargar y preparar datos
df = pd.read_csv('coffee-data.csv')
df['timestamp'] = pd.to_datetime(df['timestamp'])
df.sort_values('timestamp', inplace=True)

# 2. Crear lag features (precio de los últimos 10 bloques)
for lag in range(1, 11):
    df[f'lag_{lag}'] = df['price'].shift(lag)

# 3. Features de tiempo adicionales
df['hour']    = df['timestamp'].dt.hour
df['minute']  = df['timestamp'].dt.minute
df['weekday'] = df['timestamp'].dt.weekday      # 0=Lunes … 6=Domingo
df['is_weekend'] = df['weekday'].isin([5,6]).astype(int)

# 4. Limpiar NaN
df.dropna(inplace=True)

# 5. Definir X e y
feature_cols = [f'lag_{i}' for i in range(1, 11)] + ['hour','minute','weekday','is_weekend']
X = df[feature_cols]
y = df['price']

# 6. Train/test split (secuencia temporal)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, shuffle=False
)

# 7. Configurar búsqueda de hiperparámetros
param_dist = {
    'n_estimators': stats.randint(100, 500),
    'max_depth':    [5, 8, 10, None],
    'min_samples_split': stats.randint(2, 10),
    'min_samples_leaf':  stats.randint(1, 5)
}
tscv = TimeSeriesSplit(n_splits=5)

search = RandomizedSearchCV(
    RandomForestRegressor(random_state=42),
    param_distributions=param_dist,
    n_iter=20,
    cv=tscv,
    scoring='neg_mean_absolute_error',
    verbose=1,
    random_state=42,
    n_jobs=-1
)

# 8. Ejecutar búsqueda
print("▶️ Iniciando RandomizedSearchCV...")
search.fit(X_train, y_train)
best = search.best_estimator_
print("✅ Mejor modelo:", search.best_params_)

# 9. Evaluar en test
y_pred = best.predict(X_test)
mae  = mean_absolute_error(y_test, y_pred)
rmse = mean_squared_error(y_test, y_pred) ** 0.5
print(f"👉 Tuned RF — MAE: {mae:.3f}, RMSE: {rmse:.3f}")

# 10. Gráfica comparativa
plt.figure()
plt.plot(df['timestamp'], df['price'], label='Precio real', alpha=0.3)
timestamps = df['timestamp'].iloc[-len(y_test):]
plt.plot(timestamps, y_pred, label='Predicción Tuned RF', linestyle='--')
plt.xlabel('Tiempo')
plt.ylabel('Precio')
plt.legend()
plt.tight_layout()
plt.show()

# 11. Predicción siguiente precio
# Construir vector de input con últimos 10 precios y tiempo actual
last_block = df.iloc[-1]
lags = last_block[[f'lag_{i}' for i in range(1,11)]].values.reshape(1,-1)
hour    = np.array([[pd.Timestamp.utcnow().hour]])
minute  = np.array([[pd.Timestamp.utcnow().minute]])
weekday = np.array([[pd.Timestamp.utcnow().weekday()]])
is_weekend = np.array([[1 if pd.Timestamp.utcnow().weekday() >=5 else 0]])

X_next = np.hstack([lags, hour, minute, weekday, is_weekend])
next_price = best.predict(X_next)[0]
print(f"🔮 Próxima predicción Tuned RF: ${next_price:.2f}")

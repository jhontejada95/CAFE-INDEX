import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error
import matplotlib.pyplot as plt

# 1. Cargar datos
df = pd.read_csv('coffee-data.csv')
df['timestamp'] = pd.to_datetime(df['timestamp'])
df.sort_values('timestamp', inplace=True)

# 2. Crear feature temporal (segundos desde el inicio)
df['t'] = (df['timestamp'] - df['timestamp'].min()).dt.total_seconds()
X = df[['t']]
y = df['price']

# 3. Dividir en train/test (sin desordenar)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, shuffle=False
)

# 4. Ajustar modelo de regresión lineal
model = LinearRegression()
model.fit(X_train, y_train)

# 5. Predecir y evaluar
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)

# Calculamos RMSE a partir de MSE
mse = mean_squared_error(y_test, y_pred)
rmse = mse ** 0.5

print(f"MAE: {mae:.3f}, RMSE: {rmse:.3f}")


# 6. Gráfica: real vs predicción
plt.figure()
plt.plot(df['timestamp'], df['price'], label='Precio real')
plt.plot(
    df['timestamp'].iloc[len(X_train):],
    y_pred,
    label='Predicción',
    linestyle='--'
)
plt.xlabel('Tiempo')
plt.ylabel('Precio')
plt.legend()
plt.tight_layout()
plt.show()

# 7. Predecir siguiente precio
next_t = (pd.Timestamp.utcnow() - df['timestamp'].min()).total_seconds()
next_price = model.predict([[next_t]])[0]
print(f"🔮 Próxima predicción de precio: ${next_price:.2f}")

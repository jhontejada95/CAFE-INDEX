import pandas as pd

# 1. Leer JSON Lines
df = pd.read_json('coffee-data.json', lines=True)

# 2. Convertir timestamp a datetime
df['timestamp'] = pd.to_datetime(df['timestamp'])

# 3. Guardar a CSV
df.to_csv('coffee-data.csv', index=False)
print(f"✅ Generado coffee-data.csv con {len(df)} registros.")

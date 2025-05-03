"""Configuration settings for CaféIndex AI project."""

# SubQuery related settings
SUBQL_GRAPHQL_ENDPOINT = "http://localhost:3000/graphql"

# Data storage settings
DATA_DIR = "data"
RAW_DATA_PATH = f"{DATA_DIR}/raw_coffee_prices.csv"
PROCESSED_DATA_PATH = f"{DATA_DIR}/processed_coffee_prices.csv"
MODEL_PATH = f"{DATA_DIR}/model.pkl"

# ML model settings
TEST_SIZE = 0.2
RANDOM_STATE = 42
FEATURE_WINDOW_SIZE = 10  # Number of previous days to use as features

# API settings
API_HOST = "0.0.0.0"
API_PORT = 8000

# DeepSeek settings
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"  # Reemplazar con la URL correcta si es diferente
DEEPSEEK_API_KEY = ""  # Set this via environment variable
DEEPSEEK_MODEL = "deepseek-chat"  # Modelo por defecto
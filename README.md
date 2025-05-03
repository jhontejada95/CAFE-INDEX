# Cafu00e9Index AI: Price Indexing and Prediction

Cafu00e9Index AI is a comprehensive solution for indexing on-chain coffee prices, analyzing historical data, and providing price predictions using machine learning models. The project is built with Python and leverages SubQuery for data indexing, with a modern React frontend for visualization.

## Features

1. **On-chain Price Indexing**
   - Interacts with SubQuery's GraphQL API to fetch coffee price data
   - Stores data in CSV and/or SQLite database for analysis

2. **Data Preprocessing & Modeling**
   - Cleans and normalizes historical price data using pandas
   - Creates time-series features for prediction
   - Trains and evaluates RandomForest and Linear Regression models
   - Selects and saves the best-performing model

3. **Prediction Service**
   - FastAPI endpoint that provides price predictions
   - Supports custom prediction horizons

4. **AI-Enhanced Explanations**
   - Optional integration with DeepSeek AI models
   - Provides natural language explanations of price predictions

5. **Interactive Frontend**
   - Modern React interface with pastel purple aesthetics
   - Responsive design for various screen sizes
   - Real-time price visualization and AI interaction

## Project Structure

```
CAFE-INDEX/
u2502
u251cu2500u2500 data_indexing/         # Data indexing module
u2502   u2514u2500u2500 indexer.py        # Functions to fetch and store data from SubQuery
u251cu2500u2500 data_processing/       # Data processing and model training
u2502   u251cu2500u2500 preprocessor.py  # Data cleaning and feature engineering
u2502   u2514u2500u2500 model_trainer.py # Model training and evaluation
u251cu2500u2500 prediction_service/    # FastAPI prediction service
u2502   u2514u2500u2500 app.py          # API endpoints for predictions
u251cu2500u2500 frontend/             # React frontend application
u2502   u251cu2500u2500 src/             # Source code for React components
u2502   u2514u2500u2500 public/          # Static assets
u251cu2500u2500 config.py             # Configuration settings
u251cu2500u2500 utils.py              # Utility functions
u251cu2500u2500 main.py               # Main script for running the pipeline
u251cu2500u2500 requirements.txt      # Python dependencies
u251cu2500u2500 Dockerfile            # Docker configuration
u251cu2500u2500 docker-compose.yml     # Docker Compose configuration
u2514u2500u2500 README.md             # Project documentation
```

## Prerequisites

- Python 3.9 or higher
- Node.js 14+ and npm/yarn (for frontend)
- Docker and Docker Compose (for containerized deployment)
- SubQuery node or access to a SubQuery GraphQL endpoint
- DeepSeek API key (optional, for explanation feature)

## Installation

### Backend Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd CAFE-INDEX
   ```

2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables (optional):
   ```bash
   export DEEPSEEK_API_KEY=your_deepseek_api_key  # On Windows: set DEEPSEEK_API_KEY=your_deepseek_api_key
   ```

### Frontend Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or if you use yarn
   yarn
   ```

### Docker Installation

1. Build and start the containers:
   ```bash
   docker-compose up -d
   ```

## Usage

### Running the Indexing Pipeline

The indexing pipeline fetches data from SubQuery, processes it, and trains a model:

```bash
python main.py
```

You can skip specific steps with the following flags:

```bash
python main.py --skip-index --skip-process --skip-train
```

### Starting the Backend API

To start the FastAPI prediction service:

```bash
uvicorn prediction_service.app:app --host 0.0.0.0 --port 8000
```

Or with Docker:

```bash
docker-compose up -d
```

### Running the Frontend

In development mode:

```bash
cd frontend
npm run dev
# or with yarn
yarn dev
```

For production build:

```bash
cd frontend
npm run build
# then serve the dist directory
npm run preview
```

### API Endpoints

#### Health Check
- **URL**: `/`
- **Method**: `GET`
- **Response**: Service health status

#### Price Prediction
- **URL**: `/predict`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "prompt": "How will coffee prices change next month?",
    "days_ahead": 30,
    "explanation_required": true
  }
  ```
- **Response**:
  ```json
  {
    "historical_prices": [
      {"date": "2023-05-01", "price": 3.45},
      // ...
    ],
    "predictions": [
      {"date": "2023-06-01", "price": 3.72},
      // ...
    ],
    "explanation": "The predicted 7.8% increase in coffee prices over the next month likely reflects..."
  }
  ```

## Customization

### SubQuery Configuration

To use your own SubQuery project or GraphQL endpoint, update the `SUBQL_GRAPHQL_ENDPOINT` variable in `config.py`.

### Model Tuning

To customize the machine learning models, edit the hyperparameters in the `train_models` function in `data_processing/model_trainer.py`.

### DeepSeek Integration

To use the explanation feature, set your DeepSeek API key as an environment variable or update it in `config.py`:

```bash
export DEEPSEEK_API_KEY=your_deepseek_api_key
```

You can also change the DeepSeek model by updating the `DEEPSEEK_MODEL` variable in `config.py`.

### Frontend Customization

To modify the frontend appearance or behavior:

1. Edit the React components in `frontend/src/`
2. Adjust the Tailwind CSS styles in `frontend/src/index.css`
3. For color schemes, modify the extended theme in `frontend/tailwind.config.js`

## Connecting Frontend to Backend

By default, the frontend will look for the backend API at `http://localhost:8000`. To change this:

1. Create a `.env` file in the frontend directory:
   ```
   VITE_API_URL=http://your-api-url:port
   ```

## Best Practices

1. **Data Versioning**: The system saves raw and processed data in CSV files, enabling data versioning and reproducibility.

2. **Model Evaluation**: Multiple models are trained and evaluated using appropriate metrics (MSE, Ru00b2) to select the best one.

3. **Error Handling**: Comprehensive error handling is implemented throughout the codebase.

4. **Logging**: Detailed logging provides insights into the system's operation and facilitates debugging.

5. **Configuration Management**: Central configuration in `config.py` makes the system easy to customize.

## Deployment

### Full-Stack Deployment with Docker

The included Docker Compose setup will deploy both the backend and frontend services:

```bash
docker-compose up -d
```

This will:
- Build and start the Python backend service on port 8000
- Build and serve the frontend on port 3000
- Set up appropriate networking between services

### Separate Deployment

For separate deployment:

1. Backend: Deploy as a standard FastAPI application using Gunicorn/Uvicorn
2. Frontend: Build using `npm run build` and serve the static files with Nginx or similar

## License

[Your chosen license]

## Acknowledgements

- [SubQuery](https://subquery.network/) for providing blockchain data indexing infrastructure
- [FastAPI](https://fastapi.tiangolo.com/) for the high-performance API framework
- [scikit-learn](https://scikit-learn.org/) for machine learning models
- [DeepSeek](https://deepseek.com/) for AI models for natural language explanations
- [React](https://reactjs.org/) for the frontend user interface
- [Tailwind CSS](https://tailwindcss.com/) for styling and responsive design
- [Vite](https://vitejs.dev/) for frontend tooling and development
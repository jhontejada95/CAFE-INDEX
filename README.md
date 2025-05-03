# u2615 Cafu00e9Index AI: Price Indexing and Prediction ud83dudcc8

Cafu00e9Index AI is a comprehensive solution for indexing on-chain coffee prices, analyzing historical data, and providing price predictions using machine learning models. The project is built with Python and leverages SubQuery for data indexing, with a modern React frontend for visualization, and Polkadot/Substrate for on-chain price oracle functionality.

## u2728 Features

1. **ud83dudcca On-chain Price Indexing**
   - Interacts with SubQuery's GraphQL API to fetch coffee price data
   - Stores data in CSV and/or SQLite database for analysis

2. **ud83euddd0 Data Preprocessing & Modeling**
   - Cleans and normalizes historical price data using pandas
   - Creates time-series features for prediction
   - Trains and evaluates RandomForest and Linear Regression models
   - Selects and saves the best-performing model

3. **ud83dudd2e Prediction Service**
   - FastAPI endpoint that provides price predictions
   - Supports custom prediction horizons

4. **ud83eudd16 AI-Enhanced Explanations**
   - Optional integration with DeepSeek AI models
   - Provides natural language explanations of price predictions

5. **ud83dudcc8 Interactive Frontend**
   - Modern React interface with pastel purple aesthetics
   - Responsive design for various screen sizes
   - Real-time price visualization and AI interaction

6. **ud83cudfdd On-chain Price Oracle**
   - Publishes coffee price data to Polkadot's Westend testnet
   - Creates a public, auditable record of price history
   - Periodic submissions via scheduled jobs (every 15 minutes)

7. **ud83dudd11 Wallet Integration**
   - Connect Polkadot.js wallet directly from the frontend
   - Select accounts and view balances
   - Submit coffee price data on-chain with transaction signing

## ud83dudcbc Project Structure

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
u251cu2500u2500 price_oracle/          # Polkadot price oracle functionality
u2502   u251cu2500u2500 oracle.py        # Core oracle implementation
u2502   u251cu2500u2500 run_oracle.py    # Script to run the oracle
u2502   u2514u2500u2500 test_oracle.py   # Testing utility for the oracle
u251cu2500u2500 frontend/             # React frontend application
u2502   u251cu2500u2500 src/             # Source code for React components
u2502   u2502   u251cu2500u2500 components/  # React components
u2502   u2502   u2514u2500u2500 services/    # Service modules including Polkadot wallet integration
u2502   u2514u2500u2500 public/          # Static assets
u251cu2500u2500 config.py             # Configuration settings
u251cu2500u2500 utils.py              # Utility functions
u251cu2500u2500 main.py               # Main script for running the pipeline
u251cu2500u2500 requirements.txt      # Python dependencies
u251cu2500u2500 Dockerfile            # Docker configuration
u251cu2500u2500 docker-compose.yml     # Docker Compose configuration
u2514u2500u2500 README.md             # Project documentation
```

## ud83dudcdd Prerequisites

- Python 3.9 or higher
- Node.js 14+ and npm/yarn (for frontend)
- Docker and Docker Compose (for containerized deployment)
- SubQuery node or access to a SubQuery GraphQL endpoint
- DeepSeek API key (optional, for explanation feature)
- Westend account with funds (for the price oracle functionality)
- Polkadot.js Browser Extension (for wallet integration)

## ud83dudd29 Installation

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

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env file with your API keys and settings
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

## ud83dude80 Usage

### Running the Indexing Pipeline

The indexing pipeline fetches data from SubQuery, processes it, and trains a model:

```bash
python main.py
```

You can skip specific steps with the following flags:

```bash
python main.py --skip-index --skip-process --skip-train
```

### ud83dudc36 Using the Price Oracle

The price oracle functionality allows you to submit coffee price data to the Westend testnet:

1. Set up your Westend account in `.env` file:
   ```
   WESTEND_WS_URL=wss://westend-rpc.polkadot.io
   SIGNER_SEED=your 12-word mnemonic seed phrase
   ```

2. Test the connection to Westend:
   ```bash
   python main.py --oracle test-connection
   ```

3. Send a test price submission:
   ```bash
   python main.py --oracle test-send
   ```

4. Submit recent prices to Westend:
   ```bash
   python main.py --oracle submit --hours 24
   ```

5. Set up a cron job to run every 15 minutes:
   ```
   */15 * * * * cd /path/to/CAFE-INDEX && python main.py --oracle submit --hours 1
   ```

### ud83dudd10 Using the Frontend Wallet Integration

The frontend includes a wallet connection feature that allows users to interact directly with the Polkadot blockchain:

1. Install the [Polkadot.js Extension](https://polkadot.js.org/extension/) in your browser
2. Create or import an account in the extension
3. Launch the frontend application
4. Click "Connect Wallet" in the interface
5. Select your account from the dropdown when prompted
6. Use the "Send Price Test" button to submit a price to the blockchain

**Note:** This feature requires the Polkadot.js Browser Extension to be installed and configured with at least one account.

### ud83dudc80 Starting the Backend API

To start the FastAPI prediction service:

```bash
uvicorn prediction_service.app:app --host 0.0.0.0 --port 8000
```

Or with Docker:

```bash
docker-compose up -d
```

### ud83dudd96 Running the Frontend

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

### ud83dudd38 API Endpoints

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

## ud83dude9c Customization

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

### Oracle Configuration

To configure the Westend price oracle:

1. **Connection**: You can use a custom Westend RPC endpoint by updating the `WESTEND_WS_URL` variable in `.env`
   
2. **Account**: Replace the `SIGNER_SEED` in `.env` with your own Westend account's mnemonic seed phrase. Ensure this account has sufficient funds for transaction fees.

3. **Custom ID Format**: Modify the oracle's ID generation in `price_oracle/run_oracle.py` if you want to use a different format.

### Wallet Integration Customization

The Polkadot.js wallet integration can be customized in several ways:

1. **RPC Endpoint**: Change the Westend RPC endpoint in `src/services/polkadot.ts` to connect to a different network

2. **Transaction Type**: Modify the `submitPrice` function in `src/services/polkadot.ts` to use a different transaction type

3. **Data Format**: Adjust the price data format in the payload as needed for your specific use case

4. **UI Customization**: The wallet connector component in `src/components/PolkadotConnector.tsx` can be styled and modified to match your requirements

**Note about `priceFeed` Module**: The current implementation attempts to use a `priceFeed` module that may not be available on the standard Westend testnet. For a production environment, you would need to:

1. Deploy a custom Substrate chain with the appropriate pallets
2. Use a parachain with support for the required functionality
3. Implement an alternative approach using contract calls or `system.remark`

### Frontend Customization

To modify the frontend appearance or behavior:

1. Edit the React components in `frontend/src/`
2. Adjust the Tailwind CSS styles in `frontend/src/index.css`
3. For color schemes, modify the extended theme in `frontend/tailwind.config.js`

## ud83dudcce Connecting Frontend to Backend

By default, the frontend will look for the backend API at `http://localhost:8000`. To change this:

1. Create a `.env` file in the frontend directory:
   ```
   VITE_API_URL=http://your-api-url:port
   ```

## u2699ufe0f Best Practices

1. **Data Versioning**: The system saves raw and processed data in CSV files, enabling data versioning and reproducibility.

2. **Model Evaluation**: Multiple models are trained and evaluated using appropriate metrics (MSE, Ru00b2) to select the best one.

3. **Error Handling**: Comprehensive error handling is implemented throughout the codebase.

4. **Logging**: Detailed logging provides insights into the system's operation and facilitates debugging.

5. **Configuration Management**: Central configuration in `config.py` makes the system easy to customize.

6. **Wallet Security**: The wallet integration uses the Polkadot.js extension for secure key management, never exposing private keys.

## ud83cudf10 Deployment

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

## ud83cudfe0 License

[Your chosen license]

## ud83dudc4f Acknowledgements

- [SubQuery](https://subquery.network/) for providing blockchain data indexing infrastructure
- [FastAPI](https://fastapi.tiangolo.com/) for the high-performance API framework
- [scikit-learn](https://scikit-learn.org/) for machine learning models
- [DeepSeek](https://deepseek.com/) for AI models for natural language explanations
- [React](https://reactjs.org/) for the frontend user interface
- [Tailwind CSS](https://tailwindcss.com/) for styling and responsive design
- [Vite](https://vitejs.dev/) for frontend tooling and development
- [Polkadot/Substrate](https://polkadot.network/) for the blockchain infrastructure
- [Polkadot.js](https://polkadot.js.org/) for browser extension and API tools
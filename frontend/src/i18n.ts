// src/i18n.ts

export const T = {
  en: {
    // App
    appTitle: "☕ CaféIndex AI",
    footerTech: "Technologies used:",

    // LanguageSwitcher
    // (radio labels are hardcoded EN / ES)

    // AIQuerySection
    aiQueryTitle: "🔮 Ask the AI Agent",
    textareaPlaceholder: "Ask your coffee price question...",
    askButton: "Ask",
    errorNoQuery: "Please enter a question",
    errorCommunication:
      "Error communicating with prediction service. Try again later.",
    responseTitle: "Response:",
    chartPlaceholder: "Run a query to see the chart",
    currentPriceTitle: "Current Price",
    monthPredictionTitle: "Month Prediction",

    // EthereumConnector
    connect: "Connect Wallet",
    submitting: "Submitting…",
    submitTest: "Send Test",
    balanceLabel: "Balance:",
    connectedLabel: "Connected",
    accountLabel: "Connected account",
    networkLabel: "Network",

    // LastPriceInfo
    lastPriceButton: "Get Last Price Info",
    lastPriceTitle: "Last Submitted Price Info",
    closeButton: "Close",
    noInfoAvailable: "No information available.",
    priceInfoId: "ID:",
    priceInfoTimestamp: "Timestamp:",
    priceInfoPrice: "Price:",
    priceInfoSubmitter: "Submitter:",

    // PriceChart
    priceChartTitle: "📈 Price History",
    noDataAvailable: "No data available to display",
    xAxisLabel: "Date", 
    yAxisLabel: "Price ($/lb)",
    historicalLabel: "Historical", 
    predictionLabel: "Prediction",
  },
  es: {
    // App
    appTitle: "☕ CaféIndex AI",
    footerTech: "Tecnologías usadas:",

    // AIQuerySection
    aiQueryTitle: "🔮 Consulta al Agente IA",
    textareaPlaceholder: "Escribe tu pregunta sobre precios del café...",
    askButton: "Preguntar",
    errorNoQuery: "Por favor, escribe una pregunta",
    errorCommunication:
      "Error al comunicarse con el servicio de predicción. Por favor, intenta más tarde.",
    responseTitle: "Respuesta:",
    chartPlaceholder: "Consulta para ver el gráfico",
    currentPriceTitle: "Precio Actual",
    monthPredictionTitle: "Predicción del Mes",

    // EthereumConnector
    connect: "Conectar Wallet",
    submitting: "Enviando…",
    submitTest: "Enviar Prueba",
    balanceLabel: "Saldo:",
    connectedLabel: "Conectado",
    accountLabel: "Cuenta conectada",
    networkLabel: "Red actual",

    // LastPriceInfo
    lastPriceButton: "Obtener Información del Último Precio",
    lastPriceTitle: "Información del Último Precio Enviado",
    closeButton: "Cerrar",
    noInfoAvailable: "No hay información disponible.",
    priceInfoId: "ID:",
    priceInfoTimestamp: "Fecha y hora:",
    priceInfoPrice: "Precio:",
    priceInfoSubmitter: "Remitente:",

    // PriceChart
    priceChartTitle: "📈 Histórico de Precios",
    noDataAvailable: "No hay datos disponibles para mostrar",
    xAxisLabel: "Fecha", 
    yAxisLabel: "Precio ($/lb)",
    historicalLabel: "Histórico", 
    predictionLabel: "Predicción",
  },
} as const;

export type LangKey = keyof typeof T; // 'en' | 'es'
export type TextKey = keyof (typeof T)["en"]; // e.g. 'connect', 'aiQueryTitle', …

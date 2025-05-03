# CafeIndex UI

Este proyecto es la interfaz de usuario (UI) para el proyecto CafeIndex, que indexa los precios del café en la red Westend. La interfaz de usuario permite a los usuarios ver los precios del café en tiempo real y visualizar tendencias a través de gráficos. También proporciona una forma para que los usuarios registren el precio actual del café en la cadena.

## Requisitos

*   Node.js (>=18)
*   npm o yarn

## Ejecución

1.  **Clonar el repositorio:**
    ```bash
    git clone <URL del repositorio>
    cd cafeindex-ui
    ```
2.  **Instalar dependencias:**
    ```bash
    npm install
    # o
    yarn install
    ```
3.  **Iniciar la aplicación:**
    ```bash
    npm start
    # o
    yarn start
    ```

    Esto iniciará la aplicación en modo de desarrollo.  Puedes abrirla en tu navegador en [http://localhost:3000](http://localhost:3000). La aplicación se recargará automáticamente al realizar cambios en el código fuente.
4.  **Para registrar los precios en la cadena:**
    *   Asegúrate de tener la extensión Polkadot.js instalada y configurada con una cuenta en la red Westend.
    *   El botón "Register Price On-Chain" estará habilitado si la extensión se detecta y se selecciona una cuenta.  Al hacer clic en este botón, se registrará el precio actual del café en un bloque de la cadena.

## Estructura del Proyecto

*   `src/App.tsx`: Componente principal de la aplicación.
*   `src/components/CoffeeDashboard.tsx`: Componente que muestra el panel de control con los precios y el gráfico.
*   `src/api/predict.ts`:  Archivo que contiene la lógica para la predicción de precios, que se conecta con la API del backend.
*   `src/hooks/usePolkadot.ts`:  Hook personalizado para conectar a la extensión Polkadot.js y a la red Westend.
*   `public/index.html`: Archivo HTML principal.
*   `public/manifest.json`: Archivo de metadatos para la aplicación.
*   `public/polkadot-logo.svg`: Logo de Polkadot.
*   `src/index.tsx`: Punto de entrada de la aplicación React.
*   `src/reportWebVitals.ts`: Función para medir las métricas web vitales.
*   `src/react-app-env.d.ts`:  Archivo de declaración de tipos de React.
*   `src/setupTests.ts`: Configuración de pruebas.

## Tecnologías Utilizadas

*   React
*   TypeScript
*   Recharts (para gráficos)
*   @polkadot/api (para interactuar con la red Westend)
*   @polkadot/extension-dapp (para la extensión Polkadot.js)
*   CSS (para estilos)

## Pruebas

Para ejecutar las pruebas, utiliza el comando:

```bash
npm test
# o
yarn test

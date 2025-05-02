import {
  SubstrateDatasourceKind,
  SubstrateHandlerKind,
  SubstrateProject,
} from "@subql/types";

const project: SubstrateProject = {
  specVersion: "1.0.0",
  version: "0.0.1",
  name: "cafeindex-subql",
  description: "SubQuery indexer for CoffeeIndex – indexing CoffeePrice.PriceSet events from Westend",
  runner: {
    node: {
      name: "@subql/node",
      version: ">=3.0.1",
    },
    query: {
      name: "@subql/query",
      version: "*",
    },
  },
  schema: {
    file: "./schema.graphql",
  },
  network: {
    // Conexión a Westend
    endpoint: "wss://westend-rpc.polkadot.io",
  },
  dataSources: [
    {
      kind: SubstrateDatasourceKind.Runtime,
      // A partir de qué bloque debe empezar a indexar
      startBlock: 1,
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            kind: SubstrateHandlerKind.Event,
            // Nombre de tu función en mappings.ts
            handler: "handlePriceSet",
            filter: {
              // Ajusta estos valores a tu pallet/evento reales
              module: "CoffeePrice",
              method: "PriceSet",
            },
          },
        ],
      },
    },
  ],
};

export default project;


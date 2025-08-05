# 📈 Crypto Correlation Dashboard

A real-time dashboard that tracks and visualizes the correlation between BTC and ETH using live data, Deno, Server-Sent Events (SSE), NATS, and Chart.js.

## Features

- Live BTC and ETH price ingestion via external APIs
- Real-time correlation calculation between BTC and ETH
- Event-driven architecture with NATS for internal messaging
- Live UI updates via SSE and Chart.js
- Compact and responsive dashboard UI
- Docker Compose for easy deployment

# Pros and Cons of Deno

## Pros

- **Secure by default**  
  Runs in a sandbox; no file, network, or environment access unless explicitly enabled.
- **First-class TypeScript support**  
  Native TypeScript support—no separate build step required.
- **Modern standard library**  
  Curated, consistent standard library included.
- **Single executable**  
  Ships as a single binary with built-in tools (formatter, linter, test runner, bundler).
- **ES Modules by default**  
  Uses modern ECMAScript modules, matching browser standards.
- **No `node_modules` or `package.json`**  
  Imports via URLs simplify dependency management.
- **Built-in tooling**  
  Formatting, linting, testing, and bundling included.
- **Native web API support**  
  Many browser APIs (like `fetch`, `WebSocket`) are available natively.

## Cons

- **Ecosystem maturity**  
  Younger ecosystem; fewer packages and less community support than Node.js.
- **Compatibility issues**  
  Many npm modules don't work out of the box (though npm support is improving).
- **Smaller user base**  
  Fewer resources, tutorials, and community support.
- **URL imports**  
  Reliance on third-party URLs for modules—versioning and availability can be a risk.
- **Performance differences**  
  Some workloads may perform better in Node.js.
- **Adoption risk**  
  Not widely adopted in production environments yet.


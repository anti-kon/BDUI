# Luma Market

Luma Market is a BDUI e-commerce example. The contract describes catalog,
cart, order placement, delivery state and checkout flow without
platform-specific UI code.

Build the canonical contract:

```bash
npm run bdui -- build examples/retail-commerce/src/app.tsx -o examples/retail-commerce/contract.json --mode prod
```

The generated contract is copied into `sandbox/web-demo/retail.contract.json`
and native resource folders by `npm run build:contracts`, so the web preview,
Android application and iOS application render the same retail scenario.

# Luma Market

Luma Market - коммерческий BDUI-пример интернет-магазина. Контракт показывает
каталог, корзину, оформление заказа, состояние доставки и checkout flow без
платформенного UI-кода.

Собрать канонический контракт:

```bash
npm run bdui -- build examples/retail-commerce/src/app.tsx -o examples/retail-commerce/contract.json --mode prod
```

Контракт также копируется в `sandbox/web-demo/retail.contract.json`, чтобы
переключать его рядом с примером Кампуса в браузерной демонстрации.

import { Flow, Session } from '@bdui/dsl';

/* ------------------------------ Session ------------------------------ */
export const customerName = Session<string>('customerName', 'Анна Смирнова');
export const customerPhone = Session<string>('customerPhone', '+7 900 120-45-67');
export const customerEmail = Session<string>('customerEmail', 'anna@example.ru');
export const deliveryCity = Session<string>('deliveryCity', 'Москва');
export const deliveryAddress = Session<string>('deliveryAddress', 'Тверская, 12');
export const preferredSlot = Session<string>('preferredSlot', 'Сегодня, 19:00-21:00');
export const paymentMethod = Session<string>('paymentMethod', 'Карта онлайн');
export const marketingConsent = Session<boolean>('marketingConsent', true);

/* ------------------------------- Flow -------------------------------- */
export const selectedCategory = Flow<string>('selectedCategory', 'Все');
export const sortMode = Flow<string>('sortMode', 'Сначала популярные');
export const featuredProduct = Flow<string>('featuredProduct', 'Нет');
export const cartItems = Flow<number>('cartItems', 0);
export const cartSubtotal = Flow<number>('cartSubtotal', 0);
export const deliveryPrice = Flow<number>('deliveryPrice', 0);
export const discount = Flow<number>('discount', 0);
export const orderNumber = Flow<string>('orderNumber', 'LM-2026-1048');
export const orderStatus = Flow<string>('orderStatus', 'Корзина пуста');
export const loyaltyLevel = Flow<string>('loyaltyLevel', 'Plus');
export const promoCode = Flow<string>('promoCode', 'HOME1500');
export const validationError = Flow<string>('validationError', '');
export const statusMessage = Flow<string>('statusMessage', '');
export const espressoQty = Flow<number>('espressoQty', 0);
export const chairQty = Flow<number>('chairQty', 0);
export const lampQty = Flow<number>('lampQty', 0);
export const robotQty = Flow<number>('robotQty', 0);
export const humidifierQty = Flow<number>('humidifierQty', 0);
export const backpackQty = Flow<number>('backpackQty', 0);

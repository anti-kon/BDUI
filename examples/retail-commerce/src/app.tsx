import {
  Button,
  Checkbox,
  Column,
  Contract,
  Divider,
  FlowRoute,
  If,
  Image,
  Input,
  Navigation,
  Route,
  Row,
  Select,
  Step,
  Text,
  ThemeConfig as Theme,
} from '@bdui/dsl';
import { bind, E, Flow, Session, use } from '@bdui/dsl';

import meta from './meta.json';

export const customerName = Session<string>('customerName', 'Анна Смирнова');
export const customerPhone = Session<string>('customerPhone', '+7 900 120-45-67');
export const customerEmail = Session<string>('customerEmail', 'anna@example.ru');
export const deliveryCity = Session<string>('deliveryCity', 'Москва');
export const deliveryAddress = Session<string>('deliveryAddress', 'Тверская, 12');
export const preferredSlot = Session<string>('preferredSlot', 'Сегодня, 19:00-21:00');
export const paymentMethod = Session<string>('paymentMethod', 'Карта онлайн');
export const marketingConsent = Session<boolean>('marketingConsent', true);

export const selectedCategory = Flow<string>('selectedCategory', 'Популярное');
export const sortMode = Flow<string>('sortMode', 'По рекомендации');
export const featuredProduct = Flow<string>('featuredProduct', 'Набор для домашнего кофе');
export const cartItems = Flow<number>('cartItems', 2);
export const cartSubtotal = Flow<number>('cartSubtotal', 4980);
export const deliveryPrice = Flow<number>('deliveryPrice', 290);
export const discount = Flow<number>('discount', 600);
export const orderNumber = Flow<string>('orderNumber', 'LM-2026-1048');
export const orderStatus = Flow<string>('orderStatus', 'Корзина готова');
export const loyaltyLevel = Flow<string>('loyaltyLevel', 'Plus');
export const promoCode = Flow<string>('promoCode', 'WELCOME600');
export const validationError = Flow<string>('validationError', '');
export const statusMessage = Flow<string>('statusMessage', '');

const page = { gap: 18, margin: '0 auto', maxWidth: '1040px', padding: 22 };
const card = {
  background: '#ffffff',
  border: '1px solid #d7e0ea',
  borderRadius: 8,
  boxShadow: '0 10px 24px rgba(15, 23, 42, 0.06)',
  gap: 12,
  padding: 18,
};
const compactCard = {
  ...card,
  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)',
  padding: 14,
};
const title = { color: '#102033', fontSize: 30, fontWeight: 800 };
const sectionTitle = { color: '#102033', fontSize: 19, fontWeight: 800 };
const muted = { color: '#64748b' };
const accent = { color: '#047857', fontWeight: 800 };
const warning = { color: '#b45309', fontWeight: 800 };
const danger = { color: '#b91c1c', fontWeight: 800 };
const price = { color: '#0f766e', fontSize: 22, fontWeight: 900 };
const pill = {
  background: '#ecfdf5',
  border: '1px solid #bbf7d0',
  borderRadius: 999,
  color: '#047857',
  fontWeight: 800,
  padding: '4px 10px',
};

const Header = () => (
  <Row modifiers={{ alignItems: 'center', gap: 12 }}>
    <Image
      src="market-mark.svg"
      alt="Market"
      width={48}
      height={48}
      modifiers={{ borderRadius: 14 }}
    />
    <Column modifiers={{ gap: 5 }}>
      <Text modifiers={title}>Luma Market</Text>
      <Text modifiers={muted}>Коммерческий checkout, корзина и персональные предложения.</Text>
    </Column>
  </Row>
);

const Nav = () => (
  <Row modifiers={{ flexWrap: 'wrap', gap: 8, padding: 0 }}>
    <Button title="Витрина" onAction={[{ navigate: ['storefront', { mode: 'replace' }] }]} />
    <Button title="Каталог" onAction={[{ navigate: ['catalog', { mode: 'replace' }] }]} />
    <Button title="Корзина" onAction={[{ navigate: ['cart', { mode: 'replace' }] }]} />
    <Button title="Заказы" onAction={[{ navigate: ['orders', { mode: 'replace' }] }]} />
  </Row>
);

const Shell = ({ children }: { children: unknown }) => (
  <Column modifiers={page}>
    <Header />
    <Nav />
    <Divider />
    {children}
  </Column>
);

const StatusLine = () => (
  <If condition={E<boolean>('len(flow.statusMessage) > 0')}>
    <Text modifiers={accent}>{use(statusMessage)}</Text>
  </If>
);

const ErrorLine = () => (
  <If condition={E<boolean>('len(flow.validationError) > 0')}>
    <Text modifiers={danger}>{use(validationError)}</Text>
  </If>
);

const OrderTotals = () => (
  <Column modifiers={compactCard}>
    <Text modifiers={sectionTitle}>Итого</Text>
    <Text>Товары: {use(cartSubtotal)} ₽</Text>
    <Text>Доставка: {use(deliveryPrice)} ₽</Text>
    <Text>Промокод: -{use(discount)} ₽</Text>
    <Text modifiers={price}>К оплате: 4670 ₽</Text>
  </Column>
);

const ProductCard = ({
  name,
  description,
  cost,
  actionMessage,
}: {
  name: string;
  description: string;
  cost: string;
  actionMessage: string;
}) => (
  <Column modifiers={{ ...compactCard, minWidth: 230 }}>
    <Text modifiers={sectionTitle}>{name}</Text>
    <Text modifiers={muted}>{description}</Text>
    <Text modifiers={price}>{cost}</Text>
    <Button
      title="Добавить"
      modifiers={{ variant: 'primary' }}
      onAction={[
        { inc: bind(cartItems) },
        { set: [bind(featuredProduct), name] },
        { set: [bind(orderStatus), 'Товар добавлен в корзину'] },
        { set: [bind(statusMessage), actionMessage] },
        { toast: [actionMessage, { level: 'success' }] },
      ]}
    />
  </Column>
);

const CustomerCard = () => (
  <Column modifiers={card}>
    <Text modifiers={sectionTitle}>Покупатель</Text>
    <Text>{use(customerName)}</Text>
    <Text>{use(customerPhone)}</Text>
    <Text>{use(customerEmail)}</Text>
    <Text>
      Доставка: {use(deliveryCity)}, {use(deliveryAddress)}
    </Text>
    <Text>Слот: {use(preferredSlot)}</Text>
  </Column>
);

export default (
  <Contract meta={meta}>
    <Theme.Simple primary="#16a34a" background="#f8fafc" darkBackground="#111827" />
    <Navigation initialRoute="storefront" urlSync>
      <Route id="storefront" title="Витрина">
        <Shell>
          <Row modifiers={{ alignItems: 'stretch', flexWrap: 'wrap', gap: 14 }}>
            <Column modifiers={{ ...card, flex: 2, minWidth: 320 }}>
              <Text modifiers={pill}>Уровень клиента: {use(loyaltyLevel)}</Text>
              <Text modifiers={{ color: '#102033', fontSize: 26, fontWeight: 900 }}>
                Быстрый заказ товаров для дома и работы
              </Text>
              <Text modifiers={muted}>
                Каталог, корзина, промокод, доставка и оформление заказа собраны в одном BDUI
                контракте.
              </Text>
              <Row modifiers={{ flexWrap: 'wrap', gap: 10 }}>
                <Button
                  title="Открыть каталог"
                  modifiers={{ variant: 'primary' }}
                  onAction={[{ navigate: ['catalog'] }]}
                />
                <Button title="Перейти в корзину" onAction={[{ navigate: ['cart'] }]} />
              </Row>
            </Column>
            <Column modifiers={{ ...card, flex: 1, minWidth: 260 }}>
              <Text modifiers={sectionTitle}>Текущий заказ</Text>
              <Text>Позиции: {use(cartItems)}</Text>
              <Text>Выбранный товар: {use(featuredProduct)}</Text>
              <Text>Промокод: {use(promoCode)}</Text>
              <Text modifiers={accent}>{use(orderStatus)}</Text>
            </Column>
          </Row>

          <Row modifiers={{ alignItems: 'stretch', flexWrap: 'wrap', gap: 14 }}>
            <ProductCard
              name="Набор для домашнего кофе"
              description="AeroPress, фильтры и свежеобжаренный зерновой кофе."
              cost="4 980 ₽"
              actionMessage="Кофейный набор добавлен"
            />
            <ProductCard
              name="Подписка Fresh Box"
              description="Еженедельная коробка полезных продуктов с доставкой."
              cost="2 490 ₽"
              actionMessage="Подписка добавлена"
            />
            <ProductCard
              name="Офисный стартовый набор"
              description="Канцелярия, зарядные устройства и органайзеры."
              cost="6 300 ₽"
              actionMessage="Офисный набор добавлен"
            />
          </Row>
          <StatusLine />
        </Shell>
      </Route>

      <Route id="catalog" title="Каталог">
        <Shell>
          <Column modifiers={card}>
            <Text modifiers={sectionTitle}>Фильтры каталога</Text>
            <Row modifiers={{ alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <Select
                binding={bind(selectedCategory)}
                placeholder="Категория"
                options={[
                  { label: 'Популярное', value: 'Популярное' },
                  { label: 'Дом', value: 'Дом' },
                  { label: 'Офис', value: 'Офис' },
                  { label: 'Подписки', value: 'Подписки' },
                ]}
              />
              <Select
                binding={bind(sortMode)}
                placeholder="Сортировка"
                options={[
                  { label: 'По рекомендации', value: 'По рекомендации' },
                  { label: 'Сначала дешевле', value: 'Сначала дешевле' },
                  { label: 'Сначала новинки', value: 'Сначала новинки' },
                ]}
              />
            </Row>
            <Text>
              Сейчас показано: {use(selectedCategory)}, {use(sortMode)}
            </Text>
          </Column>

          <Row modifiers={{ alignItems: 'stretch', flexWrap: 'wrap', gap: 14 }}>
            <ProductCard
              name="Набор для домашнего кофе"
              description="Самый популярный товар недели."
              cost="4 980 ₽"
              actionMessage="Кофейный набор добавлен"
            />
            <ProductCard
              name="Подписка Fresh Box"
              description="Коммерческий сценарий регулярной покупки."
              cost="2 490 ₽"
              actionMessage="Подписка добавлена"
            />
            <ProductCard
              name="Офисный стартовый набор"
              description="B2B-заказ для небольшой команды."
              cost="6 300 ₽"
              actionMessage="Офисный набор добавлен"
            />
          </Row>
          <StatusLine />
        </Shell>
      </Route>

      <Route id="cart" title="Корзина">
        <Shell>
          <Row modifiers={{ alignItems: 'stretch', flexWrap: 'wrap', gap: 14 }}>
            <Column modifiers={{ ...card, flex: 2, minWidth: 320 }}>
              <Text modifiers={sectionTitle}>Корзина</Text>
              <Text>Позиции: {use(cartItems)}</Text>
              <Text>Основной товар: {use(featuredProduct)}</Text>
              <Text>Статус: {use(orderStatus)}</Text>
              <Input binding={bind(promoCode)} placeholder="Промокод" inputType="text" />
              <Row modifiers={{ flexWrap: 'wrap', gap: 10 }}>
                <Button
                  title="Применить промокод"
                  onAction={[
                    { set: [bind(discount), 600] },
                    { set: [bind(statusMessage), 'Промокод применён'] },
                    { toast: ['Промокод применён', { level: 'success' }] },
                  ]}
                />
                <Button
                  title="Очистить корзину"
                  onAction={[
                    { set: [bind(cartItems), 0] },
                    { set: [bind(cartSubtotal), 0] },
                    { set: [bind(discount), 0] },
                    { set: [bind(orderStatus), 'Корзина пуста'] },
                  ]}
                />
              </Row>
            </Column>
            <OrderTotals />
          </Row>
          <Button
            title="Оформить заказ"
            modifiers={{ variant: 'primary' }}
            onAction={[{ flowStart: { routeId: 'checkout' } }]}
          />
          <StatusLine />
        </Shell>
      </Route>

      <Route id="orders" title="Заказы">
        <Shell>
          <CustomerCard />
          <Column modifiers={card}>
            <Text modifiers={sectionTitle}>Заказ {use(orderNumber)}</Text>
            <Text>Статус: {use(orderStatus)}</Text>
            <Text>Оплата: {use(paymentMethod)}</Text>
            <Text>Слот доставки: {use(preferredSlot)}</Text>
            <If condition={E<boolean>("flow.orderStatus == 'Передан в доставку'")}>
              <Text modifiers={accent}>Курьер уже получил маршрут.</Text>
            </If>
            <If condition={E<boolean>("flow.orderStatus != 'Передан в доставку'")}>
              <Text modifiers={warning}>Заказ ожидает подтверждения.</Text>
            </If>
          </Column>
          <Row modifiers={{ flexWrap: 'wrap', gap: 10 }}>
            <Button
              title="Передать в доставку"
              modifiers={{ variant: 'primary' }}
              onAction={[
                { set: [bind(orderStatus), 'Передан в доставку'] },
                { set: [bind(statusMessage), 'Статус доставки обновлён'] },
                { toast: ['Статус доставки обновлён'] },
              ]}
            />
            <Button title="Вернуться в каталог" onAction={[{ navigate: ['catalog'] }]} />
          </Row>
          <StatusLine />
        </Shell>
      </Route>

      <FlowRoute id="checkout" title="Оформление заказа" startStep="contacts">
        <Step id="contacts" title="Контакты">
          <Column modifiers={page}>
            <Text modifiers={title}>Контакты покупателя</Text>
            <Text modifiers={muted}>Шаг 1 из 3. Контактные данные и адрес доставки.</Text>
            <Column modifiers={card}>
              <Input binding={bind(customerName)} placeholder="Имя получателя" inputType="text" />
              <Input binding={bind(customerPhone)} placeholder="Телефон" inputType="tel" />
              <Input binding={bind(customerEmail)} placeholder="Email" inputType="email" />
              <Input binding={bind(deliveryCity)} placeholder="Город" inputType="text" />
              <Input binding={bind(deliveryAddress)} placeholder="Адрес" inputType="text" />
              <ErrorLine />
            </Column>
            <Row modifiers={{ flexWrap: 'wrap', gap: 10 }}>
              <Button
                title="Отмена"
                onAction={[{ flowAbort: { reason: 'cancelled' } }, { navigate: ['cart'] }]}
              />
              <Button
                title="Далее"
                modifiers={{ variant: 'primary' }}
                onAction={[
                  {
                    when: {
                      if: 'len(session.customerName) == 0 || len(session.deliveryAddress) == 0',
                      then: [
                        { set: [bind(validationError), 'Укажите имя и адрес доставки.'] },
                        { toast: ['Проверьте контактные данные', { level: 'warning' }] },
                      ],
                      else: [
                        { set: [bind(validationError), ''] },
                        { flowGoTo: { stepId: 'delivery' } },
                      ],
                    },
                  },
                ]}
              />
            </Row>
          </Column>
        </Step>

        <Step id="delivery" title="Доставка и оплата">
          <Column modifiers={page}>
            <Text modifiers={title}>Доставка и оплата</Text>
            <Text modifiers={muted}>Шаг 2 из 3. Выберите удобный слот и способ оплаты.</Text>
            <Column modifiers={card}>
              <Select
                binding={bind(preferredSlot)}
                placeholder="Слот доставки"
                options={[
                  { label: 'Сегодня, 19:00-21:00', value: 'Сегодня, 19:00-21:00' },
                  { label: 'Завтра, 10:00-12:00', value: 'Завтра, 10:00-12:00' },
                  { label: 'Завтра, 18:00-20:00', value: 'Завтра, 18:00-20:00' },
                ]}
              />
              <Select
                binding={bind(paymentMethod)}
                placeholder="Способ оплаты"
                options={[
                  { label: 'Карта онлайн', value: 'Карта онлайн' },
                  { label: 'СБП', value: 'СБП' },
                  { label: 'При получении', value: 'При получении' },
                ]}
              />
              <Checkbox
                binding={bind(marketingConsent)}
                label="Получать персональные предложения"
              />
            </Column>
            <Row modifiers={{ flexWrap: 'wrap', gap: 10 }}>
              <Button title="Назад" onAction={[{ flowGoTo: { stepId: 'contacts' } }]} />
              <Button
                title="Далее"
                modifiers={{ variant: 'primary' }}
                onAction={[{ flowGoTo: { stepId: 'confirm' } }]}
              />
            </Row>
          </Column>
        </Step>

        <Step id="confirm" title="Подтверждение">
          <Column modifiers={page}>
            <Text modifiers={title}>Подтверждение заказа</Text>
            <Text modifiers={muted}>Шаг 3 из 3. Проверьте заказ перед оплатой.</Text>
            <CustomerCard />
            <OrderTotals />
            <Row modifiers={{ flexWrap: 'wrap', gap: 10 }}>
              <Button title="Назад" onAction={[{ flowGoTo: { stepId: 'delivery' } }]} />
              <Button
                title="Подтвердить заказ"
                modifiers={{ variant: 'primary' }}
                onAction={[
                  {
                    batch: [
                      { set: [bind(orderNumber), 'LM-2026-1092'] },
                      { set: [bind(orderStatus), 'Заказ подтверждён'] },
                      { set: [bind(statusMessage), 'Заказ подтверждён и ожидает сборки'] },
                      { toast: ['Заказ оформлен', { level: 'success' }] },
                      { flowComplete: true },
                      { navigate: ['orders'] },
                    ],
                    atomic: true,
                  },
                ]}
              />
            </Row>
          </Column>
        </Step>
      </FlowRoute>
    </Navigation>
  </Contract>
);

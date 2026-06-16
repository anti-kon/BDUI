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

export const selectedCategory = Flow<string>('selectedCategory', 'Домашний офис');
export const sortMode = Flow<string>('sortMode', 'Сначала популярные');
export const featuredProduct = Flow<string>('featuredProduct', 'Кофемашина Barista One');
export const cartItems = Flow<number>('cartItems', 2);
export const cartSubtotal = Flow<number>('cartSubtotal', 29980);
export const deliveryPrice = Flow<number>('deliveryPrice', 0);
export const discount = Flow<number>('discount', 1500);
export const orderNumber = Flow<string>('orderNumber', 'LM-2026-1048');
export const orderStatus = Flow<string>('orderStatus', 'Корзина готова');
export const loyaltyLevel = Flow<string>('loyaltyLevel', 'Plus');
export const promoCode = Flow<string>('promoCode', 'HOME1500');
export const validationError = Flow<string>('validationError', '');
export const statusMessage = Flow<string>('statusMessage', '');

const page = {
  gap: 22,
  margin: '0 auto',
  maxWidth: '1120px',
  padding: '22px 18px 34px',
};

const headerPanel = {
  alignItems: 'center',
  background: '#171717',
  borderRadius: 22,
  color: '#fff7ed',
  gap: 14,
  justifyContent: 'space-between',
  padding: 18,
};

const navButton = {
  background: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  borderRadius: 999,
  color: '#fff7ed',
  minHeight: 40,
  padding: '9px 16px',
};

const primaryButton = {
  background: '#111827',
  border: '1px solid #111827',
  borderRadius: 999,
  color: '#ffffff',
  minHeight: 44,
  padding: '11px 18px',
};

const secondaryButton = {
  background: '#ffffff',
  border: '1px solid #d6d3d1',
  borderRadius: 999,
  color: '#292524',
  minHeight: 44,
  padding: '11px 18px',
};

const heroPanel = {
  background: '#fff7ed',
  border: '1px solid #fed7aa',
  borderRadius: 24,
  boxShadow: '0 18px 50px rgba(120, 53, 15, 0.10)',
  display: 'grid',
  gap: 18,
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  overflow: 'hidden',
  padding: 24,
};

const card = {
  background: '#ffffff',
  border: '1px solid #e7e5e4',
  borderRadius: 18,
  boxShadow: '0 10px 28px rgba(41, 37, 36, 0.07)',
  gap: 12,
  padding: 18,
};

const flatPanel = {
  background: '#ffffff',
  border: '1px solid #e7e5e4',
  borderRadius: 18,
  gap: 12,
  padding: 18,
};

const productGrid = {
  display: 'grid',
  gap: 18,
  gridTemplateColumns: 'repeat(auto-fit, minmax(245px, 1fr))',
};

const productCard = {
  ...card,
  justifyContent: 'space-between',
  minWidth: 0,
  overflow: 'hidden',
  padding: 14,
};

const imageFrame = {
  background: '#f5f5f4',
  border: '1px solid #e7e5e4',
  borderRadius: 16,
  overflow: 'hidden',
};

const title = { color: '#fff7ed', fontSize: 32, fontWeight: 900, lineHeight: 1.05 };
const heroTitle = { color: '#1c1917', fontSize: 30, fontWeight: 900, lineHeight: 1.15 };
const sectionTitle = { color: '#1c1917', fontSize: 20, fontWeight: 850, lineHeight: 1.2 };
const productTitle = { color: '#1c1917', fontSize: 18, fontWeight: 850, lineHeight: 1.25 };
const muted = { color: '#6b7280', lineHeight: 1.45 };
const lightMuted = { color: '#fed7aa', lineHeight: 1.35 };
const accent = { color: '#047857', fontWeight: 850 };
const warning = { color: '#b45309', fontWeight: 850 };
const danger = { color: '#b91c1c', fontWeight: 850 };
const price = { color: '#111827', fontSize: 24, fontWeight: 950 };
const small = { color: '#78716c', fontSize: 13 };
const badge = {
  background: '#ecfdf5',
  border: '1px solid #a7f3d0',
  borderRadius: 999,
  color: '#047857',
  fontSize: 13,
  fontWeight: 850,
  padding: '5px 10px',
};
const warmBadge = {
  background: '#ffedd5',
  border: '1px solid #fed7aa',
  borderRadius: 999,
  color: '#9a3412',
  fontSize: 13,
  fontWeight: 850,
  padding: '5px 10px',
};

const Header = () => (
  <Row modifiers={headerPanel}>
    <Row modifiers={{ alignItems: 'center', flexWrap: 'wrap', gap: 14, minWidth: 0 }}>
      <Image
        src="market-mark.svg"
        alt="Luma Market"
        width={54}
        height={54}
        modifiers={{ background: '#ecfccb', borderRadius: 18, flex: '0 0 auto' }}
      />
      <Column modifiers={{ gap: 5, minWidth: 230 }}>
        <Text modifiers={title}>Luma Market</Text>
        <Text modifiers={lightMuted}>Товары для дома, работы и быстрый checkout.</Text>
      </Column>
    </Row>
    <Row modifiers={{ flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' }}>
      <Button
        title="Витрина"
        modifiers={navButton}
        onAction={[{ navigate: ['storefront', { mode: 'replace' }] }]}
      />
      <Button
        title="Каталог"
        modifiers={navButton}
        onAction={[{ navigate: ['catalog', { mode: 'replace' }] }]}
      />
      <Button
        title="Корзина"
        modifiers={navButton}
        onAction={[{ navigate: ['cart', { mode: 'replace' }] }]}
      />
      <Button
        title="Заказы"
        modifiers={navButton}
        onAction={[{ navigate: ['orders', { mode: 'replace' }] }]}
      />
    </Row>
  </Row>
);

const Shell = ({ children }: { children: unknown }) => (
  <Column modifiers={page}>
    <Header />
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
  <Column modifiers={flatPanel}>
    <Text modifiers={sectionTitle}>Итого</Text>
    <Text>Товары: {use(cartSubtotal)} ₽</Text>
    <Text>Доставка: {use(deliveryPrice)} ₽</Text>
    <Text>Промокод: -{use(discount)} ₽</Text>
    <Divider />
    <Text modifiers={price}>
      К оплате: {E<number>('flow.cartSubtotal + flow.deliveryPrice - flow.discount')} ₽
    </Text>
  </Column>
);

const ProductCard = ({
  name,
  description,
  cost,
  image,
  tag,
  stock,
  actionMessage,
}: {
  name: string;
  description: string;
  cost: string;
  image: string;
  tag: string;
  stock: string;
  actionMessage: string;
}) => (
  <Column modifiers={productCard}>
    <Column modifiers={imageFrame}>
      <Image
        src={image}
        alt={name}
        width="100%"
        height={208}
        fit="cover"
        modifiers={{ display: 'block' }}
      />
    </Column>
    <Row
      modifiers={{
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'space-between',
      }}
    >
      <Text modifiers={badge}>{tag}</Text>
      <Text modifiers={small}>{stock}</Text>
    </Row>
    <Column modifiers={{ gap: 7 }}>
      <Text modifiers={productTitle}>{name}</Text>
      <Text modifiers={muted}>{description}</Text>
    </Column>
    <Row modifiers={{ alignItems: 'center', gap: 10, justifyContent: 'space-between' }}>
      <Text modifiers={price}>{cost}</Text>
    </Row>
    <Button
      title="В корзину"
      modifiers={primaryButton}
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

const ProductGrid = () => (
  <Column modifiers={productGrid}>
    <ProductCard
      name="Кофемашина Barista One"
      description="Компактная рожковая кофемашина для эспрессо и капучино дома."
      cost="23 990 ₽"
      image="products/espresso-machine.png"
      tag="Кухня"
      stock="12 шт."
      actionMessage="Кофемашина добавлена"
    />
    <ProductCard
      name="Кресло ErgoFlex Mesh"
      description="Сетчатая спинка, регулируемые подлокотники и поддержка поясницы."
      cost="18 490 ₽"
      image="products/desk-chair.png"
      tag="Офис"
      stock="7 шт."
      actionMessage="Кресло добавлено"
    />
    <ProductCard
      name="Лампа Beam Desk"
      description="LED-лампа с тёплым и холодным светом для рабочего стола."
      cost="5 990 ₽"
      image="products/desk-lamp.png"
      tag="Свет"
      stock="24 шт."
      actionMessage="Лампа добавлена"
    />
    <ProductCard
      name="Робот-пылесос CleanBot R7"
      description="Лидарная навигация, влажная уборка и уборка по расписанию."
      cost="31 990 ₽"
      image="products/robot-vacuum.png"
      tag="Умный дом"
      stock="5 шт."
      actionMessage="Робот-пылесос добавлен"
    />
    <ProductCard
      name="Увлажнитель AirPure Mini"
      description="Тихая работа, резервуар 4 л и автоматический ночной режим."
      cost="6 490 ₽"
      image="products/air-humidifier.png"
      tag="Климат"
      stock="18 шт."
      actionMessage="Увлажнитель добавлен"
    />
    <ProductCard
      name="Рюкзак CityPack Pro 22"
      description="Отделение для ноутбука 15'', защита от дождя и USB-вывод."
      cost="7 290 ₽"
      image="products/laptop-backpack.png"
      tag="Аксессуары"
      stock="15 шт."
      actionMessage="Рюкзак добавлен"
    />
  </Column>
);

const CustomerCard = () => (
  <Column modifiers={flatPanel}>
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
    <Theme.Simple primary="#111827" background="#f4f7f3" darkBackground="#111827" />
    <Navigation initialRoute="storefront" urlSync>
      <Route id="storefront">
        <Shell>
          <Column modifiers={heroPanel}>
            <Column modifiers={{ gap: 14, justifyContent: 'center' }}>
              <Row modifiers={{ flexWrap: 'wrap', gap: 8 }}>
                <Text modifiers={warmBadge}>Скидка 1 500 ₽ по промокоду HOME1500</Text>
                <Text modifiers={badge}>Уровень клиента: {use(loyaltyLevel)}</Text>
              </Row>
              <Text modifiers={heroTitle}>Магазин товаров для квартиры и рабочего места</Text>
              <Text modifiers={muted}>
                Каталог, корзина, промокод, доставка и оформление заказа собраны в одном BDUI
                контракте. Экран выглядит как коммерческая витрина, а не административная панель.
              </Text>
              <Row modifiers={{ flexWrap: 'wrap', gap: 10 }}>
                <Button
                  title="Открыть каталог"
                  modifiers={primaryButton}
                  onAction={[{ navigate: ['catalog'] }]}
                />
                <Button
                  title="Перейти в корзину"
                  modifiers={secondaryButton}
                  onAction={[{ navigate: ['cart'] }]}
                />
              </Row>
            </Column>
            <Column modifiers={{ ...flatPanel, background: '#ffffffcc' }}>
              <Text modifiers={sectionTitle}>Текущий заказ</Text>
              <Text>Позиций: {use(cartItems)}</Text>
              <Text>Последний товар: {use(featuredProduct)}</Text>
              <Text>Промокод: {use(promoCode)}</Text>
              <Text modifiers={accent}>{use(orderStatus)}</Text>
            </Column>
          </Column>

          <Row
            modifiers={{
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <Column modifiers={{ gap: 4 }}>
              <Text modifiers={sectionTitle}>Популярное сейчас</Text>
              <Text modifiers={muted}>
                Шесть реальных категорий для домашнего офиса и умного дома.
              </Text>
            </Column>
            <Button
              title="Весь каталог"
              modifiers={secondaryButton}
              onAction={[{ navigate: ['catalog'] }]}
            />
          </Row>

          <ProductGrid />
          <StatusLine />
        </Shell>
      </Route>

      <Route id="catalog">
        <Shell>
          <Column modifiers={flatPanel}>
            <Text modifiers={sectionTitle}>Каталог</Text>
            <Row modifiers={{ alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <Column modifiers={{ flex: 1, minWidth: 230 }}>
                <Select
                  binding={bind(selectedCategory)}
                  placeholder="Категория"
                  options={[
                    { label: 'Домашний офис', value: 'Домашний офис' },
                    { label: 'Кухня', value: 'Кухня' },
                    { label: 'Умный дом', value: 'Умный дом' },
                    { label: 'Климат', value: 'Климат' },
                    { label: 'Аксессуары', value: 'Аксессуары' },
                  ]}
                />
              </Column>
              <Column modifiers={{ flex: 1, minWidth: 230 }}>
                <Select
                  binding={bind(sortMode)}
                  placeholder="Сортировка"
                  options={[
                    { label: 'Сначала популярные', value: 'Сначала популярные' },
                    { label: 'Сначала дешевле', value: 'Сначала дешевле' },
                    { label: 'Сначала новинки', value: 'Сначала новинки' },
                  ]}
                />
              </Column>
            </Row>
            <Text modifiers={muted}>
              Сейчас показано: {use(selectedCategory)}, {use(sortMode)}
            </Text>
          </Column>

          <ProductGrid />
          <StatusLine />
        </Shell>
      </Route>

      <Route id="cart">
        <Shell>
          <Row modifiers={{ alignItems: 'stretch', flexWrap: 'wrap', gap: 16 }}>
            <Column modifiers={{ ...flatPanel, flex: 2, minWidth: 280 }}>
              <Text modifiers={sectionTitle}>Корзина</Text>
              <Text>Позиций: {use(cartItems)}</Text>
              <Text>Последний добавленный товар: {use(featuredProduct)}</Text>
              <Text>Статус: {use(orderStatus)}</Text>
              <Input binding={bind(promoCode)} placeholder="Промокод" inputType="text" />
              <Row modifiers={{ flexWrap: 'wrap', gap: 10 }}>
                <Button
                  title="Применить промокод"
                  modifiers={primaryButton}
                  onAction={[
                    { set: [bind(discount), 1500] },
                    { set: [bind(statusMessage), 'Промокод применён'] },
                    { toast: ['Промокод применён', { level: 'success' }] },
                  ]}
                />
                <Button
                  title="Очистить корзину"
                  modifiers={secondaryButton}
                  onAction={[
                    { set: [bind(cartItems), 0] },
                    { set: [bind(cartSubtotal), 0] },
                    { set: [bind(discount), 0] },
                    { set: [bind(orderStatus), 'Корзина пуста'] },
                  ]}
                />
              </Row>
            </Column>
            <Column modifiers={{ flex: 1, minWidth: 260 }}>
              <OrderTotals />
            </Column>
          </Row>
          <Button
            title="Оформить заказ"
            modifiers={primaryButton}
            onAction={[{ flowStart: { routeId: 'checkout' } }]}
          />
          <StatusLine />
        </Shell>
      </Route>

      <Route id="orders">
        <Shell>
          <Row modifiers={{ alignItems: 'stretch', flexWrap: 'wrap', gap: 16 }}>
            <Column modifiers={{ flex: 1, minWidth: 280 }}>
              <CustomerCard />
            </Column>
            <Column modifiers={{ ...flatPanel, flex: 1, minWidth: 280 }}>
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
          </Row>
          <Row modifiers={{ flexWrap: 'wrap', gap: 10 }}>
            <Button
              title="Передать в доставку"
              modifiers={primaryButton}
              onAction={[
                { set: [bind(orderStatus), 'Передан в доставку'] },
                { set: [bind(statusMessage), 'Статус доставки обновлён'] },
                { toast: ['Статус доставки обновлён'] },
              ]}
            />
            <Button
              title="Вернуться в каталог"
              modifiers={secondaryButton}
              onAction={[{ navigate: ['catalog'] }]}
            />
          </Row>
          <StatusLine />
        </Shell>
      </Route>

      <FlowRoute id="checkout" title="Оформление заказа" startStep="contacts">
        <Step id="contacts" title="Контакты">
          <Column modifiers={page}>
            <Column modifiers={flatPanel}>
              <Text modifiers={sectionTitle}>Контактные данные</Text>
              <Text modifiers={muted}>Шаг 1 из 3. Получатель и адрес доставки.</Text>
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
                modifiers={secondaryButton}
                onAction={[{ flowAbort: { reason: 'cancelled' } }, { navigate: ['cart'] }]}
              />
              <Button
                title="Далее"
                modifiers={primaryButton}
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
            <Column modifiers={flatPanel}>
              <Text modifiers={sectionTitle}>Доставка и оплата</Text>
              <Text modifiers={muted}>Шаг 2 из 3. Выберите удобный слот и способ оплаты.</Text>
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
              <Button
                title="Назад"
                modifiers={secondaryButton}
                onAction={[{ flowGoTo: { stepId: 'contacts' } }]}
              />
              <Button
                title="Далее"
                modifiers={primaryButton}
                onAction={[{ flowGoTo: { stepId: 'confirm' } }]}
              />
            </Row>
          </Column>
        </Step>

        <Step id="confirm" title="Подтверждение">
          <Column modifiers={page}>
            <Text modifiers={heroTitle}>Подтверждение заказа</Text>
            <Text modifiers={muted}>Шаг 3 из 3. Проверьте заказ перед оплатой.</Text>
            <Row modifiers={{ alignItems: 'stretch', flexWrap: 'wrap', gap: 16 }}>
              <Column modifiers={{ flex: 1, minWidth: 280 }}>
                <CustomerCard />
              </Column>
              <Column modifiers={{ flex: 1, minWidth: 260 }}>
                <OrderTotals />
              </Column>
            </Row>
            <Row modifiers={{ flexWrap: 'wrap', gap: 10 }}>
              <Button
                title="Назад"
                modifiers={secondaryButton}
                onAction={[{ flowGoTo: { stepId: 'delivery' } }]}
              />
              <Button
                title="Подтвердить заказ"
                modifiers={primaryButton}
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

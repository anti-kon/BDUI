import {
  bind,
  Button,
  Column,
  Divider,
  E,
  If,
  Image,
  Row,
  type StateVar,
  Text,
  use,
} from '@bdui/dsl';

import {
  backpackQty,
  cartItems,
  cartSubtotal,
  chairQty,
  customerEmail,
  customerName,
  customerPhone,
  deliveryAddress,
  deliveryCity,
  deliveryPrice,
  discount,
  espressoQty,
  featuredProduct,
  humidifierQty,
  lampQty,
  orderNumber,
  orderStatus,
  paymentMethod,
  preferredSlot,
  robotQty,
  statusMessage,
  validationError,
} from './state.js';
import {
  accent,
  badge,
  danger,
  flatPanel,
  headerPanel,
  imageFrame,
  lightMuted,
  muted,
  navButton,
  page,
  price,
  primaryButton,
  productCard,
  productGrid,
  productTitle,
  sectionTitle,
  small,
  title,
  warning,
} from './styles.js';

type ProductInfo = {
  readonly name: string;
  readonly description: string;
  readonly cost: string;
  readonly unitPrice: number;
  readonly image: string;
  readonly category: string;
  readonly stock: string;
  readonly actionMessage: string;
  readonly quantity: StateVar<number>;
};

const coffee: ProductInfo = {
  name: 'Кофемашина Barista One',
  description: 'Компактная рожковая кофемашина для эспрессо и капучино дома.',
  cost: '23 990 ₽',
  unitPrice: 23990,
  image: 'products/espresso-machine.png',
  category: 'Кухня',
  stock: '12 шт.',
  actionMessage: 'Кофемашина добавлена',
  quantity: espressoQty,
};

const chair: ProductInfo = {
  name: 'Кресло ErgoFlex Mesh',
  description: 'Сетчатая спинка, регулируемые подлокотники и поддержка поясницы.',
  cost: '18 490 ₽',
  unitPrice: 18490,
  image: 'products/desk-chair.png',
  category: 'Домашний офис',
  stock: '7 шт.',
  actionMessage: 'Кресло добавлено',
  quantity: chairQty,
};

const lamp: ProductInfo = {
  name: 'Лампа Beam Desk',
  description: 'LED-лампа с тёплым и холодным светом для рабочего стола.',
  cost: '5 990 ₽',
  unitPrice: 5990,
  image: 'products/desk-lamp.png',
  category: 'Домашний офис',
  stock: '24 шт.',
  actionMessage: 'Лампа добавлена',
  quantity: lampQty,
};

const robot: ProductInfo = {
  name: 'Робот-пылесос CleanBot R7',
  description: 'Лидарная навигация, влажная уборка и уборка по расписанию.',
  cost: '31 990 ₽',
  unitPrice: 31990,
  image: 'products/robot-vacuum.png',
  category: 'Умный дом',
  stock: '5 шт.',
  actionMessage: 'Робот-пылесос добавлен',
  quantity: robotQty,
};

const humidifier: ProductInfo = {
  name: 'Увлажнитель AirPure Mini',
  description: 'Тихая работа, резервуар 4 л и автоматический ночной режим.',
  cost: '6 490 ₽',
  unitPrice: 6490,
  image: 'products/air-humidifier.png',
  category: 'Климат',
  stock: '18 шт.',
  actionMessage: 'Увлажнитель добавлен',
  quantity: humidifierQty,
};

const backpack: ProductInfo = {
  name: 'Рюкзак CityPack Pro 22',
  description: "Отделение для ноутбука 15'', защита от дождя и USB-вывод.",
  cost: '7 290 ₽',
  unitPrice: 7290,
  image: 'products/laptop-backpack.png',
  category: 'Аксессуары',
  stock: '15 шт.',
  actionMessage: 'Рюкзак добавлен',
  quantity: backpackQty,
};

const Header = () => (
  <Row modifiers={headerPanel}>
    <Row modifiers={{ alignItems: 'center', flexWrap: 'wrap', gap: 14, minWidth: 0 }}>
      <Image
        src="market-mark.png"
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

export const Shell = ({ children }: { children: unknown }) => (
  <Column modifiers={page}>
    <Header />
    {children}
  </Column>
);

export const StatusLine = () => (
  <If condition={E<boolean>('len(flow.statusMessage) > 0')}>
    <Text modifiers={accent}>{use(statusMessage)}</Text>
  </If>
);

export const ErrorLine = () => (
  <If condition={E<boolean>('len(flow.validationError) > 0')}>
    <Text modifiers={danger}>{use(validationError)}</Text>
  </If>
);

export const OrderTotals = () => (
  <Column modifiers={flatPanel}>
    <Text modifiers={sectionTitle}>Итого</Text>
    <Text>Товары: {use(cartSubtotal)} ₽</Text>
    <Text>Доставка: {use(deliveryPrice)} ₽</Text>
    <Text>Промокод: -{use(discount)} ₽</Text>
    <Divider />
    <Text modifiers={price}>
      К оплате: {E<number>('max(0, flow.cartSubtotal + flow.deliveryPrice - flow.discount)')} ₽
    </Text>
  </Column>
);

const ProductCard = ({
  name,
  description,
  cost,
  unitPrice,
  image,
  category,
  stock,
  actionMessage,
  quantity,
}: ProductInfo) => (
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
      <Text modifiers={badge}>{category}</Text>
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
        { inc: [bind(quantity), 1] },
        { inc: [bind(cartItems), 1] },
        { inc: [bind(cartSubtotal), unitPrice] },
        { set: [bind(featuredProduct), name] },
        { set: [bind(orderStatus), 'Товар добавлен в корзину'] },
        { set: [bind(statusMessage), actionMessage] },
        { toast: [actionMessage, { level: 'success' }] },
      ]}
    />
  </Column>
);

const CatalogProductCard = (product: ProductInfo) => (
  <If
    condition={E<boolean>(
      `flow.selectedCategory == 'Все' || flow.selectedCategory == '${product.category}'`,
    )}
  >
    <ProductCard {...product} />
  </If>
);

const CartLine = ({ name, cost, unitPrice, quantity }: ProductInfo) => (
  <If condition={E<boolean>(`flow.${quantity.path} > 0`)}>
    <Row
      modifiers={{
        alignItems: 'center',
        border: '1px solid #e7e5e4',
        borderRadius: 14,
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'space-between',
        padding: '12px 14px',
      }}
    >
      <Column modifiers={{ flex: 1, gap: 4, minWidth: 180 }}>
        <Text modifiers={productTitle}>{name}</Text>
        <Text modifiers={muted}>{cost} за шт.</Text>
      </Column>
      <Text modifiers={badge}>x {use(quantity)}</Text>
      <Text modifiers={price}>{E<number>(`flow.${quantity.path} * ${unitPrice}`)} ₽</Text>
    </Row>
  </If>
);

export const CartLines = () => (
  <Column modifiers={{ gap: 10 }}>
    <If condition={E<boolean>('flow.cartItems == 0')}>
      <Text modifiers={muted}>Корзина пуста. Добавьте товары из каталога.</Text>
    </If>
    <CartLine {...coffee} />
    <CartLine {...chair} />
    <CartLine {...lamp} />
    <CartLine {...robot} />
    <CartLine {...humidifier} />
    <CartLine {...backpack} />
  </Column>
);

export const ProductGrid = () => (
  <Column modifiers={productGrid}>
    <ProductCard {...coffee} />
    <ProductCard {...chair} />
    <ProductCard {...lamp} />
    <ProductCard {...robot} />
    <ProductCard {...humidifier} />
    <ProductCard {...backpack} />
  </Column>
);

const PopularProductGrid = () => (
  <Column modifiers={productGrid}>
    <CatalogProductCard {...coffee} />
    <CatalogProductCard {...chair} />
    <CatalogProductCard {...lamp} />
    <CatalogProductCard {...robot} />
    <CatalogProductCard {...humidifier} />
    <CatalogProductCard {...backpack} />
  </Column>
);

const PriceProductGrid = () => (
  <Column modifiers={productGrid}>
    <CatalogProductCard {...lamp} />
    <CatalogProductCard {...humidifier} />
    <CatalogProductCard {...backpack} />
    <CatalogProductCard {...chair} />
    <CatalogProductCard {...coffee} />
    <CatalogProductCard {...robot} />
  </Column>
);

const NewProductGrid = () => (
  <Column modifiers={productGrid}>
    <CatalogProductCard {...robot} />
    <CatalogProductCard {...backpack} />
    <CatalogProductCard {...humidifier} />
    <CatalogProductCard {...lamp} />
    <CatalogProductCard {...chair} />
    <CatalogProductCard {...coffee} />
  </Column>
);

export const CatalogProductGrid = () => (
  <Column modifiers={{ gap: 18 }}>
    <If condition={E<boolean>("flow.sortMode == 'Сначала популярные'")}>
      <PopularProductGrid />
    </If>
    <If condition={E<boolean>("flow.sortMode == 'Сначала дешевле'")}>
      <PriceProductGrid />
    </If>
    <If condition={E<boolean>("flow.sortMode == 'Сначала новинки'")}>
      <NewProductGrid />
    </If>
  </Column>
);

export const CustomerCard = () => (
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

const StaticOrder = ({
  number,
  status,
  payment,
  slot,
  total,
}: {
  readonly number: string;
  readonly status: string;
  readonly payment: string;
  readonly slot: string;
  readonly total: string;
}) => (
  <Column modifiers={flatPanel}>
    <Text modifiers={sectionTitle}>Заказ {number}</Text>
    <Text>Статус: {status}</Text>
    <Text>Оплата: {payment}</Text>
    <Text>Слот доставки: {slot}</Text>
    <Text modifiers={price}>{total}</Text>
  </Column>
);

export const OrderHistory = () => (
  <Column modifiers={{ gap: 14 }}>
    <Text modifiers={sectionTitle}>История заказов</Text>
    <If condition={E<boolean>("flow.orderStatus != 'Корзина пуста'")}>
      <Column modifiers={flatPanel}>
        <Text modifiers={sectionTitle}>Заказ {use(orderNumber)}</Text>
        <Text>Статус: {use(orderStatus)}</Text>
        <Text>Оплата: {use(paymentMethod)}</Text>
        <Text>Слот доставки: {use(preferredSlot)}</Text>
        <Text modifiers={price}>
          Сумма: {E<number>('max(0, flow.cartSubtotal + flow.deliveryPrice - flow.discount)')} ₽
        </Text>
        <If condition={E<boolean>("flow.orderStatus == 'Передан в доставку'")}>
          <Text modifiers={accent}>Курьер уже получил маршрут.</Text>
        </If>
        <If condition={E<boolean>("flow.orderStatus != 'Передан в доставку'")}>
          <Text modifiers={warning}>Заказ ожидает подтверждения.</Text>
        </If>
      </Column>
    </If>
    <StaticOrder
      number="LM-2026-1048"
      status="Доставлен"
      payment="Карта онлайн"
      slot="Вчера, 19:00-21:00"
      total="29 980 ₽"
    />
    <StaticOrder
      number="LM-2026-1036"
      status="Доставлен"
      payment="СБП"
      slot="12 июня, 10:00-12:00"
      total="7 290 ₽"
    />
    <StaticOrder
      number="LM-2026-1019"
      status="Отменён"
      payment="При получении"
      slot="8 июня, 18:00-20:00"
      total="6 490 ₽"
    />
  </Column>
);

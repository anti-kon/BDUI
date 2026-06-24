import {
  bind,
  Button,
  Checkbox,
  Column,
  Contract,
  E,
  FlowRoute,
  If,
  Input,
  Navigation,
  Route,
  Row,
  Select,
  Step,
  Text,
  ThemeConfig as Theme,
  use,
} from '@bdui/dsl';

import {
  CartLines,
  CatalogProductGrid,
  CustomerCard,
  ErrorLine,
  OrderHistory,
  OrderTotals,
  ProductGrid,
  Shell,
  StatusLine,
} from './components.js';
import meta from './meta.json';
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
  discount,
  espressoQty,
  featuredProduct,
  humidifierQty,
  lampQty,
  loyaltyLevel,
  marketingConsent,
  orderNumber,
  orderStatus,
  paymentMethod,
  preferredSlot,
  promoCode,
  robotQty,
  selectedCategory,
  sortMode,
  statusMessage,
  validationError,
} from './state.js';
import {
  accent,
  badge,
  flatPanel,
  heroPanel,
  heroTitle,
  muted,
  page,
  primaryButton,
  secondaryButton,
  sectionTitle,
  warmBadge,
} from './styles.js';

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
                    { label: 'Все товары', value: 'Все' },
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

          <CatalogProductGrid />
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
              <CartLines />
              <Input binding={bind(promoCode)} placeholder="Промокод" inputType="text" />
              <Row modifiers={{ flexWrap: 'wrap', gap: 10 }}>
                <Button
                  title="Применить промокод"
                  modifiers={primaryButton}
                  onAction={[
                    {
                      when: {
                        if: 'flow.cartSubtotal <= 0',
                        then: [
                          { set: [bind(discount), 0] },
                          {
                            set: [bind(statusMessage), 'Добавьте товары, чтобы применить промокод'],
                          },
                          {
                            toast: [
                              'Добавьте товары, чтобы применить промокод',
                              { level: 'warning' },
                            ],
                          },
                        ],
                        else: [
                          {
                            when: {
                              if: 'flow.cartSubtotal <= 1500',
                              then: [
                                { set: [bind(discount), E<number>('flow.cartSubtotal')] },
                                { set: [bind(statusMessage), 'Промокод применён'] },
                                { toast: ['Промокод применён', { level: 'success' }] },
                              ],
                              else: [
                                { set: [bind(discount), 1500] },
                                { set: [bind(statusMessage), 'Промокод применён'] },
                                { toast: ['Промокод применён', { level: 'success' }] },
                              ],
                            },
                          },
                        ],
                      },
                    },
                  ]}
                />
                <Button
                  title="Очистить корзину"
                  modifiers={secondaryButton}
                  onAction={[
                    { set: [bind(cartItems), 0] },
                    { set: [bind(cartSubtotal), 0] },
                    { set: [bind(discount), 0] },
                    { set: [bind(espressoQty), 0] },
                    { set: [bind(chairQty), 0] },
                    { set: [bind(lampQty), 0] },
                    { set: [bind(robotQty), 0] },
                    { set: [bind(humidifierQty), 0] },
                    { set: [bind(backpackQty), 0] },
                    { set: [bind(featuredProduct), 'Нет'] },
                    { set: [bind(orderStatus), 'Корзина пуста'] },
                    { set: [bind(statusMessage), 'Корзина очищена'] },
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
            onAction={[
              {
                when: {
                  if: 'flow.cartItems <= 0',
                  then: [
                    { set: [bind(statusMessage), 'Добавьте товары перед оформлением заказа'] },
                    {
                      toast: ['Добавьте товары перед оформлением заказа', { level: 'warning' }],
                    },
                  ],
                  else: [{ flowStart: { routeId: 'checkout' } }],
                },
              },
            ]}
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
            <Column modifiers={{ flex: 2, minWidth: 280 }}>
              <OrderHistory />
            </Column>
          </Row>
          <Row modifiers={{ flexWrap: 'wrap', gap: 10 }}>
            <If condition={E<boolean>("flow.orderStatus != 'Корзина пуста'")}>
              <Button
                title="Передать в доставку"
                modifiers={primaryButton}
                onAction={[
                  { set: [bind(orderStatus), 'Передан в доставку'] },
                  { set: [bind(statusMessage), 'Статус доставки обновлён'] },
                  { toast: ['Статус доставки обновлён'] },
                ]}
              />
            </If>
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

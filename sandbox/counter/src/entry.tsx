import { Column, Contract, Navigation, Route, Text, ThemeConfig as Theme } from '@bdui/dsl';
import { Flow, use } from '@bdui/dsl';

import { CounterControls } from './CounterControls';
import meta from './meta.json';

export const counter = Flow<number>('counter', 0);

export default (
  <Contract meta={meta}>
    <Theme.Simple primary="#4F46E5" background="#FFFFFF" darkBackground="#111111" />
    <Navigation initialRoute="home" urlSync>
      <Route id="home" title="Home">
        <Column modifiers={{ gap: 16, padding: 24 }}>
          <Text>{use(counter)}</Text>
          <CounterControls />
        </Column>
      </Route>
    </Navigation>
  </Contract>
);

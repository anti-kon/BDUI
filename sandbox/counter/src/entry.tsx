import { Contract, ThemeConfig as Theme, Navigation, Route, Column, Text, E } from '@bdui/dsl';
import meta from './meta.json';
import { CounterControls } from './CounterControls';

export default (
  <Contract meta={meta}>
    <Theme.Simple primary="#4F46E5" background="#FFFFFF" darkBackground="#111111" />
    <Navigation initialRoute="home" urlSync>
      <Route id="home" title="Home">
        <Column modifiers={{ gap: 16, padding: 24 }}>
          <Text>{E('flow.counter ?? 0')}</Text>
          <CounterControls />
        </Column>
      </Route>
    </Navigation>
  </Contract>
);

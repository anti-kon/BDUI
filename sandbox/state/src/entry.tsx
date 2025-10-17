import { Column, Contract, Navigation, Route, Text, ThemeConfig as Theme } from '@bdui/dsl';
import { Flow, Local, Session, use } from '@bdui/dsl';

import meta from './meta.json';
import { CounterControls } from './parts/CounterControls';
import { LocalControls } from './parts/LocalControls';
import { SessionControls } from './parts/SessionControls';
import { UserControls } from './parts/UserControls';

export const counter = Flow<number>('counter', 1);
export const username = Flow<string>('username', 'Guest');
export const visits = Session<number>('visits', 0);
export const localToggle = Local<boolean>('toggle');

export default (
  <Contract meta={meta}>
    <Theme.Simple primary="#2563eb" background="#ffffff" darkBackground="#0b1220" />
    <Navigation initialRoute="home" urlSync>
      <Route id="home" title="State Demo">
        <Column modifiers={{ gap: 16, padding: 24 }}>
          <Text>Counter: {use(counter)}</Text>
          <Text>User: {use(username)}</Text>
          <Text>Session visits: {use(visits)}</Text>
          <Text>Local toggle: {use(localToggle)}</Text>

          <CounterControls />
          <UserControls />
          <SessionControls />
          <LocalControls />
        </Column>
      </Route>
    </Navigation>
  </Contract>
);

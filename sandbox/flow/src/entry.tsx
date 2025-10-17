import {
  Button,
  Column,
  Contract,
  FlowRoute,
  Navigation,
  Row,
  Step,
  Text,
  ThemeConfig as Theme,
} from '@bdui/dsl';
import { Flow, use } from '@bdui/dsl';

import meta from './meta.json';

export const counter = Flow<number>('counter', 0);
export const name = Flow<string>('name', 'Guest');

export default (
  <Contract meta={meta}>
    <Theme.Simple primary="#10b981" background="#ffffff" darkBackground="#101418" />
    <Navigation initialRoute="onboarding" urlSync>
      <FlowRoute
        id="onboarding"
        title="Onboarding"
        startStep="s1"
        persistence={{ enabled: true, key: 'onboarding' }}
      >
        <Step id="s1" title="Welcome">
          <Column modifiers={{ gap: 12, padding: 24 }}>
            <Text>Welcome, {use(name)}!</Text>
            <Text>Increase counter to 3 to continue.</Text>
            <Row modifiers={{ gap: 8 }}>
              <Button title="+1" onAction={[{ update: [counter, (p: number) => (p ?? 0) + 1] }]} />
              <Button title="Reset" onAction={[{ setVar: [counter, 0] }]} />
            </Row>
            <Text>Current: {use(counter)}</Text>
          </Column>
        </Step>

        <Step id="s2" title="Done" onEnter={[{ toast: ['Yay! You reached 3+ 🎉'] }]}>
          <Column modifiers={{ gap: 12, padding: 24 }}>
            <Text>All set, {use(name)}.</Text>
            <Text>Counter: {use(counter)}</Text>
          </Column>
        </Step>
      </FlowRoute>
    </Navigation>
  </Contract>
);

import { Button, Row } from '@bdui/dsl';

import { counter } from '../entry';

export const CounterControls = () => (
  <Row modifiers={{ gap: 8 }}>
    <Button title="+1" onAction={[{ update: [counter, (prev: number) => (prev ?? 0) + 1] }]} />
    <Button title="-1" onAction={[{ update: [counter, (prev: number) => (prev ?? 0) - 1] }]} />
    <Button title="Reset" onAction={[{ setVar: [counter, 0] }]} />
  </Row>
);

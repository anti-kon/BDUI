import { Button, Row } from '@bdui/dsl';

import { counter } from './entry';

export const CounterControls = () => (
  <Row modifiers={{ gap: 8 }}>
    <Button
      title="+1"
      onAction={[{ update: [counter, (prev: number) => (prev ?? 0) + 1] }]}
      modifiers={{ variant: 'primary', size: 'md' }}
    />
    <Button
      title="-1"
      onAction={[{ update: [counter, (prev: number) => (prev ?? 0) - 1] }]}
      modifiers={{ variant: 'secondary', size: 'md' }}
    />
  </Row>
);

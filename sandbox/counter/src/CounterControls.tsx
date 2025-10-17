import { Button, E, Row } from '@bdui/dsl';

export const CounterControls = () => (
  <Row modifiers={{ gap: 8 }}>
    <Button
      title="+1"
      onAction={[{ set: ['flow.counter', E('(flow.counter ?? 0) + 1')] }]}
      modifiers={{ variant: 'primary', size: 'md' }}
    />
    <Button
      title="-1"
      onAction={[{ set: ['flow.counter', E('(flow.counter ?? 0) - 1')] }]}
      modifiers={{ variant: 'secondary', size: 'md' }}
    />
  </Row>
);

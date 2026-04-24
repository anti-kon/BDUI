import { Button, Row } from '@bdui/dsl';
import { bind } from '@bdui/dsl';

import { counter } from './entry';

export const CounterControls = () => (
  <Row modifiers={{ gap: 8 }}>
    <Button
      title="+1"
      onAction={[{ inc: bind(counter) }]}
      modifiers={{ variant: 'primary', size: 'md' }}
    />
    <Button
      title="-1"
      onAction={[{ dec: bind(counter) }]}
      modifiers={{ variant: 'secondary', size: 'md' }}
    />
    <Button title="Reset" onAction={[{ set: [bind(counter), 0] }]} />
  </Row>
);

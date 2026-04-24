import { Button, Row } from '@bdui/dsl';
import { bind } from '@bdui/dsl';

import { visits } from '../entry';

export const SessionControls = () => (
  <Row modifiers={{ gap: 8 }}>
    <Button title="Session visits +1" onAction={[{ inc: bind(visits) }]} />
    <Button title="Reset visits" onAction={[{ set: [bind(visits), 0] }]} />
  </Row>
);

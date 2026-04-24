import { Button, Row } from '@bdui/dsl';
import { bind } from '@bdui/dsl';

import { localToggle } from '../entry';

export const LocalControls = () => (
  <Row modifiers={{ gap: 8 }}>
    <Button title="Toggle local" onAction={[{ toggle: bind(localToggle) }]} />
    <Button title="Set local: true" onAction={[{ set: [bind(localToggle), true] }]} />
    <Button title="Set local: false" onAction={[{ set: [bind(localToggle), false] }]} />
  </Row>
);

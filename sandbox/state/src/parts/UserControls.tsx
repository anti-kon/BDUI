import { Button, Row } from '@bdui/dsl';
import { bind } from '@bdui/dsl';

import { username } from '../entry';

export const UserControls = () => (
  <Row modifiers={{ gap: 8 }}>
    <Button title="Set user: Alice" onAction={[{ set: [bind(username), 'Alice'] }]} />
    <Button title="Set user: Bob" onAction={[{ set: [bind(username), 'Bob'] }]} />
  </Row>
);

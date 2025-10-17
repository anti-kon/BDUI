import { Button, Row } from '@bdui/dsl';

import { username } from '../entry';

export const UserControls = () => (
  <Row modifiers={{ gap: 8 }}>
    <Button title="Set user: Alice" onAction={[{ setVar: [username, 'Alice'] }]} />
    <Button title="Set user: Bob" onAction={[{ setVar: [username, 'Bob'] }]} />
  </Row>
);

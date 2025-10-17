import { Button, Row } from '@bdui/dsl';

import { localToggle } from '../entry';

export const LocalControls = () => (
  <Row modifiers={{ gap: 8 }}>
    <Button title="Toggle local" onAction={[{ update: [localToggle, (prev: boolean) => !prev] }]} />
    <Button title="Set local: true" onAction={[{ setVar: [localToggle, true] }]} />
    <Button title="Set local: false" onAction={[{ setVar: [localToggle, false] }]} />
  </Row>
);

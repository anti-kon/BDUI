import { Button, Row } from '@bdui/dsl';

import { visits } from '../entry';

export const SessionControls = () => (
  <Row modifiers={{ gap: 8 }}>
    <Button
      title="Session visits +1"
      onAction={[{ update: [visits, (prev: number) => (prev ?? 0) + 1] }]}
    />
    <Button title="Reset visits" onAction={[{ setVar: [visits, 0] }]} />
  </Row>
);

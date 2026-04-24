import { Column, Contract, Navigation, Route, Text } from '@bdui/dsl';

export default (
  <Contract
    meta={{
      contractId: 'com.example.mini',
      version: '1.0.0',
      schemaVersion: '1.0.0',
    }}
  >
    <Navigation initialRoute="home">
      <Route id="home">
        <Column>
          <Text>Hello BDUI</Text>
        </Column>
      </Route>
    </Navigation>
  </Contract>
);

import {
  Button,
  Checkbox,
  Column,
  Contract,
  Divider,
  If,
  Input,
  Navigation,
  Route,
  Row,
  Select,
  Text,
  ThemeConfig as Theme,
} from '@bdui/dsl';
import { bind, E, Flow, Session, use } from '@bdui/dsl';

import meta from './meta.json';

/* State declarations */
export const firstName = Flow<string>('firstName', '');
export const agreeToTerms = Flow<boolean>('agreeToTerms', false);
export const planId = Flow<string>('planId', 'free');
export const lastSaved = Session<string>('lastSaved', '');
export const errors = Flow<string>('errors', '');

export default (
  <Contract meta={meta}>
    <Theme.Simple primary="#4f46e5" background="#ffffff" darkBackground="#0b1220" />
    <Navigation initialRoute="signup" urlSync>
      <Route id="signup" title="Sign up">
        <Column modifiers={{ gap: 16, padding: 24 }}>
          <Text>Welcome, {use(firstName)}! Finish your profile to continue.</Text>

          <Input binding={bind(firstName)} placeholder="Your first name" inputType="text" />

          <Select
            binding={bind(planId)}
            placeholder="Select a plan"
            options={[
              { value: 'free', label: 'Free' },
              { value: 'pro', label: 'Pro' },
              { value: 'team', label: 'Team' },
            ]}
          />

          <Checkbox binding={bind(agreeToTerms)} label="I agree to the terms" />

          <Divider />

          <If condition={E<boolean>('flow.errors != null && len(flow.errors) > 0')}>
            <Text>Error: {use(errors)}</Text>
          </If>

          <Row modifiers={{ gap: 12 }}>
            <Button
              title="Save profile"
              modifiers={{ variant: 'primary' }}
              onAction={[
                {
                  when: {
                    if: 'flow.agreeToTerms == false',
                    then: [{ toast: ['Please accept the terms first'] }],
                    else: [
                      {
                        batch: [
                          { set: [bind(errors), ''] },
                          {
                            call: {
                              url: 'https://httpbin.org/post',
                              method: 'POST',
                              headers: { 'content-type': 'application/json' },
                              body: {
                                firstName: '{{flow.firstName}}',
                                plan: '{{flow.planId}}',
                              },
                              saveTo: bind(lastSaved),
                              rollback: { set: [bind(errors), 'Save failed; changes reverted'] },
                            },
                          },
                          { toast: ['Profile saved'] },
                        ],
                        atomic: true,
                      },
                    ],
                  },
                },
              ]}
            />
            <Button
              title="Reset"
              onAction={[
                { set: [bind(firstName), ''] },
                { set: [bind(planId), 'free'] },
                { set: [bind(agreeToTerms), false] },
              ]}
            />
          </Row>

          <If condition={E<boolean>('session.lastSaved != null && len(session.lastSaved) > 0')}>
            <Text>Last saved: {use(lastSaved)}</Text>
          </If>
        </Column>
      </Route>
    </Navigation>
  </Contract>
);

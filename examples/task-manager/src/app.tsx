import {
  Button,
  Checkbox,
  Column,
  Contract,
  Divider,
  FlowRoute,
  If,
  Input,
  Navigation,
  Route,
  Row,
  Select,
  Step,
  Text,
  ThemeConfig as Theme,
} from '@bdui/dsl';
import { bind, E, Flow, Session, use } from '@bdui/dsl';

import meta from './meta.json';

/* ----------------------------- State ----------------------------- */
/* Flow scope — profile-wide, survives across routes within the app. */
export const userName = Flow<string>('userName', '');
export const userEmail = Flow<string>('userEmail', '');
export const loginError = Flow<string>('loginError', '');

/* Task "draft" — what the user is typing now. */
export const draftTask = Flow<string>('draftTask', '');
/* Latest committed task (single slot, to keep the demo contract static). */
export const lastTask = Flow<string>('lastTask', '');
export const taskDone = Flow<boolean>('taskDone', false);
export const taskCount = Flow<number>('taskCount', 0);

/* Settings — persisted in session scope. */
export const themeMode = Session<string>('themeMode', 'auto');
export const notifications = Session<boolean>('notifications', true);
export const settingsSaved = Session<string>('settingsSaved', '');
export const saveError = Flow<string>('saveError', '');

/* --------------------------- Server API -------------------------- */
const apiBase = '/api';

const profileCall = {
  call: {
    url: `${apiBase}/profile`,
    method: 'POST' as const,
    headers: { 'content-type': 'application/json' },
    body: {
      name: '{{flow.userName}}',
      email: '{{flow.userEmail}}',
    },
    rollback: { set: [bind(loginError), 'Could not save profile, please retry'] },
  },
};

const taskCall = {
  call: {
    url: `${apiBase}/task`,
    method: 'POST' as const,
    headers: { 'content-type': 'application/json' },
    body: { title: '{{flow.draftTask}}' },
    saveTo: bind(lastTask),
    rollback: { set: [bind(saveError), 'Could not save task'] },
  },
};

const settingsCall = {
  call: {
    url: `${apiBase}/settings`,
    method: 'POST' as const,
    headers: { 'content-type': 'application/json' },
    body: {
      theme: '{{session.themeMode}}',
      notifications: '{{session.notifications}}',
    },
    saveTo: bind(settingsSaved),
    rollback: { set: [bind(saveError), 'Settings could not be saved'] },
  },
};

/* --------------------------- Shared UI --------------------------- */
const NavBar = () => (
  <Row modifiers={{ gap: 12, padding: 12 }}>
    <Button title="Dashboard" onAction={[{ navigate: ['dashboard'] }]} />
    <Button title="Settings" onAction={[{ navigate: ['settings'] }]} />
    <Button
      title="Sign out"
      modifiers={{ variant: 'secondary' }}
      onAction={[
        { set: [bind(userName), ''] },
        { set: [bind(userEmail), ''] },
        { set: [bind(lastTask), ''] },
        { navigate: ['login'] },
      ]}
    />
  </Row>
);

/* ---------------------------- Contract --------------------------- */
export default (
  <Contract meta={meta}>
    <Theme.Simple primary="#4f46e5" background="#f8fafc" darkBackground="#0b1220" />
    <Navigation initialRoute="login" urlSync>
      {/* --------------------------- LOGIN -------------------------- */}
      <Route id="login" title="Sign in">
        <Column modifiers={{ gap: 16, padding: 24 }}>
          <Text>Welcome to Taskly</Text>

          <If condition={E<boolean>('len(flow.userName) > 0 && len(flow.userEmail) > 0')}>
            <Column modifiers={{ gap: 12 }}>
              <Text>You are already signed in as {use(userName)}.</Text>
              <Row modifiers={{ gap: 12 }}>
                <Button
                  title="Continue to dashboard"
                  modifiers={{ variant: 'primary' }}
                  onAction={[{ navigate: ['dashboard'] }]}
                />
                <Button
                  title="Use another account"
                  modifiers={{ variant: 'secondary' }}
                  onAction={[{ set: [bind(userName), ''] }, { set: [bind(userEmail), ''] }]}
                />
              </Row>
            </Column>
          </If>

          <If condition={E<boolean>('len(flow.userName) == 0 || len(flow.userEmail) == 0')}>
            <Column modifiers={{ gap: 12 }}>
              <Text>Enter your details to continue.</Text>
              <Input binding={bind(userName)} placeholder="Full name" inputType="text" />
              <Input binding={bind(userEmail)} placeholder="Email" inputType="email" />

              <If condition={E<boolean>('len(flow.loginError) > 0')}>
                <Text>{use(loginError)}</Text>
              </If>

              <Row modifiers={{ gap: 12 }}>
                <Button
                  title="Continue"
                  modifiers={{ variant: 'primary' }}
                  onAction={[
                    {
                      when: {
                        if: 'len(flow.userName) == 0 || len(flow.userEmail) == 0',
                        then: [{ set: [bind(loginError), 'Name and email are required'] }],
                        else: [{ set: [bind(loginError), ''] }, { navigate: ['onboarding'] }],
                      },
                    },
                  ]}
                />
              </Row>
            </Column>
          </If>
        </Column>
      </Route>

      {/* ------------------------- ONBOARDING ----------------------- */}
      <FlowRoute
        id="onboarding"
        title="Get started"
        startStep="greet"
        persistence={{ mode: 'session' }}
      >
        <Step id="greet" title="Hi!">
          <Column modifiers={{ gap: 12, padding: 24 }}>
            <Text>Hello, {use(userName)}!</Text>
            <Text>
              Taskly helps you capture a single most-important task for the day. Tap next to
              continue.
            </Text>
            <Row modifiers={{ gap: 12 }}>
              <Button
                title="Next"
                modifiers={{ variant: 'primary' }}
                onAction={[{ flowGoTo: { stepId: 'features' } }]}
              />
            </Row>
          </Column>
        </Step>

        <Step id="features" title="How it works">
          <Column modifiers={{ gap: 12, padding: 24 }}>
            <Text>Write your daily task. Check it off when done. Breathe.</Text>
            <Row modifiers={{ gap: 12 }}>
              <Button
                title="Back"
                modifiers={{ variant: 'secondary' }}
                onAction={[{ flowGoTo: { stepId: 'greet' } }]}
              />
              <Button
                title="Next"
                modifiers={{ variant: 'primary' }}
                onAction={[{ flowGoTo: { stepId: 'save' } }]}
              />
            </Row>
          </Column>
        </Step>

        <Step id="save" title="Almost there" onEnter={[{ toast: ['Saving your profile…'] }]}>
          <Column modifiers={{ gap: 12, padding: 24 }}>
            <Text>We are saving your profile to the server.</Text>
            <Row modifiers={{ gap: 12 }}>
              <Button
                title="Finish"
                modifiers={{ variant: 'primary' }}
                onAction={[
                  {
                    batch: [profileCall, { flowComplete: true }, { navigate: ['dashboard'] }],
                    atomic: true,
                  },
                ]}
              />
              <Button
                title="Cancel"
                modifiers={{ variant: 'secondary' }}
                onAction={[{ flowAbort: { reason: 'user-cancelled' } }, { navigate: ['login'] }]}
              />
            </Row>
          </Column>
        </Step>
      </FlowRoute>

      {/* -------------------------- DASHBOARD ----------------------- */}
      <Route id="dashboard" title="Dashboard">
        <Column modifiers={{ gap: 16, padding: 24 }}>
          <Text>Welcome back, {use(userName)}!</Text>
          <Text>You have saved {use(taskCount)} tasks so far.</Text>

          <NavBar />
          <Divider />

          <Text>Today&apos;s task</Text>
          <Input binding={bind(draftTask)} placeholder="What will you do today?" />

          <If condition={E<boolean>('len(flow.saveError) > 0')}>
            <Text>{use(saveError)}</Text>
          </If>

          <Row modifiers={{ gap: 12 }}>
            <Button
              title="Save task"
              modifiers={{ variant: 'primary' }}
              onAction={[
                {
                  when: {
                    if: 'len(flow.draftTask) == 0',
                    then: [{ toast: ['Please enter a task first', { level: 'warning' }] }],
                    else: [
                      {
                        batch: [
                          { set: [bind(saveError), ''] },
                          taskCall,
                          { set: [bind(draftTask), ''] },
                          { set: [bind(taskDone), false] },
                          { inc: bind(taskCount) },
                          { toast: ['Task saved', { level: 'success' }] },
                        ],
                        atomic: true,
                      },
                    ],
                  },
                },
              ]}
            />
          </Row>

          <If condition={E<boolean>('len(flow.lastTask) > 0')}>
            <Column modifiers={{ gap: 8 }}>
              <Divider />
              <Text>Last saved task</Text>
              <Row modifiers={{ gap: 12 }}>
                <Checkbox binding={bind(taskDone)} label={use(lastTask)} />
                <Button
                  title="Delete"
                  modifiers={{ variant: 'secondary' }}
                  onAction={[
                    { set: [bind(lastTask), ''] },
                    { set: [bind(taskDone), false] },
                    { toast: ['Task deleted'] },
                  ]}
                />
              </Row>
            </Column>
          </If>
        </Column>
      </Route>

      {/* --------------------------- SETTINGS ----------------------- */}
      <Route id="settings" title="Settings">
        <Column modifiers={{ gap: 16, padding: 24 }}>
          <Text>Settings</Text>
          <NavBar />
          <Divider />

          <Select
            binding={bind(themeMode)}
            placeholder="Theme"
            options={[
              { value: 'auto', label: 'Follow system' },
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
          />

          <Checkbox binding={bind(notifications)} label="Enable push notifications" />

          <If condition={E<boolean>('len(flow.saveError) > 0')}>
            <Text>{use(saveError)}</Text>
          </If>

          <Row modifiers={{ gap: 12 }}>
            <Button
              title="Save settings"
              modifiers={{ variant: 'primary' }}
              onAction={[
                {
                  batch: [
                    { set: [bind(saveError), ''] },
                    settingsCall,
                    { toast: ['Settings saved', { level: 'success' }] },
                  ],
                  atomic: true,
                },
              ]}
            />
          </Row>

          <If condition={E<boolean>('len(session.settingsSaved) > 0')}>
            <Text>Last saved at: {use(settingsSaved)}</Text>
          </If>
        </Column>
      </Route>
    </Navigation>
  </Contract>
);

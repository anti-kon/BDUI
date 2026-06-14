import type { DataSource } from '@bdui/core';
import type { ShortAction } from '@bdui/dsl';
import {
  Button,
  Checkbox,
  Column,
  Contract,
  Divider,
  FlowRoute,
  If,
  Image,
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

const apiBase = '/api';

const dataSources: readonly DataSource[] = [
  {
    id: 'workspaceSnapshot',
    kind: 'rest',
    url: `${apiBase}/workspace?plan={{session.plan}}`,
    method: 'GET',
    headers: { accept: 'application/json' },
  },
  {
    id: 'starterCatalog',
    kind: 'static',
    value: {
      templateName: 'Launch readiness template',
      sections: 7,
      guardrails: 'Data, Legal, Brand, Rollback',
      defaultOwner: 'Operations',
    },
  },
];

/* ----------------------------- State ----------------------------- */
export const userName = Session<string>('userName', 'Maya Chen');
export const userEmail = Session<string>('userEmail', 'maya.chen@example.com');
export const workspaceName = Session<string>('workspaceName', 'Northstar Ops');
export const plan = Session<string>('plan', 'scale');
export const themeMode = Session<string>('themeMode', 'system');
export const notifications = Session<boolean>('notifications', true);
export const compactMode = Session<boolean>('compactMode', false);
export const settingsSaved = Session<string>('settingsSaved', 'Not synced yet');

export const contractCacheSource = Flow<string>('contractCacheSource', 'network');
export const statusMessage = Flow<string>('statusMessage', '');
export const saveError = Flow<string>('saveError', '');
export const activeView = Flow<string>('activeView', 'Command center');

export const workspaceSnapshot = Flow<Record<string, unknown>>('workspaceSnapshot', {
  health: 'Not loaded',
  utilization: 0,
  risk: 'Unknown',
  revenue: '$0',
  sla: 'No data',
  nextReview: 'No review scheduled',
  updatedAt: 'never',
  activeProjects: 0,
  blockerCount: 0,
});

export const starterCatalog = Flow<Record<string, unknown>>('starterCatalog', {
  templateName: 'Not loaded',
  sections: 0,
  guardrails: 'Load the catalog to preview guardrails',
  defaultOwner: 'None',
});

export const draftTask = Flow<string>('draftTask', '');
export const lastTask = Flow<string>('lastTask', 'Review launch readiness dashboard');
export const taskDone = Flow<boolean>('taskDone', false);
export const taskCount = Flow<number>('taskCount', 4);

export const requestType = Flow<string>('requestType', 'Launch review');
export const requestPriority = Flow<string>('requestPriority', 'High');
export const requestSummary = Flow<string>('requestSummary', '');
export const requestImpact = Flow<string>('requestImpact', '');
export const requestBudget = Flow<number>('requestBudget', 25000);
export const requestNeedsDesign = Flow<boolean>('requestNeedsDesign', true);
export const requestNeedsLegal = Flow<boolean>('requestNeedsLegal', false);
export const requestTicket = Flow<Record<string, unknown>>('requestTicket', {
  id: 'Not submitted',
  owner: 'Unassigned',
  eta: 'Pending',
});
export const requestStatus = Flow<string>('requestStatus', 'Draft');
export const requestValidationNote = Flow<string>('requestValidationNote', '');

/* --------------------------- Actions ----------------------------- */
const refreshWorkspace = [
  { fetch: { sourceId: 'workspaceSnapshot', saveTo: bind(workspaceSnapshot) } },
  { set: [bind(statusMessage), 'Workspace snapshot refreshed from a BDUI data source'] },
  { toast: ['Workspace snapshot refreshed', { level: 'success' as const }] },
] satisfies readonly ShortAction[];

const loadStarterCatalog = [
  { fetch: { sourceId: 'starterCatalog', saveTo: bind(starterCatalog) } },
  { set: [bind(statusMessage), 'Static data source loaded into flow state'] },
  { toast: ['Starter catalog loaded', { level: 'success' as const }] },
] satisfies readonly ShortAction[];

const profileCall = {
  call: {
    url: `${apiBase}/profile`,
    method: 'POST' as const,
    headers: { 'content-type': 'application/json' },
    body: {
      name: '{{session.userName}}',
      email: '{{session.userEmail}}',
      workspace: '{{session.workspaceName}}',
      plan: '{{session.plan}}',
    },
    saveTo: bind(settingsSaved),
    rollback: { set: [bind(saveError), 'Profile could not be synced'] },
  },
} satisfies ShortAction;

const taskCall = {
  call: {
    url: `${apiBase}/task`,
    method: 'POST' as const,
    headers: { 'content-type': 'application/json' },
    body: { title: '{{flow.draftTask}}', workspace: '{{session.workspaceName}}' },
    saveTo: bind(lastTask),
    rollback: { set: [bind(saveError), 'Task could not be saved'] },
  },
} satisfies ShortAction;

const settingsCall = {
  call: {
    url: `${apiBase}/settings`,
    method: 'POST' as const,
    headers: { 'content-type': 'application/json' },
    body: {
      theme: '{{session.themeMode}}',
      notifications: '{{session.notifications}}',
      compact: '{{session.compactMode}}',
      plan: '{{session.plan}}',
    },
    saveTo: bind(settingsSaved),
    rollback: { set: [bind(saveError), 'Settings could not be synced'] },
  },
} satisfies ShortAction;

const requestCall = {
  call: {
    url: `${apiBase}/request`,
    method: 'POST' as const,
    headers: { 'content-type': 'application/json' },
    body: {
      type: '{{flow.requestType}}',
      priority: '{{flow.requestPriority}}',
      summary: '{{flow.requestSummary}}',
      impact: '{{flow.requestImpact}}',
      budget: '{{flow.requestBudget}}',
      design: '{{flow.requestNeedsDesign}}',
      legal: '{{flow.requestNeedsLegal}}',
    },
    saveTo: bind(requestTicket),
    rollback: { set: [bind(saveError), 'Request could not be submitted'] },
  },
} satisfies ShortAction;

/* ---------------------------- Styles ----------------------------- */
const page = {
  minHeight: '100vh',
  background: '#f3f6fb',
  color: '#152033',
  padding: '24px',
  gap: 20,
};

const shell = {
  maxWidth: '1180px',
  width: '100%',
  margin: '0 auto',
  gap: 20,
};

const topBar = {
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  padding: '14px 16px',
  background: '#ffffff',
  border: '1px solid #d8e0ea',
  borderRadius: 8,
  boxShadow: '0 10px 30px rgba(19, 32, 51, 0.06)',
};

const brandMark = {
  width: 42,
  height: 42,
  borderRadius: 8,
  border: '1px solid #d8e0ea',
  background: '#2f6fed',
};

const navRow = {
  gap: 8,
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
};

const panel = {
  background: '#ffffff',
  border: '1px solid #d8e0ea',
  borderRadius: 8,
  boxShadow: '0 8px 24px rgba(19, 32, 51, 0.05)',
  padding: 18,
  gap: 12,
};

const quietPanel = {
  background: '#f8fafc',
  border: '1px solid #d8e0ea',
  borderRadius: 8,
  padding: 14,
  gap: 8,
};

const grid = {
  style: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  },
  gap: 14,
};

const twoColumnGrid = {
  style: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  },
  gap: 16,
};

const title = { fontSize: 30, fontWeight: 800, color: '#101827' };
const subtitle = { color: '#5b677a', lineHeight: 1.55 };
const eyebrow = {
  color: '#2f6fed',
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
};
const sectionTitle = { fontSize: 18, fontWeight: 800, color: '#101827' };
const metricValue = { fontSize: 26, fontWeight: 800, color: '#16213a' };
const muted = { color: '#6b7688' };
const success = { color: '#047857', fontWeight: 700 };
const warning = { color: '#b45309', fontWeight: 700 };
const danger = { color: '#b91c1c', fontWeight: 700 };
const pill = {
  border: '1px solid #c8d5e5',
  borderRadius: 999,
  padding: '6px 10px',
  background: '#f8fafc',
  color: '#334155',
  fontSize: 12,
  fontWeight: 700,
};
const fieldGroup = { gap: 6 };
const inputStyle = {
  width: '100%',
  minHeight: 42,
  borderRadius: 8,
  border: '1px solid #c7d2e0',
  padding: '10px 12px',
  background: '#ffffff',
};
const primaryButton = { variant: 'primary', borderRadius: 8, minHeight: 40 };
const secondaryButton = { variant: 'secondary', borderRadius: 8, minHeight: 40 };

/* --------------------------- Shared UI --------------------------- */
const CacheBadge = () => <Text modifiers={pill}>Contract cache: {use(contractCacheSource)}</Text>;

const StatusLine = () => (
  <If condition={E<boolean>('len(flow.statusMessage) > 0')}>
    <Text modifiers={success}>{use(statusMessage)}</Text>
  </If>
);

const ErrorLine = () => (
  <If condition={E<boolean>('len(flow.saveError) > 0')}>
    <Text modifiers={danger}>{use(saveError)}</Text>
  </If>
);

const FieldLabel = ({ label }: { label: string }) => <Text modifiers={muted}>{label}</Text>;

const TextField = ({
  label,
  binding,
  placeholder,
  inputType = 'text',
}: {
  label: string;
  binding: ReturnType<typeof bind>;
  placeholder: string;
  inputType?: 'text' | 'number' | 'email';
}) => (
  <Column modifiers={fieldGroup}>
    <FieldLabel label={label} />
    <Input
      binding={binding}
      placeholder={placeholder}
      inputType={inputType}
      modifiers={inputStyle}
    />
  </Column>
);

const Nav = () => (
  <Row modifiers={navRow}>
    <Button
      title="Dashboard"
      modifiers={secondaryButton}
      onAction={[{ navigate: ['dashboard', { mode: 'replace' }] }]}
    />
    <Button
      title="Requests"
      modifiers={secondaryButton}
      onAction={[{ navigate: ['requests', { mode: 'replace' }] }]}
    />
    <Button
      title="Settings"
      modifiers={secondaryButton}
      onAction={[{ navigate: ['settings', { mode: 'replace' }] }]}
    />
    <Button
      title="New request"
      modifiers={primaryButton}
      onAction={[{ flowStart: { routeId: 'launch-request' } }]}
    />
  </Row>
);

const AppShell = ({ children }: { children: unknown }) => (
  <Column modifiers={page}>
    <Column modifiers={shell}>
      <Row modifiers={topBar}>
        <Row modifiers={{ alignItems: 'center', gap: 12 }}>
          <Image
            src="/brand-mark.svg"
            alt="Taskly"
            width={42}
            height={42}
            fit="cover"
            modifiers={brandMark}
          />
          <Column modifiers={{ gap: 2 }}>
            <Text modifiers={{ fontSize: 18, fontWeight: 800 }}>Taskly Operations</Text>
            <Text modifiers={muted}>{use(workspaceName)}</Text>
          </Column>
        </Row>
        <Nav />
      </Row>
      {children}
    </Column>
  </Column>
);

const MetricTile = ({ label, value, note }: { label: string; value: unknown; note: string }) => (
  <Column modifiers={quietPanel}>
    <Text modifiers={muted}>{label}</Text>
    <Text modifiers={metricValue}>{value}</Text>
    <Text modifiers={muted}>{note}</Text>
  </Column>
);

const Hero = () => (
  <Column modifiers={{ ...panel, gap: 16 }}>
    <Row modifiers={{ justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
      <Column modifiers={{ gap: 6, maxWidth: 680 }}>
        <Text modifiers={eyebrow}>BDUI production showcase</Text>
        <Text modifiers={title}>A complete operational app delivered as a contract</Text>
        <Text modifiers={subtitle}>
          This example demonstrates contract caching, server actions, data sources, session
          persistence, guarded actions, validation, toasts, navigation and multi-step flows.
        </Text>
      </Column>
      <Column modifiers={{ gap: 8, minWidth: 220 }}>
        <CacheBadge />
        <Text modifiers={pill}>Active view: {use(activeView)}</Text>
        <Text modifiers={pill}>Plan: {use(plan)}</Text>
      </Column>
    </Row>
    <Row modifiers={{ gap: 10, flexWrap: 'wrap' }}>
      <Button title="Refresh data source" modifiers={primaryButton} onAction={refreshWorkspace} />
      <Button
        title="Load static catalog"
        modifiers={secondaryButton}
        onAction={loadStarterCatalog}
      />
      <Button
        title="Prefetch request flow"
        modifiers={secondaryButton}
        onAction={[
          { prefetch: ['launch-request', 'requests'] },
          { toast: ['Prefetch hook executed'] },
        ]}
      />
      <Button
        title="Open modal brief"
        modifiers={secondaryButton}
        onAction={[{ modalOpen: 'showcase-brief' }]}
      />
    </Row>
    <If condition={false}>
      <Column id="showcase-brief" modifiers={{ ...panel, maxWidth: 520 }}>
        <Text modifiers={sectionTitle}>BDUI capability brief</Text>
        <Text modifiers={subtitle}>
          This modal is described inside the same contract tree. The web renderer resolves it by
          node id, mounts it through the modal host and closes it through a serializable SAL action.
        </Text>
        <Row modifiers={{ gap: 10, justifyContent: 'flex-end' }}>
          <Button
            title="Close"
            modifiers={primaryButton}
            onAction={[{ modalClose: 'showcase-brief' }]}
          />
        </Row>
      </Column>
    </If>
    <StatusLine />
    <ErrorLine />
  </Column>
);

const DashboardMetrics = () => (
  <Column modifiers={grid}>
    <MetricTile
      label="Workspace health"
      value={E<string>('flow.workspaceSnapshot.health')}
      note="REST data source"
    />
    <MetricTile
      label="Utilization"
      value={E<string>("concat(flow.workspaceSnapshot.utilization, '%')")}
      note="Live operations signal"
    />
    <MetricTile
      label="Revenue exposure"
      value={E<string>('flow.workspaceSnapshot.revenue')}
      note="Server-calculated"
    />
    <MetricTile
      label="Open blockers"
      value={E<number>('flow.workspaceSnapshot.blockerCount')}
      note="Guarded by workflow"
    />
  </Column>
);

const WorkPanel = () => (
  <Column modifiers={panel}>
    <Text modifiers={sectionTitle}>Today&apos;s operating rhythm</Text>
    <Column modifiers={grid}>
      <Column modifiers={quietPanel}>
        <Text modifiers={muted}>Next review</Text>
        <Text modifiers={{ fontWeight: 800 }}>
          {E<string>('flow.workspaceSnapshot.nextReview')}
        </Text>
        <Text modifiers={muted}>Last sync: {E<string>('flow.workspaceSnapshot.updatedAt')}</Text>
      </Column>
      <Column modifiers={quietPanel}>
        <Text modifiers={muted}>Risk posture</Text>
        <Text modifiers={{ fontWeight: 800 }}>{E<string>('flow.workspaceSnapshot.risk')}</Text>
        <Text modifiers={muted}>SLA: {E<string>('flow.workspaceSnapshot.sla')}</Text>
      </Column>
      <Column modifiers={quietPanel}>
        <Text modifiers={muted}>Starter catalog</Text>
        <Text modifiers={{ fontWeight: 800 }}>{E<string>('flow.starterCatalog.templateName')}</Text>
        <Text modifiers={muted}>Guardrails: {E<string>('flow.starterCatalog.guardrails')}</Text>
      </Column>
    </Column>
  </Column>
);

const TaskPanel = () => (
  <Column modifiers={panel}>
    <Text modifiers={sectionTitle}>Action capture</Text>
    <Text modifiers={subtitle}>
      Saves through a server `call`, updates local state in an atomic batch and rolls back the
      visible error state when the request fails.
    </Text>
    <TextField
      label="Next task"
      binding={bind(draftTask)}
      placeholder="Write the next operational action"
    />
    <Row modifiers={{ gap: 10, flexWrap: 'wrap' }}>
      <Button
        title="Save task"
        modifiers={primaryButton}
        onAction={[
          {
            when: {
              if: 'len(flow.draftTask) == 0',
              then: [{ toast: ['Enter a task before saving', { level: 'warning' }] }],
              else: [
                {
                  batch: [
                    { set: [bind(saveError), ''] },
                    taskCall,
                    { set: [bind(draftTask), ''] },
                    { set: [bind(taskDone), false] },
                    { inc: bind(taskCount) },
                    { set: [bind(statusMessage), 'Task saved through the Taskly API'] },
                    { toast: ['Task saved', { level: 'success' }] },
                  ],
                  atomic: true,
                },
              ],
            },
          },
        ]}
      />
      <Button
        title="Clear"
        modifiers={secondaryButton}
        onAction={[{ set: [bind(draftTask), ''] }, { set: [bind(saveError), ''] }]}
      />
    </Row>
    <Divider />
    <Column modifiers={{ gap: 8 }}>
      <Text modifiers={muted}>Saved tasks: {use(taskCount)}</Text>
      <Checkbox binding={bind(taskDone)} label={use(lastTask) as unknown as string} />
    </Column>
  </Column>
);

const Dashboard = () => (
  <AppShell>
    <Hero />
    <DashboardMetrics />
    <Column modifiers={twoColumnGrid}>
      <WorkPanel />
      <TaskPanel />
    </Column>
  </AppShell>
);

const RequestsRoute = () => (
  <AppShell>
    <Column modifiers={panel}>
      <Row modifiers={{ justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <Column modifiers={{ gap: 6 }}>
          <Text modifiers={eyebrow}>Multi-step form</Text>
          <Text modifiers={title}>Launch request desk</Text>
          <Text modifiers={subtitle}>
            The flow captures request details, runs a pluggable validator, branches with `when`,
            submits to the server and returns to this route.
          </Text>
        </Column>
        <Button
          title="Start request"
          modifiers={primaryButton}
          onAction={[{ flowStart: { routeId: 'launch-request' } }]}
        />
      </Row>
    </Column>
    <Column modifiers={grid}>
      <MetricTile label="Request status" value={use(requestStatus)} note="Flow state" />
      <MetricTile
        label="Ticket"
        value={E<string>('flow.requestTicket.id')}
        note="Saved API response"
      />
      <MetricTile
        label="Owner"
        value={E<string>('flow.requestTicket.owner')}
        note="Server assignment"
      />
      <MetricTile label="ETA" value={E<string>('flow.requestTicket.eta')} note="Server SLA" />
    </Column>
    <Column modifiers={panel}>
      <Text modifiers={sectionTitle}>Last request summary</Text>
      <Text>Type: {use(requestType)}</Text>
      <Text>Priority: {use(requestPriority)}</Text>
      <Text>Summary: {use(requestSummary)}</Text>
      <Text>Impact: {use(requestImpact)}</Text>
    </Column>
  </AppShell>
);

const SettingsRoute = () => (
  <AppShell>
    <Column modifiers={twoColumnGrid}>
      <Column modifiers={panel}>
        <Text modifiers={sectionTitle}>Profile and workspace</Text>
        <TextField label="Name" binding={bind(userName)} placeholder="Full name" />
        <TextField label="Email" binding={bind(userEmail)} placeholder="Email" inputType="email" />
        <TextField label="Workspace" binding={bind(workspaceName)} placeholder="Workspace name" />
        <Column modifiers={fieldGroup}>
          <FieldLabel label="Plan" />
          <Select
            binding={bind(plan)}
            placeholder="Plan"
            modifiers={inputStyle}
            options={[
              { value: 'starter', label: 'Starter' },
              { value: 'scale', label: 'Scale' },
              { value: 'enterprise', label: 'Enterprise' },
            ]}
          />
        </Column>
      </Column>
      <Column modifiers={panel}>
        <Text modifiers={sectionTitle}>Experience</Text>
        <Column modifiers={fieldGroup}>
          <FieldLabel label="Theme preference" />
          <Select
            binding={bind(themeMode)}
            placeholder="Theme"
            modifiers={inputStyle}
            options={[
              { value: 'system', label: 'Follow system' },
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
          />
        </Column>
        <Checkbox binding={bind(notifications)} label="Send operational notifications" />
        <Checkbox binding={bind(compactMode)} label="Use compact density" />
        <Row modifiers={{ gap: 10, flexWrap: 'wrap' }}>
          <Button
            title="Save settings"
            modifiers={primaryButton}
            onAction={[
              {
                batch: [
                  { set: [bind(saveError), ''] },
                  settingsCall,
                  profileCall,
                  { sync: {} },
                  {
                    set: [bind(statusMessage), 'Settings synced and persisted to session storage'],
                  },
                  { toast: ['Settings synced', { level: 'success' }] },
                ],
                atomic: true,
              },
            ]}
          />
          <Button
            title="Refresh workspace"
            modifiers={secondaryButton}
            onAction={refreshWorkspace}
          />
        </Row>
        <Text modifiers={muted}>Last saved: {use(settingsSaved)}</Text>
        <StatusLine />
        <ErrorLine />
      </Column>
    </Column>
  </AppShell>
);

/* ---------------------------- Contract --------------------------- */
export default (
  <Contract meta={meta} dataSources={dataSources}>
    <Theme.Simple
      primary="#2f6fed"
      background="#f3f6fb"
      darkBackground="#101827"
      extendTokens={() => ({
        'surface.card': { radius: 8, border: '#d8e0ea' },
        'state.success': { color: '#047857' },
        'state.warning': { color: '#b45309' },
      })}
    />
    <Navigation initialRoute="dashboard" urlSync>
      <Route id="dashboard" title="Dashboard">
        <Dashboard />
      </Route>

      <Route id="requests" title="Requests">
        <RequestsRoute />
      </Route>

      <Route id="settings" title="Settings">
        <SettingsRoute />
      </Route>

      <FlowRoute
        id="launch-request"
        title="New launch request"
        startStep="basics"
        persistence={{ mode: 'session' }}
      >
        <Step id="basics" title="Basics">
          <AppShell>
            <Column modifiers={panel}>
              <Text modifiers={eyebrow}>Step 1 of 3</Text>
              <Text modifiers={title}>Describe the request</Text>
              <Text modifiers={subtitle}>
                A pluggable validator writes validation details into local state while guarded
                actions decide whether the flow can advance.
              </Text>
              <Column modifiers={grid}>
                <Column modifiers={fieldGroup}>
                  <FieldLabel label="Request type" />
                  <Select
                    binding={bind(requestType)}
                    placeholder="Type"
                    modifiers={inputStyle}
                    options={[
                      { value: 'Launch review', label: 'Launch review' },
                      { value: 'Data migration', label: 'Data migration' },
                      { value: 'Experiment approval', label: 'Experiment approval' },
                      { value: 'Incident follow-up', label: 'Incident follow-up' },
                    ]}
                  />
                </Column>
                <Column modifiers={fieldGroup}>
                  <FieldLabel label="Priority" />
                  <Select
                    binding={bind(requestPriority)}
                    placeholder="Priority"
                    modifiers={inputStyle}
                    options={[
                      { value: 'Normal', label: 'Normal' },
                      { value: 'High', label: 'High' },
                      { value: 'Urgent', label: 'Urgent' },
                    ]}
                  />
                </Column>
              </Column>
              <TextField
                label="Short summary"
                binding={bind(requestSummary)}
                placeholder="Example: Approve billing launch for enterprise pilot"
              />
              <If condition={E<boolean>('local.__validation.requestIntake.ok == false')}>
                <Text modifiers={danger}>
                  {E<string>('local.__validation.requestIntake.errors[0]')}
                </Text>
              </If>
              <If condition={E<boolean>('len(flow.requestValidationNote) > 0')}>
                <Text modifiers={warning}>{use(requestValidationNote)}</Text>
              </If>
              <Row modifiers={{ gap: 10, flexWrap: 'wrap' }}>
                <Button
                  title="Cancel"
                  modifiers={secondaryButton}
                  onAction={[{ flowAbort: { reason: 'cancelled' } }, { navigate: ['requests'] }]}
                />
                <Button
                  title="Continue"
                  modifiers={primaryButton}
                  onAction={[
                    { validate: ['requestIntake', bind(requestSummary)] },
                    {
                      when: {
                        if: 'len(flow.requestSummary) < 12',
                        then: [
                          {
                            set: [
                              bind(requestValidationNote),
                              'Add at least 12 characters so reviewers can triage the request.',
                            ],
                          },
                          { toast: ['Summary is too short', { level: 'warning' }] },
                        ],
                        else: [
                          { set: [bind(requestValidationNote), ''] },
                          { flowGoTo: { stepId: 'impact' } },
                        ],
                      },
                    },
                  ]}
                />
              </Row>
            </Column>
          </AppShell>
        </Step>

        <Step id="impact" title="Impact">
          <AppShell>
            <Column modifiers={panel}>
              <Text modifiers={eyebrow}>Step 2 of 3</Text>
              <Text modifiers={title}>Add impact and guardrails</Text>
              <TextField
                label="Expected impact"
                binding={bind(requestImpact)}
                placeholder="Who is affected, what changes, and how risk is reduced"
              />
              <TextField
                label="Budget exposure"
                binding={bind(requestBudget)}
                placeholder="25000"
                inputType="number"
              />
              <Column modifiers={quietPanel}>
                <Checkbox binding={bind(requestNeedsDesign)} label="Design review required" />
                <Checkbox binding={bind(requestNeedsLegal)} label="Legal review required" />
              </Column>
              <Row modifiers={{ gap: 10, flexWrap: 'wrap' }}>
                <Button
                  title="Back"
                  modifiers={secondaryButton}
                  onAction={[{ flowGoTo: { stepId: 'basics' } }]}
                />
                <Button
                  title="Review"
                  modifiers={primaryButton}
                  onAction={[
                    {
                      when: {
                        if: 'len(flow.requestImpact) < 20',
                        then: [
                          {
                            set: [
                              bind(requestValidationNote),
                              'Add a clearer impact statement before review.',
                            ],
                          },
                          { toast: ['Impact statement is too short', { level: 'warning' }] },
                        ],
                        else: [
                          { set: [bind(requestValidationNote), ''] },
                          { flowGoTo: { stepId: 'confirm' } },
                        ],
                      },
                    },
                  ]}
                />
              </Row>
              <If condition={E<boolean>('len(flow.requestValidationNote) > 0')}>
                <Text modifiers={warning}>{use(requestValidationNote)}</Text>
              </If>
            </Column>
          </AppShell>
        </Step>

        <Step id="confirm" title="Confirm">
          <AppShell>
            <Column modifiers={panel}>
              <Text modifiers={eyebrow}>Step 3 of 3</Text>
              <Text modifiers={title}>Confirm and submit</Text>
              <Column modifiers={grid}>
                <MetricTile label="Type" value={use(requestType)} note="Selected in step 1" />
                <MetricTile label="Priority" value={use(requestPriority)} note="Routing signal" />
                <MetricTile
                  label="Budget"
                  value={E<string>("concat('$', flow.requestBudget)")}
                  note="Exposure"
                />
                <MetricTile
                  label="Design review"
                  value={E<string>("flow.requestNeedsDesign ? 'Required' : 'Not needed'")}
                  note="Guardrail"
                />
              </Column>
              <Column modifiers={quietPanel}>
                <Text modifiers={sectionTitle}>Summary</Text>
                <Text>{use(requestSummary)}</Text>
                <Text modifiers={sectionTitle}>Impact</Text>
                <Text>{use(requestImpact)}</Text>
              </Column>
              <Row modifiers={{ gap: 10, flexWrap: 'wrap' }}>
                <Button
                  title="Back"
                  modifiers={secondaryButton}
                  onAction={[{ flowGoTo: { stepId: 'impact' } }]}
                />
                <Button
                  title="Submit request"
                  modifiers={primaryButton}
                  onAction={[
                    {
                      batch: [
                        { set: [bind(saveError), ''] },
                        requestCall,
                        { set: [bind(requestStatus), 'Submitted'] },
                        {
                          set: [bind(statusMessage), 'Launch request submitted to the Taskly API'],
                        },
                        { flowComplete: true },
                        { navigate: ['requests'] },
                        { toast: ['Request submitted', { level: 'success' }] },
                      ],
                      atomic: true,
                    },
                  ]}
                />
              </Row>
              <ErrorLine />
            </Column>
          </AppShell>
        </Step>
      </FlowRoute>
    </Navigation>
  </Contract>
);

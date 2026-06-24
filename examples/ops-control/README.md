# Campus

Campus is a mobile-first student cabinet. It covers timetable access,
assignments, deanery requests and a digital pass without platform-specific UI
code in the application scenario.

The application is implemented as data:

- home summary for student, group, deadlines and attendance;
- timetable views for today, tomorrow and the week;
- assignment checklist;
- three-step deanery request flow;
- digital pass with access state and a QR block;
- profile settings stored in the `session` scope;
- conditional blocks, toast feedback and route navigation.

Build the canonical contract:

```bash
npm run bdui -- build examples/ops-control/src/app.tsx -o examples/ops-control/contract.json --mode prod
```

The generated `contract.json` is copied into Android, iOS and web-preview
resources by `npm run build:contracts`, so all three runtimes render the same
application scenario.

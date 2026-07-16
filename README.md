y# Rebuild Log

A personal progress-tracking system I designed and built to manage a structured
life transition across three parallel tracks: **income**, **credit**, and **physical health**.

Live demo: _add your deployed link here once hosted_

---

## Problem

In 2025 I stepped away from my career to be a full-time caregiver for my father
until his passing. Re-entering the workforce meant rebuilding three things at
once — income, credit, and physical health — without a way to see whether
daily effort was actually converting into progress.

Existing habit trackers and budgeting apps solve one of these problems, not
three, and none of them are built around the specific shape of a life-rebuild:
low daily overhead, long time horizons (12–24 months), and the need to see
trend lines, not just checkboxes.

I designed this system to solve that problem for myself, and treated it as a
real architecture exercise: define the data model, pick a storage approach,
build a UI that's fast enough to use every day, and make decisions I could
defend the way a Solutions Architect defends a design.

## Architecture

```
┌─────────────┐        ┌──────────────┐        ┌───────────────┐
│   Client     │──────▶│   API layer   │──────▶│   Data store   │
│  (React UI)  │◀──────│ (REST/JSON)   │◀──────│ (persistent)   │
└─────────────┘        └──────────────┘        └───────────────┘
      │
      ▼
 Renders trend lines
 per track from stored
 history (client-side
 aggregation, no server
 compute needed)
```

**Client:** React. One form logs a day's entry across all three tracks in a
single submit — minimizing daily friction was a deliberate design constraint,
since a tracker that's slow to use is a tracker that stops getting used.

**API layer:** a thin REST interface (`GET/POST /entries`) sitting between the
client and storage. Keeping this layer thin and swappable was intentional —
see **Tradeoffs** below.

**Data store:** entries are stored as append-only, date-keyed records, one
per track per day. This is deliberately closer to an event log than a
mutable "current state" table — see **Design decisions**.

## Data model

```
Entry {
  date: ISO date string       // primary key component
  track: "income" | "credit" | "body"
  metrics: { ... }            // track-specific fields, see below
}
```

- **Income:** `applicationsSent`, `portfolioMinutes`
- **Credit:** `balance`, `utilization`
- **Body:** `weight`, `workoutCompleted`

Each track has a different shape of metrics, which is why entries are stored
as flexible per-track records rather than one rigid row — an early decision
that avoided a schema migration once I started tracking on top of the
original three data points.

## Design decisions

**Why three separate tracks instead of one generic "habit" table.**
Early version treated everything as a generic metric log. That fell apart
fast — income progress is measured in weekly conversion rate, credit in
slow-moving trend, body in daily consistency. Forcing all three into one
shape actively hid the signal in each. Splitting them let each track define
its own meaningful stats (e.g., credit shows *latest* utilization, not a sum;
income shows a *running total* of applications).

**Why append-only entries instead of overwriting a "current state" record.**
A rebuild is fundamentally a story over time. If I only stored "current
weight" or "current balance," I'd lose the trend line that actually proves
(or disproves) that the plan is working. Storing dated entries costs more
storage and a bit more query complexity, but it's the only structure that
supports the sparkline/trend view, which is the actual point of the tool.

**Why the API layer is kept thin and storage-agnostic.**
I started with local persistence to get a working daily tool fast (which
mattered more than a "correct" backend on day one). Keeping the API surface
small (`GET /entries`, `POST /entries`) means the storage underneath can be
swapped — local store now, a real hosted database later — without touching
the client. This is a standard pattern for exactly this reason: defer
infrastructure decisions until they're actually load-bearing.

## Tradeoffs

| Decision | Tradeoff accepted |
|---|---|
| Append-only entries | More storage over time, but preserves trend history — worth it |
| One form for all 3 tracks | Less flexible per-track UI, but matches real daily usage (low friction beats completeness) |
| Client-side trend aggregation | Simpler backend, but wouldn't scale past single-user — acceptable since this is a personal tool, flagged here as a known limitation |
| Thin/swappable API layer | Slightly more indirection early on, in exchange for not re-architecting later |

## Roadmap

- [ ] Move storage from local persistence to a hosted database
- [ ] Add weekly/monthly rollup views (not just raw trend lines)
- [ ] Add export (CSV) for backup and portability
- [ ] Deploy publicly with auth if extended beyond personal use

## Stack

- React (client)
- REST-style API layer
- Persistent key-value storage
- Deployed via GitHub Pages / [host TBD]

## Running locally

```bash
npm install
npm run dev
```

---

Built by [Terrence McGee](https://github.com/TMM2030) as part of a
personal transition into Solutions Architecture, applying system design
thinking to a real, ongoing problem rather than a tutorial exercise.

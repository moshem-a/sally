# Sally — SuperCloud Sales Coach

An AI-powered real-time sales coaching platform that provides live meeting assistance, post-meeting summaries, and team collaboration tools for cloud sales engineers.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SALLY — SALES COACH                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────────────┐ │
│  │  Sign In  │──▶│  API Key  │──▶│ Dashboard │──▶│  Pre-Meeting      │ │
│  │  Screen   │   │  Setup    │   │           │   │  Setup            │ │
│  └───────────┘   └───────────┘   └─────┬─────┘   └────────┬──────────┘ │
│                                        │                   │            │
│                                        │                   ▼            │
│                                        │           ┌───────────────┐   │
│                                        │           │ Live Meeting  │   │
│                                        │           │  Coaching     │   │
│                                        │           └───────┬───────┘   │
│                                        │                   │            │
│                                        ▼                   ▼            │
│                                  ┌───────────────────────────────┐     │
│                                  │     Meeting Summary Page      │     │
│                                  │  ┌─────────┬────────┬──────┐  │     │
│                                  │  │Internal │Client  │Full  │  │     │
│                                  │  │Summary  │Email   │Trans.│  │     │
│                                  │  └─────────┴────────┴──────┘  │     │
│                                  └───────────────────────────────┘     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Architecture Diagram (Mermaid)

```mermaid
graph TB
    subgraph Auth["Authentication Layer"]
        SI[Sign In Screen] --> AK[API Key Setup]
        AK --> SET[Settings Screen]
    end

    subgraph Dashboard["Dashboard"]
        DH[Dashboard Header<br/>Nav · Search · Calendar Sync · User Menu]
        ST[Stat Tiles<br/>Meetings · Confidence · Hints · Signals]
        HT[Meeting History Table<br/>Sortable: Date · Client · Score<br/>Filterable: Stage · Scope]
        SB[Sidebar<br/>Top Clients · Coach Insights · Team]
    end

    subgraph LiveMeeting["Live Meeting"]
        AH[App Header<br/>Status Bar · Controls]
        CR[Context Rail<br/>Client Info · Deal Stage]
        TP[Transcript Panel<br/>Real-time · Notes]
        CC[Coach Column<br/>AI Hints · Sentiment]
    end

    subgraph Summary["Meeting Summary"]
        IS[Internal Summary<br/>Score · Insights · Actions<br/>Upsell · Risks]
        CE[Client Email<br/>Tone · References<br/>Attachments]
        FT[Full Transcript<br/>Search · Multilingual]
        SM[Share Modal<br/>People Picker · Permissions]
    end

    subgraph External["External Integrations"]
        GCAL[Google Calendar<br/>MCP Server]
        OAUTH[Google OAuth 2.0]
    end

    SI --> AK --> Dashboard
    DH --> HT
    HT -->|"Click meeting"| Summary
    Dashboard -->|"New meeting"| PM[Pre-Meeting Setup]
    PM --> LiveMeeting
    LiveMeeting -->|"End call"| Summary
    Summary -->|"Back"| Dashboard
    OAUTH --> GCAL -->|"list_events"| HT

    style Auth fill:#FEF3E2,stroke:#F9AB00,color:#333
    style Dashboard fill:#E8F0FE,stroke:#1A73E8,color:#333
    style LiveMeeting fill:#FCE8E6,stroke:#EA4335,color:#333
    style Summary fill:#E6F4EA,stroke:#34A853,color:#333
    style External fill:#F3E8FD,stroke:#9B59B6,color:#333
```

## Screen Flow (Mermaid)

```mermaid
stateDiagram-v2
    [*] --> SignIn
    SignIn --> ApiKeySetup: Authenticated
    ApiKeySetup --> Dashboard: Key saved

    Dashboard --> PreMeeting: New meeting
    Dashboard --> Summary: Click history row

    PreMeeting --> LiveMeeting: Start
    PreMeeting --> Dashboard: Cancel

    LiveMeeting --> Summary: End call

    Summary --> Dashboard: Back

    state Dashboard {
        [*] --> MyMeetings
        MyMeetings --> SharedWithMe: Tab switch
        SharedWithMe --> MyMeetings: Tab switch
    }

    state Summary {
        [*] --> InternalSummary
        InternalSummary --> ClientEmail: Tab
        ClientEmail --> FullTranscript: Tab
        FullTranscript --> InternalSummary: Tab
    }

    state LiveMeeting {
        Listening --> Paused: Pause
        Paused --> Listening: Resume
        Listening --> Muted: Mute
        Muted --> Listening: Unmute
    }
```

## Component Tree (Mermaid)

```mermaid
graph TD
    CSP["CalendarSyncProvider<br/><i>Context: calendar MCP state</i>"]
    APP["App<br/><i>Auth + routing</i>"]

    CSP --> APP

    APP --> SIS["SignInScreen"]
    APP --> AKS["ApiKeySetup"]
    APP --> SETS["SettingsScreen"]
    APP --> DASH["Dashboard"]
    APP --> PMT["PreMeeting"]
    APP --> LM["Live Meeting"]
    APP --> SUM["SummaryScreen"]

    DASH --> DHD["DashHeader"]
    DHD --> CSB["CalendarSyncBtn"]
    DASH --> STAT["StatTiles"]
    DASH --> HIST["Meeting History Table"]
    HIST --> HSB["HistShareBtn"]
    DASH --> SIDE["Sidebar"]

    LM --> APH["AppHeader"]
    LM --> CTX["ContextRail"]
    LM --> TRP["TranscriptPanel"]
    LM --> COA["CoachColumn"]

    SUM --> INT["InternalSummary"]
    SUM --> CLE["ClientEmail"]
    CLE --> REF["ReferenceLinks"]
    SUM --> FTR["FullTranscript"]
    SUM --> SHM["ShareModal"]

    style CSP fill:#F3E8FD,stroke:#9B59B6
    style DASH fill:#E8F0FE,stroke:#1A73E8
    style LM fill:#FCE8E6,stroke:#EA4335
    style SUM fill:#E6F4EA,stroke:#34A853
    style CSB fill:#F3E8FD,stroke:#9B59B6
```

## Google Calendar MCP Integration (Mermaid)

```mermaid
sequenceDiagram
    participant U as User
    participant S as Sally App
    participant MCP as MCP Server<br/>calendarmcp.googleapis.com
    participant GC as Google Calendar API

    Note over U,GC: Authentication Flow
    U->>S: Click "Connect Calendar"
    S->>U: Redirect to Google OAuth
    U->>S: Grant calendar.readonly scope
    S->>S: Store OAuth tokens

    Note over U,GC: Sync Flow
    S->>MCP: list_events(calendar_id, time_min, time_max)
    MCP->>GC: GET /calendars/{id}/events
    GC-->>MCP: Event list (JSON)
    MCP-->>S: Structured events
    S->>S: Merge into Meeting History

    Note over U,GC: Available MCP Tools
    rect rgb(232, 240, 254)
        S->>MCP: list_events — Fetch events by date range
        S->>MCP: get_event — Get single event details
        S->>MCP: list_calendars — List available calendars
        S->>MCP: create_event — Schedule new meetings
        S->>MCP: suggest_time — Free/busy lookup
    end
```

## Data Flow (Mermaid)

```mermaid
flowchart LR
    subgraph Data["Data Layer"]
        H["HISTORY[]<br/><i>id, client, title, date,<br/>participants, score, tags</i>"]
        S["SUMMARIES{}<br/><i>Map by meeting ID<br/>meeting, internal,<br/>client, references</i>"]
        T["TEAM[]<br/><i>name, role, initials,<br/>color, email</i>"]
    end

    subgraph UI["UI Layer"]
        DB["Dashboard<br/>filter + sort"]
        SM["Summary Screen"]
        SH["Share Modal"]
    end

    subgraph Calendar["Calendar MCP"]
        GC["Google Calendar<br/>Events"]
    end

    H --> DB
    DB -->|"onOpenMeeting(id)"| SM
    S -->|"SUMMARIES[id]"| SM
    T --> SH
    GC -->|"list_events"| H

    style Data fill:#FEF3E2,stroke:#F9AB00,color:#333
    style UI fill:#E8F0FE,stroke:#1A73E8,color:#333
    style Calendar fill:#F3E8FD,stroke:#9B59B6,color:#333
```

---

## Screen Flow

```
                    ┌──────────────────────────────────────┐
                    │           USER FLOW                   │
                    └──────────────────────────────────────┘

    ┌──────────┐       ┌──────────┐       ┌──────────┐       ┌──────────┐
    │          │       │          │       │          │       │          │
    │  Auth &  │──────▶│Dashboard │──────▶│Pre-Meet  │──────▶│  Live    │
    │  Setup   │       │& History │       │  Setup   │       │ Meeting  │
    │          │       │          │       │          │       │          │
    └──────────┘       └────┬─────┘       └──────────┘       └────┬─────┘
                            │                                      │
                            │  Click meeting                       │  End
                            │  from history                        │  meeting
                            │                                      │
                            ▼                                      ▼
                       ┌──────────────────────────────────────────────┐
                       │              SUMMARY SCREEN                  │
                       │                                              │
                       │  ┌────────────┐ ┌──────────┐ ┌───────────┐  │
                       │  │  Internal  │ │  Client  │ │   Full    │  │
                       │  │  Summary   │ │  Email   │ │Transcript │  │
                       │  │            │ │  Draft   │ │           │  │
                       │  │ - Score    │ │          │ │ - Search  │  │
                       │  │ - Insights │ │ - Tone   │ │ - Multi-  │  │
                       │  │ - Actions  │ │ - Refs   │ │   lang    │  │
                       │  │ - Upsell   │ │ - Attach │ │           │  │
                       │  │ - Risks    │ │          │ │           │  │
                       │  └────────────┘ └──────────┘ └───────────┘  │
                       │                                              │
                       │  ┌──────────────────────────────────────┐    │
                       │  │         SHARE MODAL                  │    │
                       │  │  People picker · Permissions · Link  │    │
                       │  └──────────────────────────────────────┘    │
                       └──────────────────────────────────────────────┘
```

## Dashboard — Meeting History Table

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  DASHBOARD                                                    [Calendar ↻]  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─ Stat Tiles ──────────────────────────────────────────────────────────┐   │
│  │  Meetings: 12   │  Avg Confidence: 82%  │  Hints: 68  │  Signals: 9 │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Meeting History                     [My meetings] [Shared]  [Search...]     │
│  ─────────────────────────────────────────────────────────────────────────   │
│  Client ▼  │ Meeting        │ Date ▼    │ People │ Stage  │ Tags │ Score ▼  │
│  ──────────┼────────────────┼───────────┼────────┼────────┼──────┼────────  │
│  ● Aviv    │ Vertex AI ...  │ Apr 24    │ ●●●    │ Disc.  │ 2    │  86     │
│  ● Rapyd   │ BigQuery ...   │ Apr 23    │ ●●●    │ Qual.  │ 3    │  72     │
│  ● Monday  │ GKE Autopilot  │ Apr 22    │ ●●●    │ Nego.  │ 3    │  91     │
│  ● Wix     │ AI infra       │ Apr 21    │ ●●     │ Intro  │ 2    │  64     │
│  ──────────┴────────────────┴───────────┴────────┴────────┴──────┴────────  │
│                                                                              │
│  ┌─ Sidebar ────────────────┐                                               │
│  │  Top clients             │                                               │
│  │  Coach insights          │                                               │
│  │  Team activity           │                                               │
│  └──────────────────────────┘                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Live Meeting Screen

```
┌──────────────────────────────────────────────────────────────────────┐
│  [SuperCloud]   Aviv Capital — Vertex AI Migration    🔴 LIVE 47:12 │
├──────────┬───────────────────────────────┬───────────────────────────┤
│          │                               │                           │
│ CONTEXT  │     LIVE TRANSCRIPT           │     COACH COLUMN          │
│  RAIL    │                               │                           │
│          │  Yael: "We're running on      │  ┌─ Hint ──────────────┐  │
│ Client   │   Bedrock — latency issues"   │  │ 💡 Ask about p95    │  │
│ info     │                               │  │    latency targets  │  │
│          │  Noa: "What range, p95?"       │  └─────────────────────┘  │
│ Deal     │                               │                           │
│ stage    │  Yael: "1.8 to 2.2 seconds"   │  ┌─ Follow-up ────────┐  │
│          │                               │  │ Regional endpoints  │  │
│ Prior    │  Daniel: "$38K/month on        │  │ europe-west4        │  │
│ meetings │   inference"                   │  └─────────────────────┘  │
│          │                               │                           │
│ Notes    │  ┌──────────────────────┐     │  📊 Sentiment: Positive  │
│          │  │ + Add note           │     │     ▁▂▃▅▆▇ trending up  │
│          │  └──────────────────────┘     │                           │
├──────────┴───────────────────────────────┴───────────────────────────┤
│  [⏸ Pause]  [🔇 Mute]  [🌐 EN/עב]                   [⏹ End call]  │
└──────────────────────────────────────────────────────────────────────┘
```

## Google Calendar MCP Integration

```
┌─────────────────────────────────────────────────────────────────┐
│                  GOOGLE CALENDAR MCP FLOW                       │
└─────────────────────────────────────────────────────────────────┘

  ┌──────────┐         ┌──────────────────┐         ┌────────────┐
  │          │  OAuth  │                  │  MCP     │  Google    │
  │  Sally   │◀──────▶│  MCP Server      │◀───────▶│  Calendar  │
  │  App     │  2.0   │  calendarmcp.    │  Tools   │  API       │
  │          │        │  googleapis.com  │         │            │
  └──────────┘         └──────────────────┘         └────────────┘
       │                       │
       │                       │
       ▼                       ▼
  ┌──────────┐         ┌──────────────────────────────────────┐
  │Dashboard │         │  Available MCP Tools:                │
  │ Meeting  │◀────────│                                      │
  │ History  │  events │  list_events    — Fetch by date      │
  │          │         │  get_event      — Event details      │
  └──────────┘         │  list_calendars — Available cals     │
                       │  create_event   — Schedule meetings  │
                       │  suggest_time   — Free/busy lookup   │
                       └──────────────────────────────────────┘

  Authentication:
  ┌─────────┐    ┌──────────┐    ┌───────────┐    ┌───────────┐
  │  User   │───▶│  Google  │───▶│  Token    │───▶│  MCP      │
  │  clicks │    │  OAuth   │    │  exchange │    │  requests │
  │  Connect│    │  consent │    │  & store  │    │  with     │
  │         │    │  screen  │    │           │    │  token    │
  └─────────┘    └──────────┘    └───────────┘    └───────────┘
```

## File Structure

```
sally/
├── GCP Sales Coach.html        # Entry point — loads all scripts
├── README.md
│
├── styles.css                  # CSS variables, tokens, base theme
├── app.css                     # Layout: topbar, main grid, panels
├── app2.css                    # Dashboard, history table, sidebar
├── hist-share.css              # History share popover, autocomplete
├── calendar-sync.css           # Google Calendar MCP panel styles
├── auth.css                    # Sign-in, API key, settings screens
├── screen-jump.css             # Dev flow navigation bar
├── references.css              # Reference links in email tab
│
├── data.js                     # Mock live meeting data (transcript, hints)
├── data-app.js                 # Meeting history, team, per-meeting summaries
│
├── icons.jsx                   # Inline SVG icon set (Ico.*)
├── tweaks-panel.jsx            # Dev/demo tweaks overlay
├── calendar-sync.jsx           # Google Calendar MCP integration layer
├── components-shell.jsx        # AppHeader, status bar
├── components-transcript.jsx   # Live transcript panel
├── components-coach.jsx        # AI coaching hints & sentiment
├── screen-auth.jsx             # Sign-in, API key setup, settings
├── screen-dashboard.jsx        # Dashboard + meeting history table
├── screen-premeeting.jsx       # Pre-meeting setup form
├── screen-summary.jsx          # Post-meeting summary (3 tabs + share)
├── app.jsx                     # Root App component, routing, state
│
├── assets/
│   └── supercloud-mark.svg     # Brand logo
├── screenshots/                # UI reference screenshots
└── uploads/                    # Pasted design references
```

## Component Architecture

```
CalendarSyncProvider                    (Context: calendar MCP state)
  └── App                              (Auth + routing)
        │
        ├── SignInScreen                (Google SSO)
        ├── ApiKeySetup                 (Gemini API key)
        ├── SettingsScreen              (User preferences)
        │
        ├── Dashboard                   (Main screen)
        │     ├── DashHeader            (Nav, search, CalendarSyncBtn, user menu)
        │     ├── StatTiles             (Weekly metrics)
        │     ├── Meeting History Table  (Sortable: date, client, score)
        │     │     └── HistShareBtn    (Per-row share popover)
        │     └── Sidebar               (Top clients, insights, team)
        │
        ├── PreMeeting                  (Client, agenda, template selection)
        │
        ├── Live Meeting
        │     ├── AppHeader             (Status bar, controls)
        │     ├── ContextRail           (Client context sidebar)
        │     ├── TranscriptPanel       (Real-time transcript + notes)
        │     └── CoachColumn           (AI hints, follow-ups, sentiment)
        │
        └── SummaryScreen               (Post-meeting)
              ├── InternalSummary       (Score, insights, actions, upsell)
              ├── ClientEmail           (Draft with tone/refs/attachments)
              ├── FullTranscript        (Searchable, multilingual)
              └── ShareModal            (People picker, permissions, link)
```

## Data Flow

```
┌────────────┐     ┌────────────┐     ┌──────────────┐
│  HISTORY   │────▶│  Dashboard │────▶│  Click row   │
│  (array)   │     │  Table     │     │  onOpenMeeting(id)
└────────────┘     └────────────┘     └──────┬───────┘
                                             │
                                             ▼
┌────────────┐     ┌────────────┐     ┌──────────────┐
│ SUMMARIES  │────▶│  Lookup by │────▶│ SummaryScreen│
│ (map by id)│     │  meeting ID│     │  (per-meeting│
└────────────┘     └────────────┘     │   data)      │
                                      └──────────────┘

Each meeting in HISTORY has:
  id, client, title, date, dateISO, time, duration,
  stage, score, sentiment, tags, participants[],
  hintCount, actedOn, nextStep, avatar

Each entry in SUMMARIES has:
  meeting{}, internal{}, client{}, references[]
```

## Features

- **Live AI Coaching** — Real-time hints, follow-up suggestions, and sentiment tracking during meetings
- **Meeting History** — Sortable table with date, participants, stage, score; filterable by stage and scope
- **Per-Meeting Summaries** — Internal analysis, client email draft, and full transcript for every meeting
- **Smart Sharing** — Share meetings with teammates via people picker with permission controls
- **Google Calendar MCP** — Sync meetings from Google Calendar via the MCP protocol
- **Multilingual** — English, Hebrew (RTL), and bilingual support
- **Dark Mode** — Full light/dark theme support

## Getting Started

1. Open `GCP Sales Coach.html` in any modern browser
2. The app runs entirely client-side — no build step or server required
3. Uses React 18 + Babel standalone for JSX transformation

## Tech Stack

- **React 18** — UI components (via CDN, no build)
- **Babel Standalone** — In-browser JSX compilation
- **CSS Custom Properties** — Theming and design tokens
- **Google Calendar MCP** — Meeting data sync via Model Context Protocol

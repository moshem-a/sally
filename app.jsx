/* global React, ReactDOM, AppHeader, ContextRail, TranscriptPanel, CoachColumn,
   Dashboard, PreMeeting, SummaryScreen, SignInScreen, ApiKeySetup, SettingsScreen, MOCK, Ico, SUMMARIES, SUMMARY, CalendarSyncProvider */
const { useState, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "startScreen": "dashboard",
  "demoAuth": "signedIn"
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = (window.useTweaks ? window.useTweaks(TWEAK_DEFAULTS) : [TWEAK_DEFAULTS, ()=>{}]);
  const [theme, setTheme] = useState(tweaks.theme || "light");

  // ─── Auth state ──────────────────────────────────────────
  // demoAuth: "signin" | "apikey" | "signedIn"
  const initialAuth = tweaks.demoAuth || "signedIn";
  const [user, setUser] = useState(initialAuth === "signin" ? null : {
    email: "noalevi@google.com",
    name: "Noa Levi",
    initials: "NL",
    color: "#1A73E8",
    role: "Sr. Cloud SE",
    team: "EMEA Cloud Sales",
    timezone: "Europe/London (UTC+1)",
    language: "en",
    pace: "balanced",
    autoSummary: true,
    quietByDefault: false,
  });
  const [apiKey, setApiKey] = useState(initialAuth === "signedIn" ? "AIzaSyDemoKey1234567890abcdef" : "");
  const [showSettings, setShowSettings] = useState(false);

  // ─── App routing ────────────────────────────────────────
  const [screen, setScreen] = useState(tweaks.startScreen || "dashboard");
  const [meetingId, setMeetingId] = useState(null);
  const [lang, setLang] = useState("en");
  const [listening, setListening] = useState(true);
  const [muted, setMuted] = useState(false);
  const [notes, setNotes] = useState(MOCK.notes);

  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, [theme]);
  useEffect(() => { setTheme(tweaks.theme); }, [tweaks.theme]);
  useEffect(() => {
    document.documentElement.setAttribute("dir", lang === "he" || lang === "ar" ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", lang === "he" ? "he" : lang === "ar" ? "ar" : "en");
  }, [lang]);

  // React to demoAuth changes from the Tweaks panel
  useEffect(() => {
    if (tweaks.demoAuth === "signin") { setUser(null); setApiKey(""); setShowSettings(false); }
    else if (tweaks.demoAuth === "apikey") { setUser(u => u || {
      email: "noalevi@google.com", name: "Noa Levi", initials: "NL", color: "#1A73E8",
      role: "Sr. Cloud SE", team: "EMEA Cloud Sales", language: "en"
    }); setApiKey(""); setShowSettings(false); }
    else if (tweaks.demoAuth === "signedIn") {
      if (!user) setUser({
        email: "noalevi@google.com", name: "Noa Levi", initials: "NL", color: "#1A73E8",
        role: "Sr. Cloud SE", team: "EMEA Cloud Sales", language: "en"
      });
      if (!apiKey) setApiKey("AIzaSyDemoKey1234567890abcdef");
    }
    else if (tweaks.demoAuth === "settings") { setShowSettings(true); }
  }, [tweaks.demoAuth]);

  const addNote = (text) => {
    const t = "23:" + String(14 + notes.length).padStart(2,"0");
    setNotes(n => [...n, { t, text }]);
  };

  // ─── Routing decisions ─────────────────────────────────
  if (!user) {
    return (
      <>
        <SignInScreen onSignIn={(u) => { setUser(u); setTweak && setTweak("demoAuth", "apikey"); }}/>
        <DemoTweaks tweaks={tweaks} setTweak={setTweak} setTheme={setTheme} screen={screen} setScreen={setScreen} lang={lang} setLang={setLang}/>
      </>
    );
  }
  if (!apiKey) {
    return (
      <>
        <ApiKeySetup
          user={user}
          onSave={(key) => { setApiKey(key); setTweak && setTweak("demoAuth", "signedIn"); }}
          onSignOut={() => { setUser(null); setTweak && setTweak("demoAuth", "signin"); }}
        />
        <DemoTweaks tweaks={tweaks} setTweak={setTweak} setTheme={setTheme} screen={screen} setScreen={setScreen} lang={lang} setLang={setLang}/>
      </>
    );
  }
  if (showSettings) {
    return (
      <>
        <SettingsScreen
          user={user}
          apiKey={apiKey}
          onSave={({ profile, apiKey: newKey }) => {
            setUser(u => ({ ...u, ...profile }));
            setApiKey(newKey);
            if (profile.language) setLang(profile.language === "he" ? "he" : profile.language === "ar" ? "ar" : "en");
          }}
          onSignOut={() => { setUser(null); setApiKey(""); setShowSettings(false); setTweak && setTweak("demoAuth", "signin"); }}
          onClose={() => { setShowSettings(false); setTweak && setTweak("demoAuth", "signedIn"); }}
        />
        <DemoTweaks tweaks={tweaks} setTweak={setTweak} setTheme={setTheme} screen={screen} setScreen={setScreen} lang={lang} setLang={setLang}/>
      </>
    );
  }

  return (
    <>
      {screen === "dashboard" && (
        <Dashboard
          user={user}
          onStartNew={()=>setScreen("setup")}
          onOpenMeeting={(id)=>{ setMeetingId(id); setScreen("summary"); }}
          onOpenSettings={()=>setShowSettings(true)}
        />
      )}

      {screen === "setup" && (
        <PreMeeting
          onCancel={()=>setScreen("dashboard")}
          onStart={()=>setScreen("meeting")}
        />
      )}

      {screen === "meeting" && (
        <div className="app">
          <AppHeader
            meeting={MOCK}
            listening={listening}
            muted={muted}
            onToggleListening={()=>{
              if (listening) setScreen("summary");
              else setListening(true);
            }}
            onToggleMute={()=>setMuted(m=>!m)}
            lang={lang} setLang={setLang}
            theme={theme} setTheme={(t)=>{ setTheme(t); setTweak && setTweak("theme", t); }}
          />
          <main className="main">
            <ContextRail meeting={MOCK}/>
            <TranscriptPanel
              transcript={MOCK.transcript}
              lang={lang}
              listening={listening}
              muted={muted}
              onAddNote={addNote}
              notes={notes}
            />
            <CoachColumn
              hints={MOCK.hints}
              followups={MOCK.followups}
              sentiment={MOCK.sentimentSeries}
              sentimentEvents={MOCK.sentimentEvents}
            />
          </main>
        </div>
      )}

      {screen === "summary" && (
        <SummaryScreen
          summary={meetingId && SUMMARIES[meetingId] ? SUMMARIES[meetingId] : SUMMARY}
          onBack={()=>setScreen("dashboard")}
          onShare={()=>{}}
        />
      )}

      <ScreenJump screen={screen} setScreen={setScreen} onOpenSettings={()=>setShowSettings(true)}/>
      <DemoTweaks tweaks={tweaks} setTweak={setTweak} setTheme={setTheme} screen={screen} setScreen={setScreen} lang={lang} setLang={setLang}/>
    </>
  );
}

function ScreenJump({ screen, setScreen, onOpenSettings }) {
  const items = [
    { id: "dashboard", label: "Dashboard" },
    { id: "setup",     label: "New meeting" },
    { id: "meeting",   label: "Live coaching" },
    { id: "summary",   label: "Summary" },
  ];
  return (
    <nav className="screen-jump">
      <span className="screen-jump-kicker">FLOW</span>
      {items.map((it, i) => (
        <button key={it.id} className={screen===it.id ? "on" : ""} onClick={()=>setScreen(it.id)}>
          <span className="sj-num">{i+1}</span>{it.label}
        </button>
      ))}
      <span className="screen-jump-divider"/>
      <button onClick={onOpenSettings} title="Settings">
        <Ico.settings size={12}/> Settings
      </button>
    </nav>
  );
}

function DemoTweaks({ tweaks, setTweak, setTheme, screen, setScreen, lang, setLang }) {
  if (!window.TweaksPanel) return null;
  return (
    <window.TweaksPanel title="Tweaks">
      <window.TweakSection title="Auth flow (demo)">
        <window.TweakRadio
          label="Stage"
          value={tweaks.demoAuth || "signedIn"}
          onChange={(v)=>setTweak("demoAuth", v)}
          options={[
            {label:"Sign in",   value:"signin"},
            {label:"API key",   value:"apikey"},
            {label:"Settings",  value:"settings"},
            {label:"App",       value:"signedIn"},
          ]}
        />
      </window.TweakSection>
      <window.TweakSection title="Flow">
        <window.TweakRadio
          label="Screen"
          value={screen}
          onChange={setScreen}
          options={[
            {label:"Dashboard", value:"dashboard"},
            {label:"Setup",     value:"setup"},
            {label:"Meeting",   value:"meeting"},
            {label:"Summary",   value:"summary"},
          ]}
        />
      </window.TweakSection>
      <window.TweakSection title="Theme">
        <window.TweakRadio
          label="Appearance"
          value={tweaks.theme}
          onChange={(v)=>{ setTweak("theme", v); setTheme(v); }}
          options={[{label:"Light", value:"light"}, {label:"Dark", value:"dark"}]}
        />
      </window.TweakSection>
      <window.TweakSection title="Language (live meeting)">
        <window.TweakRadio
          label="UI language"
          value={lang}
          onChange={setLang}
          options={[
            {label:"EN", value:"en"},
            {label:"עב (RTL)", value:"he"},
            {label:"Bilingual", value:"bi"},
          ]}
        />
      </window.TweakSection>
    </window.TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <CalendarSyncProvider><App/></CalendarSyncProvider>
);

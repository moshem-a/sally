/* global React, Ico */
const { useState: uSA, useEffect: uEA, useRef: uRA } = React;

/* ─────────────────────────────────────────────
   Sign-in screen — Google SSO, gated to google.com
   ───────────────────────────────────────────── */
function SignInScreen({ onSignIn }) {
  const [email, setEmail] = uSA("");
  const [name, setName] = uSA("");
  const [err, setErr] = uSA("");
  const [loading, setLoading] = uSA(false);
  const [showPicker, setShowPicker] = uSA(false);

  // Pre-seeded suggested accounts (mock chooser)
  const suggested = [
    { name: "Yael Goldberg",  email: "ygoldberg@google.com",  initials: "YG", color: "#1A73E8" },
    { name: "Daniel Cohen",   email: "danielc@google.com",     initials: "DC", color: "#34A853" },
    { name: "Maya Bar-On",    email: "maya.baron@google.com",  initials: "MB", color: "#EA4335" },
  ];

  const submit = (e, picked) => {
    if (e) e.preventDefault();
    setErr("");
    const acc = picked || { email: email.trim().toLowerCase(), name: name.trim() || email.split("@")[0] };
    if (!acc.email) return setErr("Enter your work email.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(acc.email)) return setErr("That doesn't look like a valid email.");
    if (!acc.email.endsWith("@google.com")) {
      return setErr("Access is restricted to @google.com accounts.");
    }
    setLoading(true);
    setTimeout(() => {
      const initials = (acc.name || acc.email).split(/[\s@.]+/).filter(Boolean).slice(0,2).map(s=>s[0].toUpperCase()).join("");
      onSignIn({
        email: acc.email,
        name: acc.name || acc.email.split("@")[0].replace(/\./g," ").replace(/\b\w/g, c=>c.toUpperCase()),
        initials: acc.initials || initials,
        color: acc.color || "#1A73E8",
      });
    }, 850);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-blob b1"/>
        <div className="auth-blob b2"/>
        <div className="auth-blob b3"/>
        <div className="auth-blob b4"/>
        <div className="auth-grid"/>
      </div>

      <div className="auth-shell">
        <div className="auth-brand">
          <div className="auth-logo">
            <span className="dot d1"/><span className="dot d2"/><span className="dot d3"/><span className="dot d4"/>
          </div>
          <div>
            <div className="auth-brand-name">GCP Sales Coach</div>
            <div className="auth-brand-sub mono">Internal · Cloud Sales Engineering</div>
          </div>
        </div>

        <div className="auth-card">
          <h1 className="auth-h1">Sign in to continue</h1>
          <p className="auth-sub">
            Real-time meeting coaching for the Google Cloud sales org.
            Access is limited to <span className="mono">@google.com</span> accounts.
          </p>

          {!showPicker ? (
            <button className="goog-btn" onClick={()=>setShowPicker(true)} disabled={loading}>
              <GoogleG/>
              <span>{loading ? "Signing in…" : "Sign in with Google"}</span>
            </button>
          ) : (
            <div className="goog-chooser">
              <div className="gc-head">
                <GoogleG size={20}/>
                <div>
                  <div className="gc-title">Choose an account</div>
                  <div className="gc-sub">to continue to GCP Sales Coach</div>
                </div>
              </div>
              <ul className="gc-accounts">
                {suggested.map(a => (
                  <li key={a.email} onClick={()=>submit(null, a)}>
                    <div className="gc-avatar" style={{background: a.color}}>{a.initials}</div>
                    <div className="gc-meta">
                      <div className="gc-name">{a.name}</div>
                      <div className="gc-email mono">{a.email}</div>
                    </div>
                  </li>
                ))}
                <li className="gc-other" onClick={()=>setShowPicker("manual")}>
                  <div className="gc-avatar gc-plus"><Ico.user size={16}/></div>
                  <div className="gc-meta">
                    <div className="gc-name">Use another account</div>
                  </div>
                </li>
              </ul>
            </div>
          )}

          {showPicker === "manual" && (
            <form onSubmit={submit} className="auth-form">
              <label className="auth-label">
                Email
                <input
                  type="email"
                  placeholder="you@google.com"
                  value={email}
                  onChange={(e)=>setEmail(e.target.value)}
                  autoFocus
                />
              </label>
              <label className="auth-label">
                Full name <span className="auth-opt">(optional)</span>
                <input
                  type="text"
                  placeholder="Yael Goldberg"
                  value={name}
                  onChange={(e)=>setName(e.target.value)}
                />
              </label>
              {err && <div className="auth-err"><Ico.alert size={14}/> {err}</div>}
              <button className="pill-btn primary lg" disabled={loading}>
                {loading ? "Signing in…" : "Continue"}
              </button>
              <button type="button" className="ghost-btn" onClick={()=>setShowPicker(true)}>
                ← Back to account chooser
              </button>
            </form>
          )}

          {err && showPicker !== "manual" && (
            <div className="auth-err"><Ico.alert size={14}/> {err}</div>
          )}

          <div className="auth-foot">
            <span className="mono">v0.4.2-internal</span>
            <span>•</span>
            <a href="#">Privacy</a>
            <span>•</span>
            <a href="#">Terms</a>
            <span>•</span>
            <a href="#">Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Google "G" — original drawing of the four-color mark */
function GoogleG({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.6 33.6 30 36.5 24 36.5c-6.9 0-12.5-5.6-12.5-12.5S17.1 11.5 24 11.5c3.2 0 6.1 1.2 8.3 3.1l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.4-.2-2.7-.5-4z"/>
      <path fill="#34A853" d="M6.3 14.7l7 5.1c1.9-4.7 6.4-8.3 11.7-8.3 3.2 0 6.1 1.2 8.3 3.1l6-6C34.6 5.1 29.6 3 24 3 16 3 9.1 7.6 6.3 14.7z"/>
      <path fill="#FBBC05" d="M24 45c5.4 0 10.3-2 14-5.3l-6.5-5.4c-2 1.4-4.6 2.2-7.5 2.2-6 0-10.6-2.9-11.7-8H5.2C8 39.4 15.3 45 24 45z"/>
      <path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-.6 2-1.7 3.7-3.2 5l6.5 5.4C42.5 35.6 45 30.4 45 24c0-1.4-.2-2.7-.5-4z"/>
    </svg>
  );
}

/* ─────────────────────────────────────────────
   First-run API key setup
   ───────────────────────────────────────────── */
function ApiKeySetup({ user, onSave, onSignOut }) {
  const [key, setKey] = uSA("");
  const [show, setShow] = uSA(false);
  const [verifying, setVerifying] = uSA(false);
  const [verified, setVerified] = uSA(false);
  const [err, setErr] = uSA("");

  const verify = () => {
    setErr("");
    if (!key.trim()) return setErr("Paste your Gemini API key.");
    if (!/^AIza[\w-]{20,}$/.test(key.trim())) {
      return setErr("This doesn't look like a Gemini API key (expected to start with AIza…).");
    }
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
    }, 1000);
  };

  const save = () => {
    if (!verified) return verify();
    onSave(key.trim());
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-blob b1"/>
        <div className="auth-blob b2"/>
        <div className="auth-blob b3"/>
        <div className="auth-blob b4"/>
        <div className="auth-grid"/>
      </div>

      <div className="auth-shell wide">
        <div className="auth-stepbar">
          <div className="step done"><Ico.check size={12}/><span>Sign in</span></div>
          <div className="step-line"/>
          <div className="step active"><span className="step-num">2</span><span>Connect Gemini</span></div>
          <div className="step-line"/>
          <div className="step"><span className="step-num">3</span><span>Start coaching</span></div>
        </div>

        <div className="auth-card">
          <div className="who-row">
            <div className="who-avatar" style={{background: user.color}}>{user.initials}</div>
            <div>
              <div className="who-name">{user.name}</div>
              <div className="who-email mono">{user.email}</div>
            </div>
            <button className="ghost-btn sm" onClick={onSignOut}>Sign out</button>
          </div>

          <h1 className="auth-h1">Connect your Gemini API key</h1>
          <p className="auth-sub">
            GCP Sales Coach calls Gemini using <strong>your personal key</strong> from AI Studio —
            we don't share keys across users. You'll only do this once. You can change or revoke it
            anytime from <strong>Settings</strong>.
          </p>

          <div className="key-help">
            <div className="key-help-head">
              <Ico.bolt size={14}/>
              <span>How to get a key</span>
            </div>
            <ol>
              <li>Open <a href="#" className="link mono">aistudio.google.com/apikey</a></li>
              <li>Click <strong>Create API key</strong> → choose a Google Cloud project</li>
              <li>Copy the key (starts with <span className="mono">AIza…</span>) and paste it below</li>
            </ol>
          </div>

          <label className="auth-label">
            Gemini API key
            <div className="key-input">
              <input
                type={show ? "text" : "password"}
                placeholder="AIzaSy•••••••••••••••••••••••••"
                value={key}
                onChange={(e)=>{ setKey(e.target.value); setVerified(false); setErr(""); }}
                spellCheck={false}
                autoFocus
              />
              <button type="button" className="key-eye" onClick={()=>setShow(s=>!s)} title={show ? "Hide" : "Show"}>
                {show ? <Ico.eyeOff size={16}/> : <Ico.eye size={16}/>}
              </button>
            </div>
          </label>

          {err && <div className="auth-err"><Ico.alert size={14}/> {err}</div>}
          {verified && (
            <div className="auth-ok">
              <Ico.check size={14}/> Key verified · Gemini 2.5 Pro available
            </div>
          )}

          <div className="key-row">
            {!verified ? (
              <button className="pill-btn primary lg" onClick={verify} disabled={verifying || !key.trim()}>
                {verifying ? "Verifying…" : "Verify key"}
              </button>
            ) : (
              <button className="pill-btn primary lg" onClick={save}>
                <Ico.check size={14}/> Save & continue
              </button>
            )}
          </div>

          <div className="key-foot">
            <Ico.lock size={12}/>
            <span>Your key is stored locally on this device and never sent to our servers.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Settings page
   ───────────────────────────────────────────── */
function SettingsScreen({ user, apiKey, onSave, onSignOut, onClose }) {
  const [tab, setTab] = uSA("profile"); // profile | api | language | notifications
  const [draft, setDraft] = uSA({
    name: user.name,
    role: user.role || "Sr. Cloud SE",
    team: user.team || "EMEA Cloud Sales",
    timezone: user.timezone || "Europe/London (UTC+1)",
    language: user.language || "en",
    pace: user.pace || "balanced",
    autoSummary: user.autoSummary !== false,
    quietByDefault: user.quietByDefault === true,
  });
  const [keyDraft, setKeyDraft] = uSA(apiKey || "");
  const [showKey, setShowKey] = uSA(false);
  const [keyVerified, setKeyVerified] = uSA(true);
  const [savedFlash, setSavedFlash] = uSA(false);

  const set = (k, v) => setDraft(d => ({...d, [k]: v}));

  const save = () => {
    onSave({ profile: draft, apiKey: keyDraft });
    setSavedFlash(true);
    setTimeout(()=>setSavedFlash(false), 1600);
  };

  const tabs = [
    { id: "profile",       label: "Profile",       ico: "user" },
    { id: "api",           label: "Gemini API",    ico: "bolt" },
    { id: "language",      label: "Language",      ico: "globe" },
    { id: "notifications", label: "Coaching",      ico: "spark" },
  ];

  return (
    <div className="settings-page">
      <header className="settings-top">
        <button className="ghost-btn" onClick={onClose}>
          <Ico.chev size={14} style={{transform:"rotate(180deg)"}}/> Back
        </button>
        <div className="settings-title-wrap">
          <h1 className="settings-title">Settings</h1>
          <span className="settings-sub mono">{user.email}</span>
        </div>
        <div className="settings-top-actions">
          {savedFlash && <span className="saved-flash"><Ico.check size={12}/> Saved</span>}
          <button className="pill-btn primary sm" onClick={save}>Save changes</button>
        </div>
      </header>

      <div className="settings-body">
        <nav className="settings-nav">
          <div className="nav-user">
            <div className="who-avatar lg" style={{background: user.color}}>{user.initials}</div>
            <div className="nav-user-meta">
              <div className="nav-user-name">{draft.name}</div>
              <div className="nav-user-role">{draft.role}</div>
            </div>
          </div>
          <ul>
            {tabs.map(t => (
              <li key={t.id} className={tab===t.id ? "on" : ""} onClick={()=>setTab(t.id)}>
                {Ico[t.ico]({size:16})}<span>{t.label}</span>
              </li>
            ))}
          </ul>
          <button className="signout-btn" onClick={onSignOut}>
            <Ico.logout size={14}/> Sign out
          </button>
        </nav>

        <main className="settings-main">
          {tab === "profile" && (
            <section className="set-section">
              <h2>Profile</h2>
              <p className="set-section-sub">This is how you'll appear to teammates and on shared meeting summaries.</p>

              <div className="set-grid">
                <Field label="Full name">
                  <input value={draft.name} onChange={(e)=>set("name", e.target.value)}/>
                </Field>
                <Field label="Email" hint="From Google SSO — read-only">
                  <input value={user.email} readOnly className="ro mono"/>
                </Field>
                <Field label="Role">
                  <select value={draft.role} onChange={(e)=>set("role", e.target.value)}>
                    <option>Sr. Cloud SE</option>
                    <option>Cloud SE</option>
                    <option>Sales Manager</option>
                    <option>Account Executive</option>
                    <option>Customer Engineer</option>
                    <option>Solutions Architect</option>
                    <option>SE Manager</option>
                  </select>
                </Field>
                <Field label="Team">
                  <select value={draft.team} onChange={(e)=>set("team", e.target.value)}>
                    <option>EMEA Cloud Sales</option>
                    <option>NAMER Cloud Sales</option>
                    <option>APAC Cloud Sales</option>
                    <option>LATAM Cloud Sales</option>
                    <option>Strategic Accounts</option>
                  </select>
                </Field>
                <Field label="Time zone">
                  <select value={draft.timezone} onChange={(e)=>set("timezone", e.target.value)}>
                    <option>Europe/London (UTC+1)</option>
                    <option>Asia/Jerusalem (UTC+3)</option>
                    <option>America/New_York (UTC-4)</option>
                    <option>America/Los_Angeles (UTC-7)</option>
                    <option>Asia/Tokyo (UTC+9)</option>
                  </select>
                </Field>
              </div>
            </section>
          )}

          {tab === "api" && (
            <section className="set-section">
              <h2>Gemini API key</h2>
              <p className="set-section-sub">
                All Gemini requests from your device use this key. Replace it anytime — old keys are forgotten immediately.
              </p>

              <div className="key-status">
                <div className={"key-dot " + (keyVerified ? "ok" : "warn")}/>
                <div>
                  <div className="key-status-title">{keyVerified ? "Active key" : "Key needs verification"}</div>
                  <div className="key-status-sub mono">
                    {keyDraft ? keyDraft.slice(0,8) + "•".repeat(24) + keyDraft.slice(-4) : "—"}
                  </div>
                </div>
                <span className="meta-pill">{keyVerified ? "Gemini 2.5 Pro" : "Not verified"}</span>
              </div>

              <Field label="Replace key">
                <div className="key-input">
                  <input
                    type={showKey ? "text" : "password"}
                    placeholder="Paste a new AIza… key"
                    value={keyDraft}
                    onChange={(e)=>{ setKeyDraft(e.target.value); setKeyVerified(false); }}
                    spellCheck={false}
                  />
                  <button type="button" className="key-eye" onClick={()=>setShowKey(s=>!s)} title={showKey ? "Hide" : "Show"}>
                    {showKey ? <Ico.eyeOff size={16}/> : <Ico.eye size={16}/>}
                  </button>
                </div>
              </Field>

              <div className="key-actions">
                <button className="pill-btn sm" onClick={()=>setKeyVerified(true)}>
                  <Ico.check size={12}/> Verify
                </button>
                <button className="pill-btn ghost sm" onClick={()=>{setKeyDraft(""); setKeyVerified(false);}}>
                  <Ico.trash size={12}/> Remove key
                </button>
                <a className="link sm" href="#">Get a new key in AI Studio →</a>
              </div>

              <div className="set-callout">
                <Ico.lock size={14}/>
                <div>
                  <strong>Stored locally only.</strong> Your key never leaves this device.
                  Requests are made directly from the browser to <span className="mono">generativelanguage.googleapis.com</span>.
                </div>
              </div>

              <div className="set-callout warn">
                <Ico.alert size={14}/>
                <div>
                  Don't paste a key from a personal Google account if your project's billing isn't approved for sales-internal usage.
                </div>
              </div>
            </section>
          )}

          {tab === "language" && (
            <section className="set-section">
              <h2>Language</h2>
              <p className="set-section-sub">Sets the UI language. Live transcripts always include source language plus your interface language.</p>

              <Field label="Interface language">
                <div className="lang-grid">
                  {[
                    { code: "en",    label: "English",            flag: "🇬🇧", note: "Default" },
                    { code: "he",    label: "עברית",              flag: "🇮🇱", note: "RTL layout" },
                    { code: "es",    label: "Español",            flag: "🇪🇸" },
                    { code: "fr",    label: "Français",           flag: "🇫🇷" },
                    { code: "de",    label: "Deutsch",            flag: "🇩🇪" },
                    { code: "pt-br", label: "Português (Brasil)", flag: "🇧🇷" },
                    { code: "ja",    label: "日本語",              flag: "🇯🇵" },
                    { code: "ko",    label: "한국어",              flag: "🇰🇷" },
                    { code: "zh",    label: "中文 (简体)",         flag: "🇨🇳" },
                    { code: "ar",    label: "العربية",             flag: "🇸🇦", note: "RTL layout" },
                  ].map(l => (
                    <button
                      key={l.code}
                      className={"lang-card " + (draft.language===l.code ? "on" : "")}
                      onClick={()=>set("language", l.code)}
                    >
                      <span className="lang-flag">{l.flag}</span>
                      <div className="lang-meta">
                        <div className="lang-label">{l.label}</div>
                        <div className="lang-code mono">{l.code.toUpperCase()}{l.note ? " · " + l.note : ""}</div>
                      </div>
                      {draft.language===l.code && <span className="lang-check"><Ico.check size={12}/></span>}
                    </button>
                  ))}
                </div>
              </Field>

              <div className="set-callout">
                <Ico.globe size={14}/>
                <div>Hebrew &amp; Arabic flip the layout to RTL automatically.</div>
              </div>
            </section>
          )}

          {tab === "notifications" && (
            <section className="set-section">
              <h2>Coaching behavior</h2>
              <p className="set-section-sub">Tune how the coach behaves during your meetings.</p>

              <Field label="Hint pace">
                <div className="seg seg-lg">
                  {[
                    {v:"sparse",   label:"Sparse",   sub:"Only high-confidence"},
                    {v:"balanced", label:"Balanced", sub:"Default"},
                    {v:"chatty",   label:"Chatty",   sub:"Surface everything"},
                  ].map(o => (
                    <button key={o.v} className={draft.pace===o.v ? "on" : ""} onClick={()=>set("pace", o.v)}>
                      <div className="seg-label">{o.label}</div>
                      <div className="seg-sub">{o.sub}</div>
                    </button>
                  ))}
                </div>
              </Field>

              <ToggleRow
                title="Auto-generate post-meeting summary"
                sub="Internal notes + draft client email written within 10 seconds of meeting end."
                value={draft.autoSummary}
                onChange={v=>set("autoSummary", v)}
              />
              <ToggleRow
                title="Start in Quiet mode by default"
                sub="Coach listens but only delivers hints when you ask."
                value={draft.quietByDefault}
                onChange={v=>set("quietByDefault", v)}
              />
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="set-field">
      <div className="set-field-top">
        <span className="set-field-label">{label}</span>
        {hint && <span className="set-field-hint">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

function ToggleRow({ title, sub, value, onChange }) {
  return (
    <div className="toggle-row" onClick={()=>onChange(!value)}>
      <div>
        <div className="toggle-row-title">{title}</div>
        <div className="toggle-row-sub">{sub}</div>
      </div>
      <div className={"toggle " + (value ? "on" : "")}>
        <div className="toggle-knob"/>
      </div>
    </div>
  );
}

window.SignInScreen = SignInScreen;
window.ApiKeySetup = ApiKeySetup;
window.SettingsScreen = SettingsScreen;

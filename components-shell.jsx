/* global React, Ico */
const { useState: uS1, useEffect: uE1, useRef: uR1 } = React;

/* ───────────── App Header ───────────── */
function AppHeader({ meeting, onToggleListening, listening, muted, onToggleMute, lang, setLang, theme, setTheme }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="brand">
          <img src="assets/supercloud-mark.svg" alt="SuperCloud" width="28" height="28"/>
          <div className="brand-text">
            <div className="brand-name">SuperCloud</div>
            <div className="brand-sub">Sales Coach <span className="brand-tag">Internal</span></div>
          </div>
        </div>

        <div className="meeting-chip">
          <div className="meeting-chip-dot" />
          <div>
            <div className="meeting-chip-title">{meeting.client.name} · {meeting.client.deal}</div>
            <div className="meeting-chip-sub">{meeting.client.industry} · {meeting.client.region}</div>
          </div>
          <button className="meeting-chip-edit" title="Switch meeting">
            <Ico.chev />
          </button>
        </div>
      </div>

      <div className="topbar-center">
        <div className="status-bar">
          <span className="live-dot" />
          <span className="status-bar-label">LIVE</span>
          <span className="status-bar-time">23:14</span>
          <span className="status-bar-sep" />
          <span className="status-bar-meta"><Ico.globe size={14}/> Gemini Live · he-IL → en-US</span>
          <span className="status-bar-sep" />
          <span className="status-bar-meta"><Ico.bolt size={14}/> 142ms</span>
        </div>
      </div>

      <div className="topbar-right">
        <div className="seg">
          <button className={lang==="en"?"on":""} onClick={()=>setLang("en")}>EN</button>
          <button className={lang==="he"?"on":""} onClick={()=>setLang("he")}>עב</button>
          <button className={lang==="bi"?"on":""} onClick={()=>setLang("bi")}>EN/עב</button>
        </div>

        <button className="icon-btn" title="Toggle theme" onClick={()=>setTheme(theme==="dark"?"light":"dark")}>
          {theme==="dark"
            ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
            : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>}
        </button>

        <button className={"pill-btn " + (muted?"pill-muted":"")} onClick={onToggleMute}>
          {muted ? <Ico.micOff size={16}/> : <Ico.mic size={16}/>}
          <span>{muted ? "Listening muted" : "Mute listening"}</span>
        </button>

        <button className={"pill-btn primary " + (listening?"recording":"")} onClick={onToggleListening}>
          {listening ? <Ico.stop size={14}/> : <Ico.play size={14}/>}
          <span>{listening ? "End meeting" : "Start listening"}</span>
        </button>

        <div className="avatar-me" title="Noa Levi">NL</div>
      </div>
    </header>
  );
}

/* ───────────── Left rail: Context + Goal ───────────── */
function ContextRail({ meeting }) {
  return (
    <aside className="rail">
      {/* Screen share preview — top */}
      <ScreenSharePreview />

      {/* Goal */}
      <section className="card">
        <div className="card-head">
          <div className="card-title"><Ico.spark size={16}/> Meeting goal</div>
          <button className="ghost-btn"><Ico.copy size={14}/></button>
        </div>
        <p className="goal-text">{meeting.goal}</p>
        <div className="goal-tags">
          <span className="tag tag-blue">Vertex AI</span>
          <span className="tag tag-yellow">Cost</span>
          <span className="tag tag-red">Latency</span>
        </div>
      </section>

      {/* Participants */}
      <section className="card">
        <div className="card-head">
          <div className="card-title"><Ico.user size={16}/> In the room</div>
          <span className="card-meta">3</span>
        </div>
        <ul className="people">
          {meeting.participants.map((p, i) => (
            <li key={i}>
              <div className="ppl-avatar" style={{ background: p.color }}>{p.initials}</div>
              <div className="ppl-info">
                <div className="ppl-name">{p.name}</div>
                <div className="ppl-role">{p.role}</div>
              </div>
              {p.side === "client" && i === 0 && (
                <div className="ppl-speaking" title="Currently speaking">
                  <span className="wave-bar" style={{animationDelay:"0ms"}}/>
                  <span className="wave-bar" style={{animationDelay:"120ms"}}/>
                  <span className="wave-bar" style={{animationDelay:"240ms"}}/>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Pre-loaded context */}
      <section className="card">
        <div className="card-head">
          <div className="card-title"><Ico.notebook size={16}/> Pinned context</div>
          <button className="ghost-btn">+ Add</button>
        </div>
        <ul className="ctx-list">
          {meeting.context.map((c, i) => (
            <li key={i}>
              <div className={"ctx-icon ctx-" + c.kind}>
                {c.kind==="url" ? <Ico.globe size={14}/> : c.kind==="doc" ? <Ico.doc size={14}/> : <Ico.brain size={14}/>}
              </div>
              <div>
                <div className="ctx-label">{c.label}</div>
                <div className="ctx-note">{c.note}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>

    </aside>
  );
}

/* ───────────── Screen share preview tile ───────────── */
function ScreenSharePreview() {
  return (
    <section className="share-card">
      <div className="share-head">
        <div className="share-title"><Ico.monitor size={14}/> Shared meeting window</div>
        <span className="share-status"><span className="dot" style={{background:"var(--gc-green)"}}/> Capturing audio</span>
      </div>
      <div className="share-frame">
        {/* Fake "Meet" tile — original UI, just colored panes representing video tiles */}
        <div className="share-stage">
          <div className="share-tile share-tile-main">
            <div className="share-tile-avatar" style={{background:"linear-gradient(135deg,#EA4335,#F9AB00)"}}>YB</div>
            <div className="share-tile-name">Yael Ben-David <span className="dot speaking-dot"/></div>
            <div className="share-tile-corner"><Ico.mic size={12}/></div>
          </div>
          <div className="share-side">
            <div className="share-tile">
              <div className="share-tile-avatar small" style={{background:"linear-gradient(135deg,#F9AB00,#EA4335)"}}>DC</div>
              <div className="share-tile-name small">Daniel C.</div>
            </div>
            <div className="share-tile">
              <div className="share-tile-avatar small" style={{background:"linear-gradient(135deg,#1A73E8,#34A853)"}}>NL</div>
              <div className="share-tile-name small">You</div>
              <div className="share-self-badge">You</div>
            </div>
          </div>
        </div>
        <div className="share-toolbar">
          <span className="share-tool-pill"><Ico.mic size={12}/></span>
          <span className="share-tool-pill"><Ico.monitor size={12}/></span>
          <span className="share-tool-pill end"><Ico.close size={12}/></span>
          <span className="share-tool-time">23:14</span>
        </div>
      </div>
      <div className="share-foot">
        <span className="share-source">Source: <span className="mono">Chrome — “Aviv ↔ SuperCloud”</span></span>
        <button className="ghost-btn">Switch</button>
      </div>
    </section>
  );
}

window.AppHeader = AppHeader;
window.ContextRail = ContextRail;

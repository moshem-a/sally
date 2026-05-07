/* global React, Ico */
const { useState: uS3, useEffect: uE3, useRef: uR3, useMemo: uM3 } = React;

/* ───────────── Right column: Hints + Follow-ups + Sentiment ───────────── */
function CoachColumn({ hints, followups, sentiment, sentimentEvents }) {
  const [tab, setTab] = uS3("hints");
  const [actedOn, setActedOn] = uS3({});
  const [pinned, setPinned] = uS3({});

  return (
    <section className="panel coach-panel">
      <div className="panel-head">
        <div className="seg seg-tabs">
          <button className={tab==="hints"?"on":""} onClick={()=>setTab("hints")}>
            <Ico.spark size={14}/> Hints <span className="tab-count">{hints.length}</span>
          </button>
          <button className={tab==="followups"?"on":""} onClick={()=>setTab("followups")}>
            <Ico.question size={14}/> Follow-ups <span className="tab-count">{followups.length}</span>
          </button>
          <button className={tab==="sentiment"?"on":""} onClick={()=>setTab("sentiment")}>
            <Ico.trend size={14}/> Sentiment
          </button>
        </div>
        <button className="ghost-btn"><Ico.filter size={14}/> Filter</button>
      </div>

      <div className="coach-scroll scroll">
        {tab === "hints" && (
          <>
            {hints.map((h, i) => (
              <HintCard
                key={h.id}
                hint={h}
                pinned={!!pinned[h.id]}
                acted={!!actedOn[h.id]}
                onPin={() => setPinned(p => ({...p, [h.id]: !p[h.id]}))}
                onAct={() => setActedOn(a => ({...a, [h.id]: true}))}
                style={{ animationDelay: (i*60)+"ms" }}
              />
            ))}
            <div className="hint-thinking hint-in">
              <div className="ht-row">
                <span className="dot dot-pulse" style={{background:"var(--gc-blue)"}}/>
                <span className="dot dot-pulse" style={{background:"var(--gc-blue)", animationDelay:"160ms"}}/>
                <span className="dot dot-pulse" style={{background:"var(--gc-blue)", animationDelay:"320ms"}}/>
                <span className="ht-label">Listening for new entities…</span>
              </div>
            </div>
          </>
        )}

        {tab === "followups" && <FollowupList followups={followups}/>}

        {tab === "sentiment" && <SentimentView series={sentiment} events={sentimentEvents}/>}
      </div>
    </section>
  );
}

/* ───────────── Hint card ───────────── */
function HintCard({ hint, pinned, acted, onPin, onAct, style }) {
  const [open, setOpen] = uS3(true);
  const colorMap = {
    blue:   { tint: "var(--gc-blue-50)",   strong: "var(--gc-blue)",   label: "Competitive" },
    red:    { tint: "var(--gc-red-50)",    strong: "var(--gc-red)",    label: "Problem→Solution" },
    yellow: { tint: "var(--gc-yellow-50)", strong: "var(--gc-yellow)", label: "Commercial" },
    green:  { tint: "var(--gc-green-50)",  strong: "var(--gc-green)",  label: "Positive" },
  };
  const c = colorMap[hint.color];

  return (
    <article className={"hint-card hint-in " + (acted ? "is-acted" : "")} style={style}>
      <div className="hint-rail" style={{background: c.strong}}/>
      <div className="hint-body">
        <header className="hint-head">
          <div className="hint-cat" style={{background: c.tint, color: c.strong}}>
            <Ico.spark size={12}/> {hint.category}
          </div>
          <div className="hint-meta mono">@ {hint.timestamp}</div>
          <div className="hint-confidence" title="Confidence">
            <span className="conf-bar"><span style={{width: (hint.confidence*100)+"%", background: c.strong}}/></span>
            <span className="conf-num mono">{Math.round(hint.confidence*100)}%</span>
          </div>
          <button className={"icon-btn xs " + (pinned ? "active" : "")} onClick={onPin} title="Pin">
            <Ico.pin size={14}/>
          </button>
        </header>

        <h3 className="hint-title">{hint.title}</h3>
        <p className="hint-summary">{hint.summary}</p>

        {open && (
          <ul className="hint-points">
            {hint.proofPoints.map((p, i) => (
              <li key={i}><span className="hp-dot" style={{background: c.strong}}/>{p}</li>
            ))}
          </ul>
        )}

        <div className="hint-sources">
          {hint.sources.map(s => (
            <span key={s} className="src-chip"><Ico.doc size={12}/> {s}</span>
          ))}
        </div>

        <footer className="hint-foot">
          <div className="hint-foot-actions">
            <button className="ghost-btn" onClick={()=>setOpen(o=>!o)}>
              {open ? "Collapse" : "Expand"}
            </button>
            <button className="ghost-btn"><Ico.copy size={14}/> Copy</button>
            <button className="ghost-btn">Send to Drive</button>
          </div>
          <div className="hint-foot-feedback">
            <button className={"icon-btn xs " + (acted ? "active-good" : "")} onClick={onAct} title="Used this">
              <Ico.thumbUp size={14}/>
            </button>
            <button className="icon-btn xs" title="Not relevant"><Ico.thumbDn size={14}/></button>
          </div>
        </footer>
        {acted && <div className="acted-stripe"><Ico.check size={12}/> Marked as used in conversation</div>}
      </div>
    </article>
  );
}

/* ───────────── Follow-ups ───────────── */
function FollowupList({ followups }) {
  const [used, setUsed] = uS3({});
  return (
    <div className="fu-wrap">
      <p className="fu-intro">Suggested questions, ranked by likelihood of unlocking a buying signal. Tap to mark as asked.</p>
      <ul className="fu-list">
        {followups.map((q, i) => (
          <li
            key={i}
            className={"fu-item " + (used[i] ? "fu-used" : "")}
            onClick={() => setUsed(u => ({...u, [i]: !u[i]}))}
          >
            <div className="fu-num mono">{String(i+1).padStart(2,"0")}</div>
            <div className="fu-text">{q}</div>
            <button className="ghost-btn fu-act">
              {used[i] ? <><Ico.check size={14}/> Asked</> : <>Mark asked</>}
            </button>
          </li>
        ))}
      </ul>
      <button className="dashed-btn"><Ico.spark size={14}/> Generate more from current context</button>
    </div>
  );
}

/* ───────────── Sentiment ───────────── */
function SentimentView({ series, events }) {
  const max = 100, min = 0;
  const w = 380, h = 140, pad = 8;
  const xs = i => pad + (i / (series.length - 1)) * (w - pad*2);
  const ys = v => h - pad - ((v - min) / (max - min)) * (h - pad*2);
  const path = series.map((v, i) => (i===0?"M":"L") + xs(i).toFixed(1) + " " + ys(v).toFixed(1)).join(" ");
  const area = path + ` L ${xs(series.length-1).toFixed(1)} ${h-pad} L ${pad} ${h-pad} Z`;
  const last = series[series.length-1];

  return (
    <div className="sent-wrap">
      <div className="sent-row">
        <div className="sent-stat">
          <div className="sent-stat-label">Engagement</div>
          <div className="sent-stat-val" style={{color:"var(--gc-green)"}}>{last}<span>/100</span></div>
          <div className="sent-stat-trend"><Ico.trend size={12}/> +24 since opening</div>
        </div>
        <div className="sent-stat">
          <div className="sent-stat-label">Tone</div>
          <div className="sent-stat-val">Confident</div>
          <div className="sent-stat-trend">Pace +12% · steady</div>
        </div>
        <div className="sent-stat">
          <div className="sent-stat-label">Hesitation</div>
          <div className="sent-stat-val" style={{color:"var(--gc-yellow)"}}>Low</div>
          <div className="sent-stat-trend">2 fillers · last @ 01:18</div>
        </div>
      </div>

      <div className="sent-chart-card">
        <div className="sent-chart-head">
          <span className="sent-chart-title">Client engagement over time</span>
          <span className="mono sent-chart-x">00:00 → 23:14</span>
        </div>
        <svg viewBox={`0 0 ${w} ${h}`} className="sent-chart">
          <defs>
            <linearGradient id="sentGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--gc-blue)" stopOpacity=".35"/>
              <stop offset="100%" stopColor="var(--gc-blue)" stopOpacity="0"/>
            </linearGradient>
          </defs>
          {[25,50,75].map(g => (
            <line key={g} x1={pad} x2={w-pad} y1={ys(g)} y2={ys(g)} stroke="var(--border-soft)" strokeDasharray="2 4"/>
          ))}
          <path d={area} fill="url(#sentGrad)"/>
          <path d={path} stroke="var(--gc-blue)" strokeWidth="2" fill="none"/>
          {events.map((e, i) => (
            <g key={i} transform={`translate(${xs(e.at)} ${ys(series[e.at])})`}>
              <circle r="4" fill={
                e.kind === "positive" ? "var(--gc-green)" :
                e.kind === "buying"   ? "var(--gc-blue)" :
                e.kind === "concern"  ? "var(--gc-yellow)" :
                                        "var(--text-4)"
              }/>
              <circle r="9" fill="none" stroke={
                e.kind === "positive" ? "var(--gc-green)" :
                e.kind === "buying"   ? "var(--gc-blue)" :
                e.kind === "concern"  ? "var(--gc-yellow)" :
                                        "var(--text-4)"
              } strokeOpacity=".25"/>
            </g>
          ))}
        </svg>
        <ul className="sent-events">
          {events.map((e, i) => (
            <li key={i} className={"sent-ev sent-ev-" + e.kind}>
              <span className="sent-ev-dot" style={{background:
                e.kind === "positive" ? "var(--gc-green)" :
                e.kind === "buying"   ? "var(--gc-blue)" :
                e.kind === "concern"  ? "var(--gc-yellow)" :
                                        "var(--text-4)"
              }}/>
              <span className="sent-ev-label">{e.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="sent-flag">
        <div className="sent-flag-icon" style={{background:"var(--gc-green-50)", color:"var(--gc-green)"}}>
          <Ico.alert size={14}/>
        </div>
        <div>
          <div className="sent-flag-title">Buying signal detected</div>
          <div className="sent-flag-sub">“…it has to happen this quarter. The board is pushing.” — confidence elevated, urgency present. Consider asking about decision-makers and procurement timeline.</div>
        </div>
      </div>
    </div>
  );
}

window.CoachColumn = CoachColumn;

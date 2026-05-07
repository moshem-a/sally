/* global React, Ico, SUMMARY, TEAM */
const { useState: uSS, useRef: uRS, useMemo: uMS } = React;

/* ───────────── End-meeting summary screen ───────────── */
function SummaryScreen({ onBack, onShare, summary }) {
  const data = summary || SUMMARY;
  const [tab, setTab] = uSS("internal");
  const [shareOpen, setShareOpen] = uSS(false);
  const [emailSent, setEmailSent] = uSS(false);

  React.useEffect(() => {
    const prev = document.title;
    document.title = (data.meeting.title || "Meeting Summary") + " — " + data.meeting.client + " — SuperCloud";
    return () => { document.title = prev; };
  }, [data]);

  return (
    <div className="summary">
      <header className="topbar">
        <div className="topbar-left">
          <button className="icon-btn" onClick={onBack}><Ico.chev size={18} style={{transform:"rotate(180deg)"}}/></button>
          <div className="brand">
            <img src="assets/supercloud-mark.svg" alt="" width="28" height="28"/>
            <div className="brand-text">
              <div className="brand-name">{data.meeting.title || "Meeting summary"}</div>
              <div className="brand-sub">{data.meeting.client} · {data.meeting.date} · {data.meeting.duration}</div>
            </div>
          </div>
        </div>
        <div className="topbar-center">
          <div className="seg seg-tabs">
            <button className={tab==="internal"?"on":""} onClick={()=>setTab("internal")}>
              <Ico.brain size={14}/> Internal summary
            </button>
            <button className={tab==="client"?"on":""} onClick={()=>setTab("client")}>
              <Ico.send size={14}/> Client email
            </button>
            <button className={tab==="transcript"?"on":""} onClick={()=>setTab("transcript")}>
              <Ico.notebook size={14}/> Full transcript
            </button>
          </div>
        </div>
        <div className="topbar-right">
          <button className="ghost-btn"><Ico.copy size={14}/> Export PDF</button>
          <button className="pill-btn" onClick={()=>setShareOpen(true)}>
            <Ico.share size={14}/> Share
          </button>
          <div className="avatar-me">NL</div>
        </div>
      </header>

      <div className="sum-end-banner">
        <div className="sum-end-icon"><Ico.check size={18}/></div>
        <div>
          <div className="sum-end-title">Meeting ended · summaries generated in 4.2s</div>
          <div className="sum-end-sub">Audio discarded per privacy policy. Transcript and summary stored in your workspace.</div>
        </div>
        <div className="sum-end-actions">
          <button className="ghost-btn">Undo end</button>
        </div>
      </div>

      <div className="sum-body">
        {tab === "internal" && <InternalSummary data={data}/>}
        {tab === "client"   && <ClientEmail data={data} emailSent={emailSent} setEmailSent={setEmailSent}/>}
        {tab === "transcript" && <FullTranscript/>}
      </div>

      {shareOpen && <ShareModal data={data} onClose={()=>setShareOpen(false)}/>}
    </div>
  );
}

/* ───────── Internal ───────── */
function InternalSummary({ data }) {
  const s = data.internal;
  return (
    <div className="sum-grid">
      <main className="sum-main">
        <section className="sum-card">
          <div className="sum-card-head">
            <h3 className="sum-h3">At a glance</h3>
            <span className="sum-meta mono">Confidence {Math.round(s.confidence*100)}%</span>
          </div>
          <div className="glance-row">
            <div className="glance-tile">
              <div className="glance-label">Score</div>
              <div className="glance-val" style={{color:"var(--gc-green)"}}>{s.score}<span>/100</span></div>
              <div className="glance-foot"><Ico.trend size={12}/> Above your average (78)</div>
            </div>
            <div className="glance-tile">
              <div className="glance-label">Deal health</div>
              <div className="glance-val" style={{color:"var(--gc-yellow)"}}>Warm</div>
              <div className="glance-foot">Buying signal at 22:34</div>
            </div>
            <div className="glance-tile">
              <div className="glance-label">Hints surfaced</div>
              <div className="glance-val">14<span> · 9 used</span></div>
              <div className="glance-foot">64% acted-on rate</div>
            </div>
            <div className="glance-tile">
              <div className="glance-label">Sentiment arc</div>
              <div className="glance-val"><Ico.trend size={20}/> +24</div>
              <div className="glance-foot">Started cool, ended engaged</div>
            </div>
          </div>
        </section>

        <section className="sum-card">
          <div className="sum-card-head"><h3 className="sum-h3"><span className="dot" style={{background:"var(--gc-green)"}}/> What went well</h3></div>
          <ul className="sum-list">{s.wentWell.map((x,i)=> <li key={i}>{x}</li>)}</ul>
        </section>

        <section className="sum-card">
          <div className="sum-card-head"><h3 className="sum-h3"><span className="dot" style={{background:"var(--gc-yellow)"}}/> Where to push deeper</h3></div>
          <ul className="sum-list">{s.couldImprove.map((x,i)=> <li key={i}>{x}</li>)}</ul>
        </section>

        <section className="sum-card">
          <div className="sum-card-head"><h3 className="sum-h3">Stated vs. actual needs</h3></div>
          <div className="needs-row">
            <div className="needs-col">
              <div className="needs-kicker">CLIENT STATED</div>
              {s.needs.stated.map((n,i)=> <div key={i} className="needs-item needs-stated">{n}</div>)}
            </div>
            <div className="needs-arrow"><Ico.chev size={16}/></div>
            <div className="needs-col">
              <div className="needs-kicker" style={{color:"var(--gc-blue)"}}>COACH INFERRED</div>
              {s.needs.actual.map((n,i)=> <div key={i} className="needs-item needs-actual">{n}</div>)}
            </div>
          </div>
        </section>

        <section className="sum-card">
          <div className="sum-card-head"><h3 className="sum-h3">Action items</h3><span className="sum-meta">{s.actionItems.length} items</span></div>
          <ul className="action-list">
            {s.actionItems.map((a, i) => (
              <li key={i}>
                <input type="checkbox" defaultChecked={i===0}/>
                <div className="action-who">{a.who}</div>
                <div className="action-what">{a.what}</div>
                <div className="action-due mono">{a.due}</div>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <aside className="sum-aside">
        <section className="sum-card">
          <div className="sum-card-head"><h3 className="sum-h3"><Ico.trend size={14}/> Upsell opportunities</h3></div>
          {s.upsell.map((u,i)=> (
            <div key={i} className="upsell-item">
              <div className="upsell-name">{u.name}</div>
              <div className="upsell-reason">{u.reason}</div>
            </div>
          ))}
        </section>

        <section className="sum-card">
          <div className="sum-card-head"><h3 className="sum-h3"><Ico.alert size={14}/> Risks</h3></div>
          <ul className="risk-list">
            {s.risks.map((r,i)=> <li key={i}><span className="risk-dot"/>{r}</li>)}
          </ul>
        </section>

        <section className="sum-card">
          <div className="sum-card-head"><h3 className="sum-h3">Top moments</h3></div>
          <ol className="moment-list">
            <li><span className="mono">22:34</span><div><b>Buying signal</b> — “board is pushing for Q2”</div></li>
            <li><span className="mono">11:02</span><div><b>Cost reveal</b> — $38K/mo on Bedrock</div></li>
            <li><span className="mono">04:18</span><div><b>Latency pain</b> — 1.8–2.2s p95</div></li>
            <li><span className="mono">29:41</span><div><b>Versioning friction</b> — risk vs. research</div></li>
          </ol>
        </section>
      </aside>
    </div>
  );
}

/* ───────── Client email ───────── */
function ClientEmail({ data, emailSent, setEmailSent }) {
  const e = data.client;
  const [tone, setTone] = uSS("formal");
  return (
    <div className="email-wrap">
      <div className="email-controls">
        <div className="email-controls-left">
          <span className="email-kicker">TONE</span>
          <div className="seg seg-sm">
            <button className={tone==="formal"?"on":""} onClick={()=>setTone("formal")}>Formal</button>
            <button className={tone==="warm"?"on":""}   onClick={()=>setTone("warm")}>Warm</button>
            <button className={tone==="brief"?"on":""}  onClick={()=>setTone("brief")}>Brief</button>
          </div>
          <button className="ghost-btn"><Ico.spark size={14}/> Regenerate</button>
        </div>
        <div className="email-controls-right">
          <button className={"pill-btn primary " + (emailSent ? "sent" : "")} onClick={()=>setEmailSent(true)}>
            {emailSent ? <><Ico.check size={14}/> Copied to clipboard</> : <><Ico.copy size={14}/> Copy summary</>}
          </button>
        </div>
      </div>

      <div className="email-card">
        <div className="email-head">
          <div className="email-row"><span className="email-lbl">To</span>
            <div className="email-chips">
              <span className="email-chip">Yael Ben-David ‹yael@avivcapital.com›</span>
              <span className="email-chip">Daniel Cohen ‹daniel@avivcapital.com›</span>
            </div>
          </div>
          <div className="email-row"><span className="email-lbl">Cc</span>
            <div className="email-chips">
              <span className="email-chip email-chip-internal">Tomer Avraham (manager)</span>
              <button className="ghost-btn">+ Add</button>
            </div>
          </div>
          <div className="email-row"><span className="email-lbl">Subject</span>
            <input className="email-subject" defaultValue={e.subject}/>
          </div>
        </div>

        <div className="email-body">
          <p>{e.greeting}</p>
          {e.body.map((p, i) => (
            <p key={i} dangerouslySetInnerHTML={{__html: p
              .replace(/^\*\*(.*?)\*\*/m, '<strong>$1</strong>')
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\n/g, '<br/>')
            }}/>
          ))}
          <p style={{whiteSpace:"pre-line"}}>{e.signoff}</p>
        </div>

        <div className="email-refs">
          <div className="email-refs-head">
            <Ico.globe size={14}/> Reference links from cloud.google.com
            <span className="email-refs-meta">Auto-suggested · click to toggle inclusion</span>
          </div>
          <ReferenceLinks data={data}/>
        </div>

        <div className="email-attach">
          <div className="email-attach-head">Attachments (auto-suggested)</div>
          <div className="email-attach-row">
            <div className="email-attach-card">
              <Ico.doc size={14}/> Latency benchmark — europe-west4 vs us-east-1.pdf
            </div>
            <div className="email-attach-card">
              <Ico.doc size={14}/> Model Garden one-pager.pdf
            </div>
            <button className="dashed-btn dashed-sm">+ Add attachment</button>
          </div>
        </div>
      </div>

      <div className="email-foot-note">
        <Ico.alert size={14}/> This email contains no internal notes, scoring, or competitive analysis. Internal summary stays private.
      </div>
    </div>
  );
}

/* ───────── Reference links ───────── */
function ReferenceLinks({ data }) {
  const refs = (data && data.references) || [];
  const [included, setIncluded] = uSS(() => refs.reduce((a, r, i) => ({...a, [i]: i < 4}), {}));
  const count = Object.values(included).filter(Boolean).length;
  return (
    <>
      <ul className="ref-list">
        {refs.map((r, i) => (
          <li key={i} className={"ref-item " + (included[i] ? "on" : "")}>
            <button className={"check-btn " + (included[i] ? "on" : "")}
              onClick={()=>setIncluded(s => ({...s, [i]: !s[i]}))}>
              {included[i] ? <Ico.check size={12}/> : null}
            </button>
            <div className="ref-icon"><Ico.globe size={14}/></div>
            <div className="ref-info">
              <div className="ref-title">{r.title}</div>
              <div className="ref-href mono">{r.href}</div>
            </div>
            <span className="ref-source">{r.source}</span>
          </li>
        ))}
      </ul>
      <div className="ref-foot">
        <span>{count} of {refs.length} included in email</span>
        <button className="ghost-btn"><Ico.spark size={14}/> Suggest more</button>
      </div>
    </>
  );
}

/* ───────── Transcript stub ───────── */
function FullTranscript() {
  return (
    <div className="ft-wrap">
      <div className="ft-head">
        <div className="search-box">
          <Ico.search size={14}/>
          <input placeholder="Search transcript…"/>
        </div>
        <div className="seg seg-sm">
          <button className="on">English</button>
          <button>עברית</button>
          <button>Both</button>
        </div>
      </div>
      <div className="ft-body">
        <div className="ft-line"><span className="mono ft-time">00:42</span><b style={{color:"#EA4335"}}>Yael:</b> So as I said, we're currently running our models on Bedrock — it works, but we have significant latency issues from European customers.</div>
        <div className="ft-line"><span className="mono ft-time">00:58</span><b style={{color:"#1A73E8"}}>Noa:</b> Got it. When you say significant — what range are we looking at, p95?</div>
        <div className="ft-line"><span className="mono ft-time">01:04</span><b style={{color:"#EA4335"}}>Yael:</b> Around 1.8 to 2.2 seconds end-to-end. Honestly anything above one second feels broken for our traders.</div>
        <div className="ft-line"><span className="mono ft-time">01:18</span><b style={{color:"#F9AB00"}}>Daniel:</b> And the price on Claude Sonnet has started climbing. We're already at $38K/month just on inference, before fine-tuning.</div>
        <div className="ft-line"><span className="mono ft-time">22:34</span><b style={{color:"#EA4335"}}>Yael:</b> Look — if we migrate, it has to happen this quarter. The board is pushing.</div>
        <div className="ft-fade"/>
      </div>
    </div>
  );
}

/* ───────── Share modal ───────── */
function ShareModal({ data, onClose }) {
  // Pre-pick Tomer (from suggested teammates)
  const tomer = TEAM.find(t => t.name === "Tomer Avraham");
  const [picked, setPicked] = uSS(tomer ? [tomer] : []);
  const [query, setQuery] = uSS("");
  const [showSuggest, setShowSuggest] = uSS(false);
  const [highlight, setHighlight] = uSS(0);
  const [permission, setPermission] = uSS("view");
  const [link, setLink] = uSS(false);
  const inputRef = uRS(null);

  // Autocomplete pool: full team + email-domain suggestions
  const matches = uMS(() => {
    const q = query.trim().toLowerCase();
    const taken = new Set(picked.map(p => p.email));
    const teamMatches = TEAM.filter(t => !t.you && !taken.has(t.email))
      .filter(t => !q || (t.name + " " + t.email + " " + t.role).toLowerCase().includes(q))
      .slice(0, 5);

    // If user typed something email-like, offer it as a "send to email" option
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(q);
    const externalGuess = q && !isEmail && q.length > 2
      ? [{ name: q, email: q + "@google.com", role: "External email", initials: q.slice(0,2).toUpperCase(), color: "#5F6368", external: true }]
      : [];
    const emailDirect = isEmail && !taken.has(q)
      ? [{ name: q, email: q, role: q.endsWith("@google.com") ? "Google.com" : "External", initials: q.slice(0,2).toUpperCase(), color: q.endsWith("@google.com") ? "#1A73E8" : "#5F6368", external: !q.endsWith("@google.com") }]
      : [];

    return [...teamMatches, ...emailDirect, ...externalGuess].slice(0, 6);
  }, [query, picked]);

  const addPerson = (person) => {
    setPicked(p => p.find(x => x.email === person.email) ? p : [...p, person]);
    setQuery("");
    setShowSuggest(false);
    setHighlight(0);
    setTimeout(()=>inputRef.current && inputRef.current.focus(), 0);
  };
  const removePerson = (email) => setPicked(p => p.filter(x => x.email !== email));

  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlight(h => Math.min(h+1, matches.length-1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlight(h => Math.max(h-1, 0)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (matches[highlight]) addPerson(matches[highlight]);
    }
    else if (e.key === "Backspace" && !query && picked.length) {
      removePerson(picked[picked.length-1].email);
    }
    else if (e.key === "Escape") { setShowSuggest(false); }
  };

  const count = picked.length;
  const SUGGESTED = TEAM.filter(t => !t.you && !picked.find(p=>p.email===t.email)).slice(0, 4);

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal share-modal-v2" onClick={e=>e.stopPropagation()}>
        <div className="modal-head">
          <div className="share-modal-meeting">
            <div className="share-pop-avatar" style={{background: data.meeting.avatar || "#1A73E8"}}>
              {data.meeting.client.slice(0,1)}
            </div>
            <div>
              <h3 className="modal-title">Share meeting</h3>
              <p className="modal-sub">{data.meeting.client} · {data.meeting.date}</p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><Ico.close size={18}/></button>
        </div>

        <div className="modal-body">
          {/* Autocomplete people picker */}
          <div className="share-modal-section">
            <div className="share-field-label">Add people by name or email</div>
            <div className="ac-wrap">
              <div className="ac-field" onClick={()=>{ inputRef.current && inputRef.current.focus(); setShowSuggest(true); }}>
                {picked.map(p => (
                  <span key={p.email} className="ac-chip">
                    <span className="ac-chip-dot" style={{background: p.color}}>{p.initials}</span>
                    <span className="ac-chip-name">{p.name}</span>
                    {p.external && <span className="ac-chip-ext" title="External email">EXT</span>}
                    <button className="ac-chip-x" onClick={(e)=>{e.stopPropagation(); removePerson(p.email);}} aria-label="Remove">
                      <Ico.close size={10}/>
                    </button>
                  </span>
                ))}
                <input
                  ref={inputRef}
                  className="ac-input"
                  value={query}
                  placeholder={picked.length ? "Add another…" : "Type a name, or paste email — e.g. lior@google.com"}
                  onChange={(e)=>{ setQuery(e.target.value); setShowSuggest(true); setHighlight(0); }}
                  onFocus={()=>setShowSuggest(true)}
                  onKeyDown={onKey}
                />
              </div>

              {showSuggest && matches.length > 0 && (
                <ul className="ac-suggest">
                  {matches.map((m, i) => (
                    <li key={m.email}
                        className={i===highlight ? "on" : ""}
                        onMouseEnter={()=>setHighlight(i)}
                        onMouseDown={(e)=>{ e.preventDefault(); addPerson(m); }}>
                      <div className="ppl-avatar" style={{background:m.color}}>{m.initials}</div>
                      <div className="ppl-info">
                        <div className="ppl-name">
                          {m.name}
                          {m.external && <span className="ppl-ext-tag">External</span>}
                        </div>
                        <div className="ppl-sub mono">{m.email}</div>
                      </div>
                      <span className="ppl-role-tag">{m.role}</span>
                    </li>
                  ))}
                </ul>
              )}
              {showSuggest && query && matches.length === 0 && (
                <div className="ac-empty">
                  <Ico.send size={12}/> Press <kbd>Enter</kbd> to invite "<span className="mono">{query}</span>"
                </div>
              )}
            </div>

            {/* Suggested */}
            {SUGGESTED.length > 0 && !query && (
              <div className="share-suggested">
                <div className="share-suggested-head">
                  <span className="share-field-label sub">Frequent collaborators</span>
                  <span className="share-suggested-hint">Tap to add</span>
                </div>
                <div className="share-suggested-grid">
                  {SUGGESTED.map(p => (
                    <button key={p.email} className="share-suggested-card" onClick={()=>addPerson(p)}>
                      <span className="share-suggested-avatar" style={{background: p.color}}>{p.initials}</span>
                      <span className="share-suggested-name">{p.name.split(" ")[0]}</span>
                      <span className="share-suggested-role">{p.role.split(" ")[0]}</span>
                      <span className="share-suggested-plus"><Ico.plus size={11}/></span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* People with access list */}
          <div className="share-people-head">
            <span>People with access</span>
            <span className="mono">{count + 1}</span>
          </div>
          <ul className="share-people">
            <li>
              <div className="ppl-avatar" style={{background:"#1A73E8"}}>NL</div>
              <div className="ppl-info">
                <div className="ppl-name">Noa Levi <span className="you-badge">YOU</span></div>
                <div className="ppl-role">Owner · full access</div>
              </div>
              <span className="share-perm mono">Owner</span>
            </li>
            {picked.map(p => (
              <li key={p.email} className="on">
                <div className="ppl-avatar" style={{background:p.color}}>{p.initials}</div>
                <div className="ppl-info">
                  <div className="ppl-name">
                    {p.name}
                    {p.external && <span className="ppl-ext-tag">External</span>}
                  </div>
                  <div className="ppl-role">{p.email}</div>
                </div>
                <button className="ppl-remove" onClick={()=>removePerson(p.email)} title="Remove">
                  <Ico.close size={14}/>
                </button>
              </li>
            ))}
          </ul>

          <div className="share-row">
            <div className="share-row-label">Permission</div>
            <div className="seg seg-sm">
              <button className={permission==="view"?"on":""} onClick={()=>setPermission("view")}>Can view</button>
              <button className={permission==="comment"?"on":""} onClick={()=>setPermission("comment")}>Can comment</button>
              <button className={permission==="edit"?"on":""} onClick={()=>setPermission("edit")}>Can edit</button>
            </div>
          </div>

          <div className="share-row">
            <div className="share-row-label">Include</div>
            <div className="share-incl">
              <label><input type="checkbox" defaultChecked/> Internal summary</label>
              <label><input type="checkbox" defaultChecked/> Client email draft</label>
              <label><input type="checkbox" defaultChecked/> Full transcript</label>
              <label><input type="checkbox"/> Audio recording</label>
            </div>
          </div>

          <div className="share-link-row">
            <button className={"link-toggle " + (link ? "on" : "")} onClick={()=>setLink(l=>!l)}>
              <span className={"toggle-dot " + (link ? "on" : "")}/>
              <span>Anyone at SuperCloud with the link</span>
            </button>
            {link && (
              <div className="share-link-box">
                <Ico.globe size={14}/>
                <span className="mono">supercloud.coach/m/aviv-3-Xk2p</span>
                <button className="ghost-btn"><Ico.copy size={14}/></button>
              </div>
            )}
          </div>
        </div>

        <div className="modal-foot">
          <button className="ghost-btn" onClick={onClose}>Cancel</button>
          <button className="pill-btn primary" onClick={onClose} disabled={count === 0}>
            <Ico.send size={14}/> Share with {count} {count===1?"person":"people"}
          </button>
        </div>
      </div>
    </div>
  );
}

window.SummaryScreen = SummaryScreen;

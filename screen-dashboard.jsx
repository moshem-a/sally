/* global React, ReactDOM, Ico, HISTORY, TEAM, CalendarSyncBtn */
const { useState: uSD, useMemo: uMD, useEffect: uED, useRef: uRD } = React;

/* ───────────── Dashboard / History screen ───────────── */
function Dashboard({ onStartNew, onOpenMeeting, onOpenSettings, user }) {
  const [search, setSearch] = uSD("");
  const [filter, setFilter] = uSD("all");
  const [scope, setScope] = uSD("mine"); // mine | shared
  const [sortCol, setSortCol] = uSD("date"); // date | client | score
  const [sortDir, setSortDir] = uSD("desc"); // asc | desc

  const toggleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir(col === "score" ? "desc" : "desc"); }
  };

  const filtered = HISTORY.filter(m => {
    const isShared = !!m.sharedBy;
    if (scope === "mine" && isShared) return false;
    if (scope === "shared" && !isShared) return false;
    if (filter !== "all" && m.stage.toLowerCase() !== filter) return false;
    if (search && !(m.client + " " + m.title + " " + m.tags.join(" ")).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    let cmp = 0;
    if (sortCol === "date") cmp = (a.dateISO || "").localeCompare(b.dateISO || "");
    else if (sortCol === "client") cmp = a.client.localeCompare(b.client);
    else if (sortCol === "score") cmp = a.score - b.score;
    return sortDir === "asc" ? cmp : -cmp;
  });

  const myCount     = HISTORY.filter(m => !m.sharedBy).length;
  const sharedCount = HISTORY.filter(m =>  m.sharedBy).length;

  const byClient = uMD(() => {
    const m = {};
    HISTORY.forEach(h => { m[h.client] = (m[h.client] || 0) + 1; });
    return Object.entries(m).sort((a,b)=>b[1]-a[1]);
  }, []);

  return (
    <div className="dash">
      <DashHeader onStartNew={onStartNew} onOpenSettings={onOpenSettings} user={user}/>

      <div className="dash-grid">
        {/* Hero / quick start */}
        <section className="dash-hero">
          <div className="dash-hero-text">
            <div className="kicker">Welcome back, Noa</div>
            <h1 className="dash-title">3 meetings on the calendar today.</h1>
            <p className="dash-sub">Your next call is with <b>Aviv Capital</b> in 18 minutes — board pressure was flagged last call. I've pre-loaded their context.</p>
            <div className="dash-cta-row">
              <button className="pill-btn primary lg" onClick={onStartNew}>
                <Ico.play size={14}/> Start new meeting
              </button>
              <button className="pill-btn lg" onClick={()=>onOpenMeeting("m-aviv-3")}>
                <Ico.notebook size={14}/> Resume Aviv brief
              </button>
            </div>
          </div>
          <div className="dash-hero-stats">
            <StatTile label="Meetings this week" value="12" trend="+3" color="blue"/>
            <StatTile label="Avg. confidence" value="82%" trend="+6%" color="green"/>
            <StatTile label="Hints used" value="68" trend="74% rate" color="yellow"/>
            <StatTile label="Buying signals" value="9" trend="↑ Aviv, Monday" color="red"/>
          </div>
        </section>

        {/* History */}
        <section className="dash-history">
          <div className="dash-history-head">
            <h2 className="dash-h2">Meeting history</h2>
            <div className="dash-history-actions">
              <div className="seg seg-tabs">
                <button className={scope==="mine"?"on":""} onClick={()=>setScope("mine")}>
                  <Ico.user size={12}/> My meetings <span className="seg-count">{myCount}</span>
                </button>
                <button className={scope==="shared"?"on":""} onClick={()=>setScope("shared")}>
                  <Ico.inbox size={12}/> Shared with me <span className="seg-count">{sharedCount}</span>
                </button>
              </div>
              <div className="search-box">
                <Ico.search size={14}/>
                <input placeholder="Search by client, topic, tag…" value={search} onChange={e=>setSearch(e.target.value)}/>
              </div>
              <div className="seg seg-sm">
                <button className={filter==="all"?"on":""} onClick={()=>setFilter("all")}>All</button>
                <button className={filter==="discovery"?"on":""} onClick={()=>setFilter("discovery")}>Discovery</button>
                <button className={filter==="qualification"?"on":""} onClick={()=>setFilter("qualification")}>Qualification</button>
                <button className={filter==="negotiation"?"on":""} onClick={()=>setFilter("negotiation")}>Negotiation</button>
              </div>
            </div>
          </div>

          <div className="hist-table">
            <div className="hist-row hist-head-row">
              <div className="hist-sort-col" onClick={()=>toggleSort("client")}>
                Client {sortCol==="client" && <span className="sort-arrow">{sortDir==="asc"?"▲":"▼"}</span>}
              </div>
              <div>Meeting</div>
              <div className="hist-sort-col" onClick={()=>toggleSort("date")}>
                Date {sortCol==="date" && <span className="sort-arrow">{sortDir==="asc"?"▲":"▼"}</span>}
              </div>
              <div>Participants</div>
              <div>Stage</div>
              <div>Tags</div>
              <div>Hints</div>
              <div className="hist-sort-col" onClick={()=>toggleSort("score")}>
                Score {sortCol==="score" && <span className="sort-arrow">{sortDir==="asc"?"▲":"▼"}</span>}
              </div>
              <div></div>
            </div>
            {filtered.map(m => (
              <button key={m.id} className="hist-row" onClick={()=>onOpenMeeting(m.id)}>
                <div className="hist-client">
                  <div className="hist-avatar" style={{background: m.avatar}}>{m.client[0]}</div>
                  <div>
                    <div className="hist-client-name">
                      {m.client}
                      {m.sharedBy && (
                        <span className="shared-badge" title={`Shared by ${m.sharedBy.name}, ${m.sharedAt}`}>
                          <Ico.share size={9}/> {m.sharedBy.initials}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="hist-title">
                  {m.title}
                  <div className="hist-next"><Ico.chev size={12}/> {m.nextStep}</div>
                </div>
                <div className="hist-date-col mono">
                  <div>{m.date}</div>
                  <div className="hist-time">{m.time} · {m.duration}</div>
                </div>
                <div className="hist-participants">
                  <div className="participant-avatars">
                    {(m.participants || []).slice(0, 3).map((p, i) => (
                      <div key={i} className="participant-dot" style={{background: p.color}} title={p.name + " — " + p.role}>
                        {p.initials}
                      </div>
                    ))}
                    {(m.participants || []).length > 3 && (
                      <div className="participant-dot participant-more">+{m.participants.length - 3}</div>
                    )}
                  </div>
                </div>
                <div><span className={"stage-pill stage-" + m.stage.toLowerCase()}>{m.stage}</span></div>
                <div className="hist-tags">
                  {m.tags.slice(0,2).map(t => <span key={t} className="tag tag-blue">{t}</span>)}
                  {m.tags.length > 2 && <span className="tag-more">+{m.tags.length-2}</span>}
                </div>
                <div className="hist-hints mono">
                  <span style={{color:"var(--text-1)", fontWeight:600}}>{m.actedOn}</span>
                  <span style={{color:"var(--text-4)"}}>/{m.hintCount}</span>
                </div>
                <div>
                  <div className="score-circle">
                    <svg viewBox="0 0 36 36" width="32" height="32">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="var(--surface-3)" strokeWidth="3"/>
                      <circle cx="18" cy="18" r="14" fill="none"
                        stroke={m.score >= 85 ? "var(--gc-green)" : m.score >= 70 ? "var(--gc-blue)" : "var(--gc-yellow)"}
                        strokeWidth="3" strokeDasharray={`${m.score * 0.88} 100`} strokeLinecap="round"
                        transform="rotate(-90 18 18)"/>
                    </svg>
                    <span className="mono">{m.score}</span>
                  </div>
                </div>
                <div className="hist-cta" onClick={(e)=>e.stopPropagation()}>
                  <HistShareBtn meeting={m}/>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="hist-empty">
                <Ico.inbox size={28}/>
                <div className="hist-empty-title">
                  {scope === "shared" ? "Nothing shared with you yet" : "No meetings match those filters"}
                </div>
                <div className="hist-empty-sub">
                  {scope === "shared"
                    ? "When teammates share a meeting with you, it'll show up here."
                    : "Try clearing the search or stage filter."}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Sidebar */}
        <aside className="dash-aside">
          <section className="card">
            <div className="card-head">
              <div className="card-title"><Ico.user size={16}/> Top clients</div>
            </div>
            <ul className="client-list">
              {byClient.slice(0,5).map(([name, count], i) => (
                <li key={name}>
                  <div className="client-bar-row">
                    <span className="client-name">{name}</span>
                    <span className="mono client-count">{count}</span>
                  </div>
                  <div className="client-bar"><span style={{width: (count/5*100)+"%"}}/></div>
                </li>
              ))}
            </ul>
          </section>

          <section className="card">
            <div className="card-head">
              <div className="card-title"><Ico.spark size={16}/> Coach insights</div>
            </div>
            <ul className="insight-list">
              <li>
                <div className="ins-icon" style={{background:"var(--gc-green-50)", color:"var(--gc-green)"}}>↑</div>
                <div><b>Your follow-up rate is up 18%</b> this week. Hint-acted-upon ratio is best in your team.</div>
              </li>
              <li>
                <div className="ins-icon" style={{background:"var(--gc-yellow-50)", color:"#B86E00"}}>!</div>
                <div><b>3 meetings missed buying-signal flags.</b> Tap into sentiment events earlier.</div>
              </li>
              <li>
                <div className="ins-icon" style={{background:"var(--gc-blue-50)", color:"var(--gc-blue)"}}>i</div>
                <div><b>Bedrock came up in 7 calls</b> this month. Consider scheduling a deep-dive on Model Garden positioning.</div>
              </li>
            </ul>
          </section>

          <section className="card">
            <div className="card-head">
              <div className="card-title"><Ico.user size={16}/> Team activity</div>
            </div>
            <ul className="people">
              {TEAM.slice(0,4).map(p => (
                <li key={p.name}>
                  <div className="ppl-avatar" style={{background:p.color}}>{p.initials}</div>
                  <div className="ppl-info">
                    <div className="ppl-name">{p.name}{p.you && <span className="you-badge">YOU</span>}</div>
                    <div className="ppl-role">{p.role}</div>
                  </div>
                  <span className="dot" style={{background:"var(--gc-green)"}}/>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

function DashHeader({ onStartNew, onOpenSettings, user }) {
  const [open, setOpen] = uSD(false);
  const ref = uRD(null);
  uED(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  const initials = (user && user.initials) || "NL";
  const color    = (user && user.color)    || "#1A73E8";
  const name     = (user && user.name)     || "Noa Levi";
  const email    = (user && user.email)    || "noalevi@google.com";
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="brand">
          <img src="assets/supercloud-mark.svg" alt="" width="28" height="28"/>
          <div className="brand-text">
            <div className="brand-name">SuperCloud</div>
            <div className="brand-sub">Sales Coach <span className="brand-tag">Internal</span></div>
          </div>
        </div>
        <nav className="dash-nav">
          <a className="active">Dashboard</a>
          <a>Meetings</a>
          <a>Clients</a>
          <a>Team</a>
          <a>Library</a>
        </nav>
      </div>
      <div className="topbar-center"></div>
      <div className="topbar-right">
        <button className="icon-btn"><Ico.search size={18}/></button>
        <button className="icon-btn" onClick={onOpenSettings} title="Settings"><Ico.settings size={18}/></button>
        <CalendarSyncBtn/>
        <button className="pill-btn primary" onClick={onStartNew}>
          <Ico.play size={14}/> New meeting
        </button>
        <div className="user-menu" ref={ref}>
          <button className="avatar-me" style={{background: color}} onClick={()=>setOpen(o=>!o)} title={name}>
            {initials}
          </button>
          {open && (
            <div className="user-pop">
              <div className="user-pop-head">
                <div className="who-avatar lg" style={{background: color}}>{initials}</div>
                <div>
                  <div className="user-pop-name">{name}</div>
                  <div className="user-pop-email mono">{email}</div>
                </div>
              </div>
              <ul>
                <li onClick={()=>{ setOpen(false); onOpenSettings && onOpenSettings(); }}>
                  <Ico.settings size={14}/> Settings
                </li>
                <li onClick={()=>setOpen(false)}>
                  <Ico.bolt size={14}/> Manage Gemini API key
                </li>
                <li onClick={()=>setOpen(false)}>
                  <Ico.globe size={14}/> Language
                </li>
              </ul>
              <button className="user-pop-out" onClick={()=>{ setOpen(false); window.parent && window.parent.postMessage({type:"sign-out"}, "*"); }}>
                <Ico.logout size={12}/> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function StatTile({ label, value, trend, color }) {
  return (
    <div className={"stat-tile stat-" + color}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-trend">{trend}</div>
    </div>
  );
}

window.Dashboard = Dashboard;

/* ───────────── Inline share popover for history rows ───────────── */
function HistShareBtn({ meeting }) {
  const [open, setOpen] = uSD(false);
  const [picked, setPicked] = uSD([]); // array of teammate objects
  const [query, setQuery] = uSD("");
  const [showSuggest, setShowSuggest] = uSD(false);
  const [highlight, setHighlight] = uSD(0);
  const [perm, setPerm] = uSD("view");
  const [sent, setSent] = uSD(false);
  const [pos, setPos] = uSD(null); // {top, left} for portal
  const ref = uRD(null);
  const btnRef = uRD(null);
  const popRef = uRD(null);
  const inputRef = uRD(null);

  // Compute popover position relative to button
  uED(() => {
    if (!open || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const popWidth = 400;
    let left = rect.right - popWidth + window.scrollX;
    if (left < 16) left = 16;
    setPos({
      top: rect.bottom + window.scrollY + 8,
      left
    });
  }, [open]);

  uED(() => {
    if (!open) return;
    const onDoc = (e) => {
      const inBtn = btnRef.current && btnRef.current.contains(e.target);
      const inPop = popRef.current && popRef.current.contains(e.target);
      if (!inBtn && !inPop) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // Suggested teammates the user can quickly add (most-collaborated-with)
  const SUGGESTED = TEAM.filter(t => !t.you).slice(0, 4);

  // Autocomplete pool: full team minus me & already picked
  const matches = uMD(() => {
    const q = query.trim().toLowerCase();
    const taken = new Set(picked.map(p => p.email));
    return TEAM.filter(t => !t.you && !taken.has(t.email))
      .filter(t => !q || (t.name + " " + t.email + " " + t.role).toLowerCase().includes(q))
      .slice(0, 6);
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

  const doShare = () => {
    if (picked.length === 0) return;
    setSent(true);
    setTimeout(() => { setOpen(false); setSent(false); setPicked([]); setQuery(""); }, 1400);
  };

  return (
    <div className="hist-share-wrap" ref={ref}>
      <button
        ref={btnRef}
        className="hist-share-btn"
        title="Share with team"
        onMouseDown={(e)=>e.stopPropagation()}
        onClick={(e)=>{ e.stopPropagation(); setOpen(o => !o); }}
      >
        <Ico.share size={14}/>
      </button>
      {open && ReactDOM.createPortal(
        <div className="modal-back" onMouseDown={()=>setOpen(false)} onClick={()=>setOpen(false)}>
        <div
          ref={popRef}
          className="share-pop share-pop-modal"
          onClick={(e)=>e.stopPropagation()}
          onMouseDown={(e)=>e.stopPropagation()}
        >
          {/* Header: meeting context */}
          <div className="share-pop-head">
            <div className="share-pop-meeting">
              <div className="share-pop-avatar" style={{background: meeting.avatar}}>
                {meeting.client.slice(0,1)}
              </div>
              <div className="share-pop-meta">
                <div className="share-pop-title">Share meeting</div>
                <div className="share-pop-sub">{meeting.title}</div>
                <div className="share-pop-date">{meeting.client} · {meeting.date}</div>
              </div>
            </div>
            <button className="share-pop-close" onClick={()=>setOpen(false)} aria-label="Close">
              <Ico.close size={14}/>
            </button>
          </div>

          {/* Autocomplete people picker */}
          <div className="share-pop-body">
            <div className="share-field-label">Add people</div>
            <div className="ac-wrap">
              <div className="ac-field" onClick={()=>{ inputRef.current && inputRef.current.focus(); setShowSuggest(true); }}>
                {picked.map(p => (
                  <span key={p.email} className="ac-chip">
                    <span className="ac-chip-dot" style={{background: p.color}}>{p.initials}</span>
                    <span className="ac-chip-name">{p.name}</span>
                    <button className="ac-chip-x" onClick={(e)=>{e.stopPropagation(); removePerson(p.email);}} aria-label="Remove">
                      <Ico.close size={10}/>
                    </button>
                  </span>
                ))}
                <input
                  ref={inputRef}
                  className="ac-input"
                  value={query}
                  placeholder={picked.length ? "Add another…" : "Search teammates by name or email"}
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
                        <div className="ppl-name">{m.name}</div>
                        <div className="ppl-sub mono">{m.email}</div>
                      </div>
                      <span className="ppl-role-tag">{m.role}</span>
                    </li>
                  ))}
                </ul>
              )}
              {showSuggest && query && matches.length === 0 && (
                <div className="ac-empty">No teammates match "{query}"</div>
              )}
            </div>

            {/* Suggested people — visual avatar grid */}
            {picked.length === 0 && !query && (
              <div className="share-suggested">
                <div className="share-suggested-head">
                  <span className="share-field-label sub">Frequent collaborators</span>
                  <span className="share-suggested-hint">Tap to add</span>
                </div>
                <div className="share-suggested-grid">
                  {SUGGESTED.map(p => (
                    <button key={p.email} className="share-suggested-card" onClick={()=>addPerson(p)}>
                      <span className="share-suggested-avatar" style={{background: p.color}}>
                        {p.initials}
                      </span>
                      <span className="share-suggested-name">{p.name.split(" ")[0]}</span>
                      <span className="share-suggested-role">{p.role.split(" ")[0]}</span>
                      <span className="share-suggested-plus"><Ico.plus size={11}/></span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Picked people — when at least one selected, show a richer preview */}
            {picked.length > 0 && (
              <div className="share-picked-pane">
                <div className="share-picked-head">
                  <span className="share-field-label sub">{picked.length} {picked.length===1?"person":"people"} will receive this</span>
                  <button className="share-picked-clear" onClick={()=>setPicked([])}>Clear all</button>
                </div>
                <ul className="share-picked-list">
                  {picked.map(p => (
                    <li key={p.email}>
                      <div className="ppl-avatar sm" style={{background:p.color}}>{p.initials}</div>
                      <div className="ppl-info">
                        <div className="ppl-name">{p.name}</div>
                        <div className="ppl-sub">{p.role}</div>
                      </div>
                      <button className="ac-chip-x" onClick={()=>removePerson(p.email)}><Ico.close size={11}/></button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Permission row */}
            <div className="share-perm-row">
              <div className="share-perm-info">
                <Ico.lock size={13}/>
                <div>
                  <div className="share-perm-label">Permission</div>
                  <div className="share-perm-hint">
                    {perm==="view" ? "Recipients can read transcript & summary" : "Recipients can comment and tag people"}
                  </div>
                </div>
              </div>
              <div className="seg seg-sm">
                <button className={perm==="view" ? "on" : ""} onClick={()=>setPerm("view")}>View</button>
                <button className={perm==="comment" ? "on" : ""} onClick={()=>setPerm("comment")}>Comment</button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="share-pop-foot">
            <button className="share-link-btn" title="Copy shareable link">
              <Ico.link size={13}/> Copy link
            </button>
            <div className="share-foot-actions">
              <button className="ghost-btn" onClick={()=>setOpen(false)}>Cancel</button>
              <button className={"pill-btn primary sm " + (sent ? "sent" : "")}
                      disabled={picked.length===0 && !sent}
                      onClick={doShare}>
                {sent
                  ? <><Ico.check size={12}/> Shared with {picked.length}</>
                  : <><Ico.send size={12}/> Share{picked.length ? ` with ${picked.length}` : ""}</>}
              </button>
            </div>
          </div>
        </div>
        </div>,
        document.body
      )}
    </div>
  );
}

window.HistShareBtn = HistShareBtn;
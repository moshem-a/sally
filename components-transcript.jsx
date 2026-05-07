/* global React, Ico */
const { useState: uS2, useEffect: uE2, useRef: uR2, useMemo: uM2 } = React;

/* ───────────── Center: Live Transcript ───────────── */
function TranscriptPanel({ transcript, lang, listening, muted, onAddNote, notes }) {
  const scrollRef = uR2(null);
  const [filter, setFilter] = uS2("all");
  const [search, setSearch] = uS2("");

  uE2(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [transcript.length]);

  const visible = transcript.filter(l => {
    if (filter === "client" && l.speaker !== "client") return false;
    if (filter === "rep" && l.speaker !== "rep") return false;
    if (search && !(l.text + " " + (l.trans||"")).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <section className="panel transcript-panel">
      <div className="panel-head">
        <div className="panel-title-row">
          <h2 className="panel-title">Live transcript</h2>
          <span className="panel-meta">Chirp 3 · he-IL ↔ en-US</span>
        </div>
        <div className="panel-actions">
          <div className="search-box">
            <Ico.search size={14}/>
            <input placeholder="Search transcript…" value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <div className="seg seg-sm">
            <button className={filter==="all"?"on":""} onClick={()=>setFilter("all")}>All</button>
            <button className={filter==="client"?"on":""} onClick={()=>setFilter("client")}>Client</button>
            <button className={filter==="rep"?"on":""} onClick={()=>setFilter("rep")}>You</button>
          </div>
        </div>
      </div>

      <div className="transcript-scroll scroll" ref={scrollRef}>
        {visible.map((l, i) => (
          <TranscriptLine key={i} line={l} lang={lang}/>
        ))}
        {muted ? (
          <div className="t-muted-row">
            <Ico.micOff size={14}/> Listening paused — hint generation suspended. Audio still captured locally.
          </div>
        ) : (
          <div className="t-typing">
            <div className="t-typing-avatar" style={{background:"#EA4335"}}>Y</div>
            <div className="t-typing-bubble">
              <span className="dot dot-pulse" style={{background:"var(--text-3)"}}/>
              <span className="dot dot-pulse" style={{background:"var(--text-3)", animationDelay:"150ms"}}/>
              <span className="dot dot-pulse" style={{background:"var(--text-3)", animationDelay:"300ms"}}/>
              <span className="t-typing-label">Yael speaking…</span>
            </div>
          </div>
        )}
      </div>

      {/* Quiet mode + private notes composer */}
      <QuietBar onAddNote={onAddNote} notes={notes}/>
    </section>
  );
}

function TranscriptLine({ line, lang }) {
  const isClient = line.speaker === "client";
  const showHe = lang === "he" || lang === "bi";
  const showEn = lang === "en" || lang === "bi";
  const primary = line.lang === "he" ? line.text : line.text;
  const translation = line.lang === "he" ? line.trans : null;

  // Decide what to render based on lang setting
  let body;
  if (line.lang === "he") {
    if (lang === "he") body = <div className="t-he" dir="rtl">{line.text}</div>;
    else if (lang === "en") body = <div className="t-en">{line.trans}</div>;
    else body = (<>
      <div className="t-he" dir="rtl">{line.text}</div>
      <div className="t-trans">{line.trans}</div>
    </>);
  } else {
    body = <div className="t-en">{line.text}</div>;
  }

  return (
    <div className={"t-line " + (isClient ? "t-line-client" : "t-line-rep")}>
      <div className="t-meta">
        <div className="t-avatar" style={{background: isClient ? (line.name==="Daniel" ? "#F9AB00" : "#EA4335") : "#1A73E8"}}>
          {line.name[0]}
        </div>
        <div className="t-name">{line.name}</div>
        <div className="t-time mono">{line.t}</div>
        {line.sentiment === "buying" && <span className="t-sig sig-buying">↑ buying signal</span>}
        {line.sentiment === "concern" && <span className="t-sig sig-concern">⚠ hesitation</span>}
        <div className="t-flag mono">{line.lang.toUpperCase()}</div>
      </div>
      <div className="t-body">
        {body}
        {line.entities && (
          <div className="t-ents">
            {line.entities.map(e => <span key={e} className="ent-pill">{e}</span>)}
          </div>
        )}
      </div>
    </div>
  );
}

function QuietBar({ onAddNote, notes }) {
  const [mode, setMode] = uS2("ask"); // 'ask' | 'note'
  const [val, setVal] = uS2("");
  const [answer, setAnswer] = uS2(null);
  const [thinking, setThinking] = uS2(false);

  const submit = () => {
    if (!val.trim()) return;
    if (mode === "note") {
      onAddNote(val.trim());
      setVal("");
      return;
    }
    // Quiet-mode question — fake an answer
    setThinking(true);
    setAnswer(null);
    setTimeout(() => {
      setThinking(false);
      setAnswer({
        q: val,
        a: "Bedrock alternatives on Vertex: Model Garden offers Anthropic Claude (same API surface), Llama 3, Mistral, and Gemini side-by-side under one IAM/billing boundary. Pricing parity to Bedrock list with CUDs unlocking 25–52% off. Closest swap for Sonnet → claude-sonnet-4@vertex with regional endpoints in europe-west4.",
        chips: ["Model Garden", "europe-west4", "CUD pricing"],
      });
      setVal("");
    }, 900);
  };

  return (
    <div className="quiet-bar">
      <div className="seg seg-sm quiet-seg">
        <button className={mode==="ask"?"on":""} onClick={()=>{setMode("ask"); setAnswer(null);}}>
          <Ico.question size={14}/> Quiet ask
        </button>
        <button className={mode==="note"?"on":""} onClick={()=>{setMode("note"); setAnswer(null);}}>
          <Ico.notebook size={14}/> Private note
        </button>
      </div>

      <div className="quiet-input-row">
        <input
          placeholder={mode==="ask" ? "Ask Gemini privately — e.g. “Bedrock alternatives”…" : "Note for yourself — added to context"}
          value={val}
          onChange={e=>setVal(e.target.value)}
          onKeyDown={e=>e.key==="Enter" && submit()}
        />
        <span className="kbd">⌘</span><span className="kbd">↵</span>
        <button className="pill-btn primary sm" onClick={submit}>
          <Ico.send size={14}/> {mode==="ask" ? "Ask" : "Save"}
        </button>
      </div>

      {thinking && (
        <div className="quiet-answer thinking">
          <div className="shimmer-line shimmer" style={{width:"75%"}}/>
          <div className="shimmer-line shimmer" style={{width:"55%"}}/>
        </div>
      )}
      {answer && !thinking && (
        <div className="quiet-answer">
          <div className="qa-q"><Ico.question size={14}/> {answer.q}</div>
          <div className="qa-a">{answer.a}</div>
          <div className="qa-chips">
            {answer.chips.map(c => <span key={c} className="ent-pill">{c}</span>)}
            <button className="qa-dismiss" onClick={()=>setAnswer(null)}><Ico.close size={14}/></button>
          </div>
        </div>
      )}

      {mode==="note" && notes.length > 0 && (
        <ul className="quiet-notes">
          {notes.map((n,i) => (
            <li key={i}><span className="mono qn-time">{n.t}</span><span>{n.text}</span></li>
          ))}
        </ul>
      )}
    </div>
  );
}

window.TranscriptPanel = TranscriptPanel;

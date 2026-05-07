/* global React, Ico */
const { useState: uSP, useRef: uRP } = React;

/* ───────────── Pre-meeting setup screen ───────────── */
function PreMeeting({ onCancel, onStart }) {
  const [step, setStep] = uSP(1);
  const [client, setClient] = uSP("Aviv Capital");
  const [title, setTitle] = uSP("Vertex AI Migration · Technical deep-dive");
  const [website, setWebsite] = uSP("avivcapital.com");
  const [goal, setGoal] = uSP("Follow-up on previous Vertex AI discussion. Probe latency requirements and current Bedrock spend; surface Model Garden + regional endpoints.");
  const [language, setLanguage] = uSP("auto");
  const [docs, setDocs] = uSP([
    { name: "Discovery call notes — Mar 14.pdf", size: "84 KB", kind: "pdf" },
    { name: "Aviv security review.pdf", size: "1.2 MB", kind: "pdf" },
  ]);
  const [analyzing, setAnalyzing] = uSP(false);
  const [analyzed, setAnalyzed] = uSP(false);

  const runAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => { setAnalyzing(false); setAnalyzed(true); }, 1400);
  };

  return (
    <div className="setup">
      <header className="topbar">
        <div className="topbar-left">
          <button className="icon-btn" onClick={onCancel}><Ico.chev size={18} style={{transform:"rotate(180deg)"}}/></button>
          <div className="brand">
            <img src="assets/supercloud-mark.svg" alt="" width="28" height="28"/>
            <div className="brand-text">
              <div className="brand-name">New meeting</div>
              <div className="brand-sub">Pre-meeting setup · silent mode</div>
            </div>
          </div>
        </div>
        <div className="topbar-center">
          <div className="setup-stepper">
            {["Client", "Goal & language", "Context", "Ready"].map((s, i) => (
              <div key={s} className={"step " + (step > i+1 ? "done" : step === i+1 ? "active" : "")}>
                <div className="step-num">{step > i+1 ? <Ico.check size={12}/> : (i+1)}</div>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="topbar-right">
          <button className="ghost-btn" onClick={onCancel}>Cancel</button>
        </div>
      </header>

      <div className="setup-body">
        <div className="setup-main">
          {step === 1 && (
            <div className="setup-card">
              <h2 className="setup-h2">Who are you meeting?</h2>
              <p className="setup-p">I'll pull prior context from the client's history if I have it.</p>

              <label className="field">
                <span>Client / company</span>
                <input value={client} onChange={e=>setClient(e.target.value)} placeholder="e.g. Aviv Capital"/>
              </label>
              <label className="field">
                <span>Meeting title</span>
                <input value={title} onChange={e=>setTitle(e.target.value)}/>
              </label>
              <div className="row-2">
                <label className="field">
                  <span>Website (optional)</span>
                  <input value={website} onChange={e=>setWebsite(e.target.value)} placeholder="company.com"/>
                </label>
                <label className="field">
                  <span>Stage</span>
                  <select defaultValue="discovery">
                    <option>Intro</option><option>Discovery</option>
                    <option>Qualification</option><option>Negotiation</option>
                  </select>
                </label>
              </div>

              <div className="prior-banner">
                <div className="prior-icon"><Ico.brain size={16}/></div>
                <div>
                  <div className="prior-title">2 prior meetings found with Aviv Capital</div>
                  <div className="prior-sub">Client previously mentioned <b>budget constraints</b> and <b>EU latency</b>. I'll continue from there.</div>
                </div>
                <button className="ghost-btn">View thread</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="setup-card">
              <h2 className="setup-h2">What are you trying to achieve?</h2>
              <p className="setup-p">Hint quality scales with goal clarity. Be specific.</p>

              <label className="field">
                <span>Meeting goal</span>
                <textarea rows="4" value={goal} onChange={e=>setGoal(e.target.value)}/>
              </label>

              <div className="goal-suggest">
                <div className="goal-sug-label">Common templates</div>
                <div className="goal-sug-chips">
                  <button className="chip-btn" onClick={()=>setGoal("First introduction with a fintech startup exploring AI model deployment.")}>First intro</button>
                  <button className="chip-btn" onClick={()=>setGoal("Pricing & commercial alignment ahead of MSA.")}>Commercial alignment</button>
                  <button className="chip-btn" onClick={()=>setGoal("Technical architecture deep-dive with platform team.")}>Technical deep-dive</button>
                  <button className="chip-btn" onClick={()=>setGoal("Negotiation with procurement; renewal terms.")}>Procurement</button>
                </div>
              </div>

              <div className="row-2">
                <div className="field">
                  <span>Primary language</span>
                  <div className="seg seg-block">
                    <button className={language==="auto"?"on":""} onClick={()=>setLanguage("auto")}>Auto-detect</button>
                    <button className={language==="he"?"on":""} onClick={()=>setLanguage("he")}>עברית</button>
                    <button className={language==="en"?"on":""} onClick={()=>setLanguage("en")}>English</button>
                  </div>
                </div>
                <div className="field">
                  <span>Hint tone</span>
                  <div className="seg seg-block">
                    <button className="on">Direct</button>
                    <button>Consultative</button>
                    <button>Brief</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="setup-card">
              <h2 className="setup-h2">Drop in any context I should learn</h2>
              <p className="setup-p">PDFs, notes, case studies, RFPs — anything Gemini should know before listening starts.</p>

              <div className="upload-zone">
                <div className="upload-icon"><Ico.doc size={20}/></div>
                <div>
                  <div className="upload-title">Drop files here or click to browse</div>
                  <div className="upload-sub">PDF, DOCX, TXT, MD up to 25 MB · or paste a URL</div>
                </div>
              </div>

              <ul className="upload-list">
                {docs.map((d, i) => (
                  <li key={i}>
                    <div className="ctx-icon ctx-doc"><Ico.doc size={14}/></div>
                    <div className="up-info">
                      <div className="up-name">{d.name}</div>
                      <div className="up-size mono">{d.size}</div>
                    </div>
                    <span className="tag tag-green">Indexed</span>
                    <button className="icon-btn xs" onClick={()=>setDocs(d => d.filter((_,j)=>j!==i))}><Ico.close size={14}/></button>
                  </li>
                ))}
                <li className="upload-add">
                  <button className="dashed-btn">+ Add URL or paste notes</button>
                </li>
              </ul>

              <div className="analyze-block">
                <button className="pill-btn primary" onClick={runAnalyze} disabled={analyzing}>
                  <Ico.spark size={14}/> {analyzing ? "Analyzing context…" : analyzed ? "Re-analyze" : "Build knowledge base"}
                </button>
                {analyzed && (
                  <div className="analyze-result">
                    <div className="analyze-pill"><Ico.check size={12}/> Indexed 2 docs · 14 entities · 3 likely pain points</div>
                    <div className="analyze-tags">
                      <span className="tag tag-blue">Algorithmic trading</span>
                      <span className="tag tag-blue">EU markets</span>
                      <span className="tag tag-yellow">Cost-sensitive</span>
                      <span className="tag tag-red">Latency-critical</span>
                      <span className="tag tag-green">VPC-SC</span>
                      <span className="tag tag-green">CMEK</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="setup-card setup-ready">
              <div className="ready-mark"><Ico.check size={28}/></div>
              <h2 className="setup-h2">Ready to listen.</h2>
              <p className="setup-p">When you click <b>Start listening</b>, the system begins capturing audio from the shared meeting window. You can mute or pause anytime.</p>

              <ul className="ready-summary">
                <li><span>Client</span><b>{client}</b></li>
                <li><span>Title</span><b>{title}</b></li>
                <li><span>Language</span><b>{language === "auto" ? "Auto-detect (HE/EN)" : language === "he" ? "עברית" : "English"}</b></li>
                <li><span>Context</span><b>{docs.length} documents indexed</b></li>
              </ul>

              <div className="silent-banner">
                <div className="silent-dot"/>
                <div>
                  <div className="silent-title">Silent mode active</div>
                  <div className="silent-sub">Microphone is muted. Nothing is being captured until you press start.</div>
                </div>
              </div>

              <div className="ready-share">
                <div className="ready-share-label">Share window source</div>
                <div className="ready-share-tile">
                  <div className="ready-share-thumb">
                    <div className="ready-share-tile-mini" style={{background:"linear-gradient(135deg,#1A2230,#11161E)"}}/>
                  </div>
                  <div>
                    <div className="up-name">Chrome — “Aviv ↔ SuperCloud”</div>
                    <div className="up-size">Sharing system audio · 2 participants visible</div>
                  </div>
                  <button className="ghost-btn">Switch</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right rail: live preview of what coach will see */}
        <aside className="setup-aside">
          <div className="setup-aside-head">PREVIEW</div>
          <div className="setup-preview">
            <div className="prev-line">
              <div className="prev-ico" style={{background:"var(--gc-blue-50)", color:"var(--gc-blue)"}}><Ico.user size={14}/></div>
              <div><div className="prev-k">Client</div><div className="prev-v">{client || "—"}</div></div>
            </div>
            <div className="prev-line">
              <div className="prev-ico" style={{background:"var(--gc-yellow-50)", color:"#B86E00"}}><Ico.spark size={14}/></div>
              <div><div className="prev-k">Goal</div><div className="prev-v prev-clamp">{goal || "—"}</div></div>
            </div>
            <div className="prev-line">
              <div className="prev-ico" style={{background:"var(--gc-green-50)", color:"var(--gc-green)"}}><Ico.doc size={14}/></div>
              <div><div className="prev-k">Context</div><div className="prev-v">{docs.length} documents</div></div>
            </div>
            <div className="prev-line">
              <div className="prev-ico" style={{background:"var(--gc-red-50)", color:"var(--gc-red)"}}><Ico.globe size={14}/></div>
              <div><div className="prev-k">Language</div><div className="prev-v">{language === "auto" ? "HE / EN auto" : language.toUpperCase()}</div></div>
            </div>
          </div>

          <div className="setup-tip">
            <div className="tip-kicker">TIP</div>
            <p>Add the client's last quarterly report or a competitor battlecard. Hint quality jumps noticeably when the knowledge base has commercial context.</p>
          </div>
        </aside>
      </div>

      <footer className="setup-foot">
        <button className="ghost-btn" disabled={step===1} onClick={()=>setStep(s=>s-1)}>
          <Ico.chev size={14} style={{transform:"rotate(180deg)"}}/> Back
        </button>
        <div className="setup-foot-center mono">Step {step} of 4</div>
        {step < 4 ? (
          <button className="pill-btn primary" onClick={()=>setStep(s=>s+1)}>
            Next <Ico.chev size={14}/>
          </button>
        ) : (
          <button className="pill-btn primary lg" onClick={onStart}>
            <Ico.play size={14}/> Start listening
          </button>
        )}
      </footer>
    </div>
  );
}

window.PreMeeting = PreMeeting;

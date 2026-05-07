/* global React, ReactDOM, Ico, HISTORY, SUMMARIES */
const { useState: uSC, useEffect: uEC, useCallback: uCC, useRef: uRC } = React;

/* ═══════════════════════════════════════════════════════════════
   Google Calendar MCP Integration Layer
   ─────────────────────────────────────────────────────────────
   Connects to Google Calendar via MCP (Model Context Protocol)
   server at calendarmcp.googleapis.com to pull meeting data
   and sync it into the dashboard.

   MCP Server: https://developers.google.com/workspace/calendar/api/guides/configure-mcp-server
   Tools used: list_events, get_event, list_calendars
   Auth: OAuth 2.0 via Google Cloud project credentials
   ═══════════════════════════════════════════════════════════════ */

const CALENDAR_MCP_CONFIG = {
  server: "calendarmcp.googleapis.com",
  scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
  clientId: "", // Set via CalendarSettings
  redirectUri: window.location.origin + "/auth/callback",
};

const CalendarSyncContext = React.createContext(null);

function useCalendarSync() {
  return React.useContext(CalendarSyncContext);
}

function CalendarSyncProvider({ children }) {
  const [connected, setConnected] = uSC(false);
  const [syncing, setSyncing] = uSC(false);
  const [lastSync, setLastSync] = uSC(null);
  const [calendarEvents, setCalendarEvents] = uSC([]);
  const [error, setError] = uSC(null);
  const [oauthToken, setOauthToken] = uSC(() => {
    try { return JSON.parse(localStorage.getItem("gcal_mcp_token")); } catch { return null; }
  });

  const connect = uCC(async (clientId, clientSecret) => {
    setError(null);
    setSyncing(true);
    try {
      // Store credentials
      CALENDAR_MCP_CONFIG.clientId = clientId;

      // In production, this initiates OAuth 2.0 flow with Google:
      // 1. Redirect to accounts.google.com/o/oauth2/auth
      // 2. User grants calendar.readonly scope
      // 3. Exchange code for tokens
      // 4. MCP server uses token for calendar API calls

      // For demo: simulate successful connection
      const token = {
        access_token: "demo_" + Date.now(),
        refresh_token: "refresh_demo",
        expires_at: Date.now() + 3600000,
        scope: CALENDAR_MCP_CONFIG.scopes.join(" "),
      };
      localStorage.setItem("gcal_mcp_token", JSON.stringify(token));
      setOauthToken(token);
      setConnected(true);
      await syncEvents(token);
    } catch (err) {
      setError("Failed to connect: " + err.message);
    } finally {
      setSyncing(false);
    }
  }, []);

  const disconnect = uCC(() => {
    localStorage.removeItem("gcal_mcp_token");
    setOauthToken(null);
    setConnected(false);
    setCalendarEvents([]);
    setLastSync(null);
  }, []);

  const syncEvents = uCC(async (token) => {
    setSyncing(true);
    setError(null);
    try {
      // MCP tool call: list_events
      // In production, this calls the Google Calendar MCP server:
      //   Tool: list_events
      //   Params: { calendar_id: "primary", time_min: <30 days ago>, time_max: <now>, max_results: 50 }
      //
      // The MCP server at calendarmcp.googleapis.com handles the actual API call
      // and returns structured event data.

      // For demo: map HISTORY data as if it came from Google Calendar
      const events = HISTORY.map(m => ({
        id: m.id,
        calendarEventId: "gcal_" + m.id,
        summary: m.title,
        client: m.client,
        start: { dateTime: m.dateISO + "T" + m.time + ":00", timeZone: "Europe/London" },
        end: { dateTime: m.dateISO + "T" + m.time + ":00", timeZone: "Europe/London" },
        attendees: (m.participants || []).map(p => ({
          email: (p.name.split(" ")[0].toLowerCase()) + "@" + (p.role === "SuperCloud" ? "google.com" : m.client.toLowerCase().replace(/\s/g,"") + ".com"),
          displayName: p.name,
          responseStatus: "accepted",
        })),
        status: "confirmed",
        htmlLink: "https://calendar.google.com/event/" + m.id,
        source: "google_calendar_mcp",
        synced: true,
      }));

      setCalendarEvents(events);
      setLastSync(new Date());
    } catch (err) {
      setError("Sync failed: " + err.message);
    } finally {
      setSyncing(false);
    }
  }, []);

  const refreshSync = uCC(() => {
    if (oauthToken) syncEvents(oauthToken);
  }, [oauthToken, syncEvents]);

  // Auto-connect if token exists
  uEC(() => {
    if (oauthToken && !connected) {
      setConnected(true);
      syncEvents(oauthToken);
    }
  }, []);

  const value = {
    connected, syncing, lastSync, calendarEvents, error,
    connect, disconnect, refreshSync,
  };

  return React.createElement(CalendarSyncContext.Provider, { value }, children);
}

/* ───────── Calendar Sync Button (for dashboard header) ───────── */
function CalendarSyncBtn() {
  const ctx = useCalendarSync();
  const [showPanel, setShowPanel] = uSC(false);
  const ref = uRC(null);

  uEC(() => {
    if (!showPanel) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setShowPanel(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [showPanel]);

  if (!ctx) return null;

  return (
    <div className="cal-sync-wrap" ref={ref}>
      <button
        className={"pill-btn cal-sync-btn " + (ctx.connected ? "connected" : "")}
        onClick={() => setShowPanel(o => !o)}
        title={ctx.connected ? "Google Calendar connected" : "Connect Google Calendar"}
      >
        <Ico.calendar size={14}/>
        {ctx.connected ? "Calendar synced" : "Connect Calendar"}
        {ctx.syncing && <span className="cal-spinner"/>}
      </button>

      {showPanel && (
        <div className="cal-sync-panel">
          <div className="cal-sync-panel-head">
            <div className="cal-sync-panel-title">
              <Ico.calendar size={16}/>
              Google Calendar MCP
            </div>
            <button className="icon-btn" onClick={() => setShowPanel(false)}>
              <Ico.close size={14}/>
            </button>
          </div>

          <div className="cal-sync-panel-body">
            {ctx.connected ? (
              <>
                <div className="cal-status cal-status-on">
                  <span className="cal-status-dot"/>
                  Connected via MCP
                </div>
                <div className="cal-sync-info">
                  <div className="cal-sync-row">
                    <span className="cal-sync-label">Server</span>
                    <span className="mono cal-sync-val">calendarmcp.googleapis.com</span>
                  </div>
                  <div className="cal-sync-row">
                    <span className="cal-sync-label">Events loaded</span>
                    <span className="mono cal-sync-val">{ctx.calendarEvents.length}</span>
                  </div>
                  <div className="cal-sync-row">
                    <span className="cal-sync-label">Last sync</span>
                    <span className="mono cal-sync-val">
                      {ctx.lastSync ? ctx.lastSync.toLocaleTimeString() : "—"}
                    </span>
                  </div>
                  <div className="cal-sync-row">
                    <span className="cal-sync-label">Scope</span>
                    <span className="mono cal-sync-val">calendar.readonly</span>
                  </div>
                </div>
                <div className="cal-sync-actions">
                  <button className="pill-btn sm" onClick={ctx.refreshSync} disabled={ctx.syncing}>
                    <Ico.refresh size={12}/> {ctx.syncing ? "Syncing..." : "Refresh"}
                  </button>
                  <button className="ghost-btn sm" onClick={ctx.disconnect}>
                    Disconnect
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="cal-status">
                  <span className="cal-status-dot off"/>
                  Not connected
                </div>
                <p className="cal-sync-desc">
                  Connect to Google Calendar via MCP to automatically pull meeting data,
                  attendees, and event details into your dashboard.
                </p>
                <div className="cal-mcp-tools">
                  <div className="cal-mcp-tool-head">Available MCP tools:</div>
                  <ul>
                    <li><code>list_events</code> — Fetch calendar events by date range</li>
                    <li><code>get_event</code> — Get event details by ID</li>
                    <li><code>list_calendars</code> — List available calendars</li>
                    <li><code>create_event</code> — Schedule new meetings</li>
                    <li><code>suggest_time</code> — Find free/busy slots</li>
                  </ul>
                </div>
                <button
                  className="pill-btn primary"
                  onClick={() => ctx.connect("demo-client-id", "demo-secret")}
                  disabled={ctx.syncing}
                >
                  <Ico.globe size={14}/>
                  {ctx.syncing ? "Connecting..." : "Connect with Google"}
                </button>
              </>
            )}
            {ctx.error && (
              <div className="cal-sync-error">
                <Ico.alert size={12}/> {ctx.error}
              </div>
            )}
          </div>

          <div className="cal-sync-panel-foot">
            <a className="cal-mcp-link" href="https://developers.google.com/workspace/calendar/api/guides/configure-mcp-server" target="_blank" rel="noopener">
              <Ico.globe size={11}/> MCP Server docs
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

window.CalendarSyncProvider = CalendarSyncProvider;
window.CalendarSyncBtn = CalendarSyncBtn;
window.useCalendarSync = useCalendarSync;

import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const RAW_DATA = {
  "2021": { Packers:1, Ravens:1, Rams:2, Titans:1, Panthers:1, Vikings:1, Eagles:2, Chiefs:2, Steelers:1, Chargers:1, Commanders:1, Buccaneers:1 },
  "2022": { Chargers:1, Raiders:1, Titans:1, Saints:2, Cowboys:4, Falcons:1, Jaguars:1, Steelers:1, Eagles:1, Buccaneers:1, Rams:1, "49ers":1, Seahawks:1, Panthers:1 },
  "2023": { "49ers":2, Broncos:2, Chargers:6, Bills:1, Eagles:3, Cowboys:6, Commanders:3, Raiders:2, Seahawks:1, Giants:1, Packers:1, Bears:2, Patriots:1, Dolphins:1, Texans:1, Vikings:1, Ravens:1, Jets:1 },
  "2024": { Falcons:5, Saints:3, Raiders:6, Chargers:7, Rams:4, "49ers":4, Cowboys:4, Cardinals:2, Ravens:2, Commanders:6, Eagles:2, Broncos:2, Chiefs:1, Steelers:3, Vikings:1, Texans:2 },
  "2025": { Rams:3, Texans:1, Saints:1, Jaguars:1, Giants:1, Commanders:4, Bears:2, Packers:1, Bengals:1, Lions:2, Cowboys:1, Eagles:3, Bills:2, Dolphins:1, "49ers":1, Cardinals:1, Buccaneers:1, Ravens:2, Steelers:2, Raiders:1, Chargers:1, Panthers:1, Seahawks:1, Broncos:2, Patriots:2, Colts:1 },
  "Unknown": { Raiders:14, "49ers":11, Lions:2, Steelers:5, Bills:5, Eagles:7, Cowboys:8, Giants:4, Dolphins:1, Titans:1, Chiefs:6, Rams:9, Chargers:8, Seahawks:3, Bears:5, Packers:3, Patriots:5, Jaguars:1, Texans:2, Vikings:4, Buccaneers:2, Browns:1, Commanders:1, Bengals:2, Cardinals:1, Falcons:1, Ravens:1, Broncos:1 },
};

const DIVISIONS = {
  "AFC East":  ["Bills", "Patriots", "Dolphins", "Jets"],
  "AFC North": ["Ravens", "Steelers", "Browns", "Bengals"],
  "AFC South": ["Texans", "Colts", "Jaguars", "Titans"],
  "AFC West":  ["Chiefs", "Raiders", "Chargers", "Broncos"],
  "NFC East":  ["Cowboys", "Eagles", "Giants", "Commanders"],
  "NFC North": ["Bears", "Lions", "Packers", "Vikings"],
  "NFC South": ["Saints", "Falcons", "Buccaneers", "Panthers"],
  "NFC West":  ["Rams", "49ers", "Seahawks", "Cardinals"],
};

const DIVISION_COLORS = {
  "AFC East": "#00338D", "AFC North": "#241773", "AFC South": "#03202F", "AFC West": "#E31837",
  "NFC East": "#003594", "NFC North": "#0076B6", "NFC South": "#A71930", "NFC West": "#AA0000",
};

const TEAM_DIVISION = {};
Object.entries(DIVISIONS).forEach(([div, teams]) => teams.forEach(t => TEAM_DIVISION[t] = div));

const YEARS = ["Totals", "By Division", "2021", "2022", "2023", "2024", "2025", "Unknown"];

const NFL_COLORS = {
  Raiders: "#A5ACAF", "49ers": "#AA0000", Cowboys: "#003594", Eagles: "#004C54",
  Chargers: "#FFC20E", Rams: "#003594", Commanders: "#5A1414", Chiefs: "#E31837",
  Steelers: "#FFB612", Bills: "#00338D", Patriots: "#002244", Bears: "#C83803",
  Packers: "#203731", Saints: "#D3BC8D", Falcons: "#A71930", Ravens: "#241773",
  Broncos: "#FB4F14", Texans: "#03202F", Vikings: "#4F2683", Titans: "#0C2340",
  Dolphins: "#008E97", Giants: "#0B2265", Jets: "#125740", Panthers: "#0085CA",
  Buccaneers: "#D50A0A", Jaguars: "#006778", Cardinals: "#97233F", Seahawks: "#002244",
  Lions: "#0076B6", Bengals: "#FB4F14", Browns: "#311D00", Colts: "#002C5F",
};

function getTotals() {
  const totals = {};
  Object.values(RAW_DATA).forEach(yearData => {
    Object.entries(yearData).forEach(([team, count]) => {
      totals[team] = (totals[team] || 0) + count;
    });
  });
  return totals;
}

function getDivisionTotals() {
  const totals = getTotals();
  const divTotals = {};
  Object.keys(DIVISIONS).forEach(div => divTotals[div] = 0);
  Object.entries(totals).forEach(([team, count]) => {
    const div = TEAM_DIVISION[team];
    if (div) divTotals[div] += count;
  });
  return divTotals;
}

function getChartData(view) {
  if (view === "Totals") {
    return Object.entries(getTotals()).map(([team, count]) => ({ team, count })).sort((a, b) => b.count - a.count);
  }
  if (view === "By Division") {
    return Object.entries(getDivisionTotals()).map(([team, count]) => ({ team, count })).sort((a, b) => b.count - a.count);
  }
  return Object.entries(RAW_DATA[view]).map(([team, count]) => ({ team, count })).sort((a, b) => b.count - a.count);
}

function getTeamsByDivision() {
  const totals = getTotals();
  return Object.entries(DIVISIONS).map(([div, teams]) => {
    const divTotal = teams.reduce((s, t) => s + (totals[t] || 0), 0);
    const teamData = teams.map(t => ({ team: t, count: totals[t] || 0 })).sort((a, b) => b.count - a.count);
    return { div, total: divTotal, teams: teamData };
  }).sort((a, b) => b.total - a.total);
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { team, count } = payload[0].payload;
    return (
      <div style={{
        background: "#0a0a0f", border: "1px solid rgba(255,180,0,0.4)",
        borderRadius: 4, padding: "10px 16px",
        fontFamily: "'Barlow Condensed', sans-serif", color: "#fff",
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 1 }}>{team}</div>
        <div style={{ fontSize: 14, color: "#FFB400" }}>{count} incident{count !== 1 ? "s" : ""}</div>
      </div>
    );
  }
  return null;
};

export default function App() {
  const [view, setView] = useState("Totals");
  const data = useMemo(() => getChartData(view), [view]);
  const divisionBreakdown = useMemo(() => getTeamsByDivision(), []);
  const total = data.reduce((s, d) => s + d.count, 0);
  const maxCount = data[0]?.count || 1;
  const isDivView = view === "By Division";

  const getColor = (name) => isDivView ? (DIVISION_COLORS[name] || "#888") : (NFL_COLORS[name] || "#888");

  return (
    <div style={{ minHeight: "100vh", background: "#07070d", fontFamily: "'Barlow Condensed', sans-serif", color: "#fff", padding: "0 0 60px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;600;700;900&family=Barlow:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0a0a0f; } ::-webkit-scrollbar-thumb { background: #FFB400; }
        .tab-btn {
          background: transparent; border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.5); padding: 8px 18px;
          font-family: 'Barlow Condensed', sans-serif; font-size: 15px;
          font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase;
          cursor: pointer; border-radius: 3px; transition: all 0.2s;
        }
        .tab-btn:hover { border-color: rgba(255,180,0,0.5); color: #FFB400; }
        .tab-btn.active { background: #FFB400; border-color: #FFB400; color: #07070d; }
        .tab-btn.div-tab { border-color: rgba(255,180,0,0.3); color: rgba(255,180,0,0.6); }
        .tab-btn.div-tab.active { background: #FFB400; color: #07070d; }
        .bar-row { display: flex; align-items: center; gap: 12px; border-bottom: 1px solid rgba(255,255,255,0.04); border-radius: 3px; padding: 8px 12px; cursor: default; transition: background 0.15s; }
        .bar-row:hover { background: rgba(255,255,255,0.03); }
        .div-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; overflow: hidden; transition: border-color 0.2s; }
        .div-card:hover { border-color: rgba(255,180,0,0.2); }
        .team-row { display: flex; align-items: center; gap: 10px; padding: 8px 16px; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .team-row:last-child { border-bottom: none; }
      `}</style>

      {/* Header */}
      <div style={{ background: "linear-gradient(180deg, #0f0f1a 0%, #07070d 100%)", borderBottom: "2px solid #FFB400", padding: "36px 48px 28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -20, width: 300, height: 300, background: "radial-gradient(circle, rgba(255,180,0,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ fontSize: 11, letterSpacing: 4, color: "#FFB400", fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>NFL Fan Violence Tracker</div>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 900, lineHeight: 0.9, letterSpacing: -1, textTransform: "uppercase" }}>
          Fights<br /><span style={{ color: "#FFB400" }}>In The</span><br />Stands
        </h1>
        <div style={{ marginTop: 16, fontSize: 14, color: "rgba(255,255,255,0.4)", fontFamily: "'Barlow', sans-serif" }}>
          Tracking documented fan altercations by team across NFL seasons
        </div>
      </div>

      <div style={{ padding: "32px 48px 0", maxWidth: 1100, margin: "0 auto" }}>

        {/* Tabs */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 36 }}>
          {YEARS.map(y => (
            <button key={y} className={`tab-btn ${y === "By Division" ? "div-tab" : ""} ${view === y ? "active" : ""}`} onClick={() => setView(y)}>
              {y}
            </button>
          ))}
        </div>

        {/* Stats bar */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, marginBottom: 32, padding: "16px 24px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 6 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>View</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#FFB400" }}>{view}</div>
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.08)" }} />
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Total Incidents</div>
            <div style={{ fontSize: 28, fontWeight: 900 }}>{total}</div>
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.08)" }} />
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>{isDivView ? "Divisions" : "Teams Involved"}</div>
            <div style={{ fontSize: 28, fontWeight: 900 }}>{data.length}</div>
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.08)" }} />
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>{isDivView ? "Rowdiest Division" : "Most Incidents"}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: data[0] ? getColor(data[0].team) : "#fff" }}>
              {data[0]?.team || "—"}
            </div>
          </div>
        </div>

        {/* ── BY DIVISION VIEW ── */}
        {isDivView ? (
          <>
            {/* Division summary chart */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "28px 24px", marginBottom: 32 }}>
              <div style={{ fontSize: 11, letterSpacing: 4, color: "#FFB400", fontWeight: 600, textTransform: "uppercase", marginBottom: 20 }}>
                Division Rankings — All-Time Combined Totals
              </div>
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={data} layout="vertical" margin={{ left: 90, right: 60, top: 4, bottom: 4 }}>
                  <XAxis type="number" tick={{ fontFamily: "'Barlow Condensed'", fill: "rgba(255,255,255,0.3)", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="team" tick={{ fontFamily: "'Barlow Condensed'", fill: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 600 }} axisLine={false} tickLine={false} width={88} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="count" radius={[0, 3, 3, 0]} barSize={26}
                    label={{ position: "right", fill: "rgba(255,255,255,0.55)", fontFamily: "'Barlow Condensed'", fontSize: 14, fontWeight: 700 }}>
                    {data.map((entry) => (
                      <Cell key={entry.team} fill={DIVISION_COLORS[entry.team] || "#555"} opacity={0.9} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Division cards grid */}
            <div style={{ fontSize: 11, letterSpacing: 4, color: "#FFB400", fontWeight: 600, textTransform: "uppercase", marginBottom: 16 }}>
              Team Breakdown By Division
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
              {divisionBreakdown.map(({ div, total: divTotal, teams }) => {
                const accent = DIVISION_COLORS[div] || "#FFB400";
                const maxTeamCount = teams[0]?.count || 1;
                const conference = div.split(" ")[0];
                const divName = div.split(" ").slice(1).join(" ");
                return (
                  <div key={div} className="div-card">
                    <div style={{ padding: "12px 16px", borderBottom: `2px solid ${accent}`, background: `linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 100%)`, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                      <div>
                        <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>{conference}</div>
                        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 0.5 }}>{divName}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 36, fontWeight: 900, color: accent, lineHeight: 1 }}>{divTotal}</div>
                        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: 2, textTransform: "uppercase" }}>total</div>
                      </div>
                    </div>
                    {teams.map(({ team, count }) => {
                      const pct = maxTeamCount > 0 ? (count / maxTeamCount) * 100 : 0;
                      const tColor = NFL_COLORS[team] || "#888";
                      return (
                        <div key={team} className="team-row">
                          <div style={{ width: 92, fontSize: 13, fontWeight: 700, color: count > 0 ? "#fff" : "rgba(255,255,255,0.3)" }}>{team}</div>
                          <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: tColor, borderRadius: 3 }} />
                          </div>
                          <div style={{ width: 24, textAlign: "right", fontSize: 14, fontWeight: 900, color: count > 0 ? tColor : "rgba(255,255,255,0.2)" }}>{count}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            {/* Standard bar chart */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "28px 24px", marginBottom: 8 }}>
              <ResponsiveContainer width="100%" height={Math.max(280, data.length * 32)}>
                <BarChart data={data} layout="vertical" margin={{ left: 80, right: 40, top: 4, bottom: 4 }}>
                  <XAxis type="number" tick={{ fontFamily: "'Barlow Condensed'", fill: "rgba(255,255,255,0.3)", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="team" tick={{ fontFamily: "'Barlow Condensed'", fill: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600 }} axisLine={false} tickLine={false} width={75} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="count" radius={[0, 3, 3, 0]} barSize={18}>
                    {data.map((entry) => (
                      <Cell key={entry.team} fill={NFL_COLORS[entry.team] || "#555"} opacity={0.9} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "'Barlow', sans-serif", marginBottom: 40, paddingLeft: 4 }}>
              * Bar colors represent each team's primary NFL color. "Unknown" tab includes incidents where the year could not be confirmed.
            </div>

            {/* Ranked list */}
            <div>
              <div style={{ fontSize: 11, letterSpacing: 4, color: "#FFB400", fontWeight: 600, textTransform: "uppercase", marginBottom: 16 }}>Full Ranking</div>
              {data.map((d, i) => {
                const pct = (d.count / maxCount) * 100;
                const color = NFL_COLORS[d.team] || "#888";
                return (
                  <div key={d.team} className="bar-row">
                    <div style={{ width: 28, fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.25)", textAlign: "right", flexShrink: 0 }}>#{i + 1}</div>
                    <div style={{ width: 110, fontSize: 15, fontWeight: 700, letterSpacing: 0.5, flexShrink: 0 }}>{d.team}</div>
                    <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.4s ease" }} />
                    </div>
                    <div style={{ width: 40, textAlign: "right", fontSize: 16, fontWeight: 900, color, flexShrink: 0 }}>{d.count}</div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { getEntries, saveEntries } from "../api/entries";

const START_DATE = "2026-07-16"; // Rebuild start date — set to your own start

function daysSince(dateStr) {
  const start = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return Math.max(diff, 0);
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function Sparkline({ points, accent }) {
  if (!points || points.length < 2) {
    return <div className="sparkline-empty">not enough data yet</div>;
  }
  const vals = points.map((p) => p.v);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const w = 260;
  const h = 40;
  const step = w / (points.length - 1);
  const path = points
    .map((p, i) => {
      const x = i * step;
      const y = h - ((p.v - min) / range) * (h - 6) - 3;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h}>
      <path d={path} fill="none" stroke={accent} strokeWidth="1.5" />
      {points.map((p, i) => {
        const x = i * step;
        const y = h - ((p.v - min) / range) * (h - 6) - 3;
        return <circle key={i} cx={x} cy={y} r="2" fill={accent} />;
      })}
    </svg>
  );
}

export default function RebuildTracker() {
  const [entries, setEntries] = useState({ income: [], credit: [], body: [] });
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState({
    applicationsSent: "",
    portfolioMinutes: "",
    creditBalance: "",
    utilization: "",
    weight: "",
    workoutDone: false,
  });
  const [saveState, setSaveState] = useState("idle");

  const dayCount = daysSince(START_DATE);

  const load = useCallback(async () => {
    const data = await getEntries();
    if (data) setEntries(data);
    setLoaded(true);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const persist = async (next) => {
    setSaveState("saving");
    try {
      await saveEntries(next);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1500);
    } catch (e) {
      setSaveState("error");
    }
  };

  const logToday = () => {
    const key = todayKey();
    const next = { income: [...entries.income], credit: [...entries.credit], body: [...entries.body] };

    if (form.applicationsSent !== "" || form.portfolioMinutes !== "") {
      next.income = next.income.filter((e) => e.date !== key);
      next.income.push({
        date: key,
        applications: Number(form.applicationsSent) || 0,
        portfolioMinutes: Number(form.portfolioMinutes) || 0,
      });
      next.income.sort((a, b) => (a.date > b.date ? 1 : -1));
    }
    if (form.creditBalance !== "" || form.utilization !== "") {
      next.credit = next.credit.filter((e) => e.date !== key);
      next.credit.push({
        date: key,
        balance: form.creditBalance !== "" ? Number(form.creditBalance) : null,
        utilization: form.utilization !== "" ? Number(form.utilization) : null,
      });
      next.credit.sort((a, b) => (a.date > b.date ? 1 : -1));
    }
    if (form.weight !== "" || form.workoutDone) {
      next.body = next.body.filter((e) => e.date !== key);
      next.body.push({
        date: key,
        weight: form.weight !== "" ? Number(form.weight) : null,
        workout: !!form.workoutDone,
      });
      next.body.sort((a, b) => (a.date > b.date ? 1 : -1));
    }

    setEntries(next);
    persist(next);
    setForm({
      applicationsSent: "",
      portfolioMinutes: "",
      creditBalance: "",
      utilization: "",
      weight: "",
      workoutDone: false,
    });
  };

  const incomePoints = entries.income.filter((e) => e.applications !== undefined).map((e) => ({ v: e.applications }));
  const creditPoints = entries.credit.filter((e) => e.utilization !== null && e.utilization !== undefined).map((e) => ({ v: e.utilization }));
  const bodyPoints = entries.body.filter((e) => e.weight !== null && e.weight !== undefined).map((e) => ({ v: e.weight }));

  const totalApplications = entries.income.reduce((s, e) => s + (e.applications || 0), 0);
  const totalPortfolioMin = entries.income.reduce((s, e) => s + (e.portfolioMinutes || 0), 0);
  const latestUtil = creditPoints.length ? creditPoints[creditPoints.length - 1].v : null;
  const latestWeight = bodyPoints.length ? bodyPoints[bodyPoints.length - 1].v : null;
  const workoutsLogged = entries.body.filter((e) => e.workout).length;

  if (!loaded) {
    return <div className="loading">loading ledger...</div>;
  }

  return (
    <div className="tracker-root">
      <header className="tracker-header">
        <div className="eyebrow">REBUILD LOG</div>
        <div className="day-count">DAY {dayCount}</div>
        <div className="subtext">since {START_DATE} — income / credit / body</div>
      </header>

      <section className="track-card">
        <div className="track-head">
          <span className="track-title">LOG TODAY</span>
          <span className="track-meta">{todayKey()}</span>
        </div>

        <div className="field-group">
          <div className="group-label">INCOME</div>
          <div className="field-grid">
            <div>
              <label className="field">Applications sent</label>
              <input type="number" min="0" value={form.applicationsSent}
                onChange={(e) => setForm({ ...form, applicationsSent: e.target.value })} placeholder="0" />
            </div>
            <div>
              <label className="field">Portfolio min.</label>
              <input type="number" min="0" value={form.portfolioMinutes}
                onChange={(e) => setForm({ ...form, portfolioMinutes: e.target.value })} placeholder="0" />
            </div>
          </div>
        </div>

        <div className="field-group">
          <div className="group-label">CREDIT</div>
          <div className="field-grid">
            <div>
              <label className="field">Total balance ($)</label>
              <input type="number" min="0" value={form.creditBalance}
                onChange={(e) => setForm({ ...form, creditBalance: e.target.value })} placeholder="25000" />
            </div>
            <div>
              <label className="field">Utilization (%)</label>
              <input type="number" min="0" max="100" value={form.utilization}
                onChange={(e) => setForm({ ...form, utilization: e.target.value })} placeholder="0" />
            </div>
          </div>
        </div>

        <div className="field-group">
          <div className="group-label">BODY</div>
          <div className="field-grid">
            <div>
              <label className="field">Weight (lbs)</label>
              <input type="number" min="0" value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="185" />
            </div>
            <div className="checkbox-row">
              <input type="checkbox" checked={form.workoutDone} id="workout"
                onChange={(e) => setForm({ ...form, workoutDone: e.target.checked })} />
              <label htmlFor="workout">trained today</label>
            </div>
          </div>
        </div>

        <button className="primary" onClick={logToday}>
          {saveState === "saving" ? "SAVING..." : saveState === "saved" ? "SAVED ✓" : "SAVE TODAY'S ENTRY"}
        </button>
        {saveState === "error" && <div className="error-text">Save failed — check connection and try again.</div>}
      </section>

      <section className="track-card">
        <div className="track-head">
          <span className="track-title">INCOME</span>
          <span className="track-meta">{entries.income.length} entries</span>
        </div>
        <div className="stat-row">
          <div className="stat">
            <div className="stat-val">{totalApplications}</div>
            <div className="stat-lbl">applications total</div>
          </div>
          <div className="stat">
            <div className="stat-val">{Math.round(totalPortfolioMin / 60)}h</div>
            <div className="stat-lbl">portfolio time</div>
          </div>
        </div>
        <Sparkline points={incomePoints} accent="#B08D57" />
      </section>

      <section className="track-card">
        <div className="track-head">
          <span className="track-title">CREDIT</span>
          <span className="track-meta">{entries.credit.length} entries</span>
        </div>
        <div className="stat-row">
          <div className="stat">
            <div className="stat-val">{latestUtil !== null ? `${latestUtil}%` : "—"}</div>
            <div className="stat-lbl">latest utilization</div>
          </div>
        </div>
        <Sparkline points={creditPoints} accent="#B08D57" />
      </section>

      <section className="track-card">
        <div className="track-head">
          <span className="track-title">BODY</span>
          <span className="track-meta">{entries.body.length} entries</span>
        </div>
        <div className="stat-row">
          <div className="stat">
            <div className="stat-val">{latestWeight !== null ? latestWeight : "—"}</div>
            <div className="stat-lbl">latest weight (lbs)</div>
          </div>
          <div className="stat">
            <div className="stat-val">{workoutsLogged}</div>
            <div className="stat-lbl">workouts logged</div>
          </div>
        </div>
        <Sparkline points={bodyPoints} accent="#B08D57" />
      </section>

      <footer className="tracker-footer">data persists via the storage layer — see /src/api/entries.js</footer>
    </div>
  );
}

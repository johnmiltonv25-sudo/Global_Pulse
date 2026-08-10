import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  ArrowRightLeft,
  PiggyBank,
  Calendar as CalendarIcon,
  Pencil,
  Wallet,
  History,
  PieChart,
  Award,
  TrendingUp,
} from "lucide-react";
 
import {
  CATEGORY_MAP,
  formatINR,
  dateKey,
  prettyDate,
  monthLabel,
  nextId,
  SEED_TRANSACTIONS,
  SEED_BUDGETS,
} from "./data.js";
import TransactionModal from "./TransactionModal.jsx";
import TransactionDetailModal from "./TransactionDetailModal.jsx";
import BudgetModal from "./BudgetModal.jsx";
import "./ExpenseTracker.css";
 
const WEEKDAYS = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
const LOCAL_STORAGE_BUDGETS_KEY = "global_pulse_et_budgets_v2";
const LOCAL_STORAGE_TX_KEY = "global_pulse_et_transactions_v2";
 
export default function ExpenseTracker() {
  // Persistent state initialized from localStorage to prevent deleted budgets/transactions from resetting on page navigation
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_TX_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error reading saved transactions:", e);
    }
    return SEED_TRANSACTIONS;
  });
 
  const [budgets, setBudgets] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_BUDGETS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error reading saved budgets:", e);
    }
    return SEED_BUDGETS;
  });
 
  // Save changes to localStorage whenever transactions or budgets update
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_TX_KEY, JSON.stringify(transactions));
    } catch (e) {
      console.error("Error saving transactions:", e);
    }
  }, [transactions]);
 
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_BUDGETS_KEY, JSON.stringify(budgets));
    } catch (e) {
      console.error("Error saving budgets:", e);
    }
  }, [budgets]);
 
  // Calendar view state — start on July 2026 to match seeded data.
  const [view, setView] = useState({ year: 2026, month: 6 });
  const [selected, setSelected] = useState("2026-07-01");
 
  // Dialog states
  const [txModal, setTxModal] = useState(null); // { mode, type, initial }
  const [detailTx, setDetailTx] = useState(null);
  const [budgetModal, setBudgetModal] = useState(null); // { mode, initial }
 
  // Ref for native month/year calendar picker
  const monthInputRef = useRef(null);
 
  const openNativeMonthPicker = () => {
    if (monthInputRef.current && monthInputRef.current.showPicker) {
      monthInputRef.current.showPicker();
    } else if (monthInputRef.current) {
      monthInputRef.current.click();
    }
  };
 
  /* ----- Derived values strictly for the active selected month ----- */
  const monthPrefix = dateKey(view.year, view.month, 1).slice(0, 7);
 
  const monthTx = useMemo(
    () => transactions.filter((t) => t.date.startsWith(monthPrefix)),
    [transactions, monthPrefix]
  );
 
  const totals = useMemo(() => {
    let income = 0;
    let spending = 0;
    for (const t of monthTx) {
      if (t.type === "income") income += t.amount;
      else spending += t.amount;
    }
    return { income, spending, savings: income - spending };
  }, [monthTx]);
 
  const breakdown = useMemo(() => {
    const map = new Map();
    for (const t of monthTx) {
      if (t.type !== "expense") continue;
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
    }
    const rows = [...map.entries()].map(([id, amount]) => ({
      id,
      amount,
      ...(CATEGORY_MAP[id] || { label: id, color: "#8a94a6" }),
    }));
    rows.sort((a, b) => b.amount - a.amount);
    const max = rows.reduce((m, r) => Math.max(m, r.amount), 0);
    return { rows, max };
  }, [monthTx]);
 
  /* Real-time spent calculation by category ONLY for the selected month */
  const spentByCategory = useMemo(() => {
    const map = {};
    for (const t of monthTx) {
      if (t.type !== "expense") continue;
      map[t.category] = (map[t.category] || 0) + t.amount;
    }
    return map;
  }, [monthTx]);
 
  /* MONTH-SCOPED BUDGETS: Filter budgets created specifically for the active selected month */
  const activeMonthBudgets = useMemo(
    () => budgets.filter((b) => b.month === monthPrefix),
    [budgets, monthPrefix]
  );
 
  /* Sorted Budget Buckets by Risk for the active month (Highest % Spent First) */
  const sortedBudgets = useMemo(() => {
    return [...activeMonthBudgets].sort((a, b) => {
      const spentA = spentByCategory[a.category] || 0;
      const spentB = spentByCategory[b.category] || 0;
      const pctA = a.limit ? (spentA / a.limit) * 100 : 0;
      const pctB = b.limit ? (spentB / b.limit) * 100 : 0;
      return pctB - pctA; // Highest risk/usage first
    });
  }, [activeMonthBudgets, spentByCategory]);
 
  // Days that have at least one transaction in active month
  const activeDays = useMemo(() => {
    const set = new Set();
    for (const t of monthTx) set.add(Number(t.date.slice(8, 10)));
    return set;
  }, [monthTx]);
 
  const dayTx = useMemo(
    () => transactions.filter((t) => t.date === selected),
    [transactions, selected]
  );
  const dayTotal = dayTx.reduce((s, t) => s + (t.type === "expense" ? t.amount : 0), 0);
 
  /* ----- Calendar Grid Calculation ----- */
  const cells = useMemo(() => {
    const first = new Date(view.year, view.month, 1);
    const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
    const startOffset = (first.getDay() + 6) % 7;
    const out = [];
    for (let i = 0; i < startOffset; i++) out.push(null);
    for (let d = 1; d <= daysInMonth; d++) out.push(d);
    return out;
  }, [view]);
 
  /* Month Navigation automatically defaults selected date to 1 of that month */
  const changeMonth = (dir) => {
    setView((v) => {
      let newYr = v.year;
      let newMo = v.month + dir;
      if (newMo < 0) {
        newYr -= 1;
        newMo = 11;
      } else if (newMo > 11) {
        newYr += 1;
        newMo = 0;
      }
      setSelected(dateKey(newYr, newMo, 1));
      return { year: newYr, month: newMo };
    });
  };
 
  /* ----- Mutations ----- */
  const nowTime = () =>
    new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
 
  const saveTx = (payload) => {
    const dateParts = payload.date.split("-").map(Number);
    const txYear = dateParts[0];
    const txMonth = dateParts[1] - 1;
    const txMonthKey = payload.date.slice(0, 7);
 
    if (txModal.mode === "edit") {
      const updatedTx = { ...txModal.initial, ...payload };
      setTransactions((list) =>
        list.map((t) => (String(t.id) === String(txModal.initial.id) ? updatedTx : t))
      );
      setView({ year: txYear, month: txMonth });
      setSelected(payload.date);
      setTxModal(null);
      setDetailTx(updatedTx);
    } else {
      const newTx = {
        id: nextId(),
        type: txModal.type,
        time: nowTime(),
        status: "Completed",
        ...payload,
      };
      setTransactions((list) => [newTx, ...list]);
      setView({ year: txYear, month: txMonth });
      setSelected(payload.date);
 
      // Auto-create month-scoped budget bucket for this specific month if missing
      if (txModal.type === "expense" && payload.category) {
        setBudgets((list) => {
          const exists = list.some((b) => b.month === txMonthKey && b.category === payload.category);
          if (!exists) {
            const catObj = CATEGORY_MAP[payload.category];
            const defaultLimit = Math.max(5000, Math.ceil(payload.amount / 1000) * 1000 + 3000);
            return [
              ...list,
              {
                id: nextId(),
                month: txMonthKey,
                category: payload.category,
                label: catObj ? catObj.label : payload.category,
                limit: defaultLimit,
                notes: "Auto-created category budget",
              },
            ];
          }
          return list;
        });
      }
 
      setTxModal(null);
    }
  };
 
  const deleteTx = (id) => {
    setTransactions((list) => list.filter((t) => String(t.id) !== String(id)));
    setDetailTx(null);
  };
 
  const editFromDetail = (tx) => {
    setDetailTx(null);
    setTxModal({ mode: "edit", type: tx.type, initial: tx });
  };
 
  /* Save budget bucket scoped strictly to the active selected month */
  const saveBudget = (payload) => {
    if (budgetModal.mode === "edit") {
      setBudgets((list) =>
        list.map((b) => (String(b.id) === String(budgetModal.initial.id) ? { ...b, ...payload } : b))
      );
    } else {
      setBudgets((list) => {
        const existingIndex = list.findIndex(
          (b) => b.month === monthPrefix && b.category === payload.category
        );
        if (existingIndex !== -1) {
          return list.map((b, idx) =>
            idx === existingIndex
              ? { ...b, limit: Number(b.limit) + Number(payload.limit), notes: payload.notes || b.notes }
              : b
          );
        }
        return [...list, { id: nextId(), month: monthPrefix, ...payload }];
      });
    }
    setBudgetModal(null);
  };
 
  const deleteBudget = (id) => {
    setBudgets((list) => list.filter((b) => String(b.id) !== String(id)));
    setBudgetModal(null);
  };
 
  return (
    <div className="goal-dash card-appear et-page">
      {/* ------------------- PAGE HEADER ------------------- */}
      <div className="goal-hero__head" style={{ marginBottom: "8px" }}>
        <div className="goal-hero__identity">
          <div className="goal-hero__icon-badge">
            <Wallet size={22} className="goal-hero__icon" />
          </div>
          <div>
            <div className="goal-hero__title-row">
              <h1 className="goal-hero__name">Expense Tracker</h1>
            </div>
            <p className="goal-hero__note">
              Monitor your spending, analyze category trends, and stay within your budget • {monthLabel(view.year, view.month)}
            </p>
          </div>
        </div>
 
        {/* Action CTAs */}
        <div className="goal-hero__actions">
          <button
            type="button"
            className="goal-hero__btn-secondary"
            onClick={() => setTxModal({ mode: "add", type: "income" })}
          >
            <Plus size={15} />
            <span>Add Income</span>
          </button>
 
          <button
            type="button"
            className="goal-hero__btn-primary"
            onClick={() => setTxModal({ mode: "add", type: "expense" })}
          >
            <PlusCircle size={16} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>
 
      {/* ------------------- SECTION 2: KPI CARDS GRID (Strictly for Active Month) ------------------- */}
      <div className="goal-kpi-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {/* KPI 1: Monthly Spending */}
        <div className="kpi-card kpi-card--amber">
          <div className="kpi-card__icon">
            <DollarSign size={16} />
          </div>
          <span className="kpi-card__label">Monthly Spending</span>
          <div className="kpi-card__val">{formatINR(totals.spending)}</div>
          <span className="kpi-card__sub" style={{ color: "#f5a524" }}>
            <TrendingUp size={12} />
            <span>{monthTx.filter((t) => t.type === "expense").length} Transactions ({monthLabel(view.year, view.month).split(" ")[0]})</span>
          </span>
        </div>
 
        {/* KPI 2: Total Income */}
        <div className="kpi-card kpi-card--green">
          <div className="kpi-card__icon">
            <ArrowRightLeft size={16} />
          </div>
          <span className="kpi-card__label">Total Income</span>
          <div className="kpi-card__val">{formatINR(totals.income)}</div>
          <span className="kpi-card__sub gp-pos">
            <TrendingUp size={12} />
            <span>{monthLabel(view.year, view.month).split(" ")[0]} income</span>
          </span>
        </div>
 
        {/* KPI 3: Net Savings */}
        <div className="kpi-card">
          <div className="kpi-card__icon">
            <PiggyBank size={16} />
          </div>
          <span className="kpi-card__label">Net Savings</span>
          <div className="kpi-card__val">{formatINR(totals.savings)}</div>
          <span className="kpi-card__sub" style={{ color: "#38bdf8" }}>
            <span>{monthLabel(view.year, view.month).split(" ")[0]} net balance</span>
          </span>
        </div>
 
        {/* KPI 4: Selected Day Total */}
        <div className="kpi-card">
          <div className="kpi-card__icon">
            <CalendarIcon size={16} />
          </div>
          <span className="kpi-card__label">Spent on {prettyDate(selected).slice(0, 6)}</span>
          <div className="kpi-card__val">{formatINR(dayTotal)}</div>
          <span className="kpi-card__sub" style={{ color: "#aeb6c7" }}>
            <span>{dayTx.length} items on this date</span>
          </span>
        </div>
      </div>
 
      {/* ------------------- SECTION 3: MAIN 2-COLUMN EQUAL GRID ------------------- */}
      <div className="goal-main-grid">
        {/* LEFT COLUMN: Calendar Navigation Panel */}
        <div className="goal-panel">
          <div className="goal-panel__head">
            {/* Direct Native Month Calendar Picker Trigger */}
            <div
              style={{ position: "relative", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
              onClick={openNativeMonthPicker}
              title="Click to open Month Calendar"
            >
              <CalendarIcon size={16} className="goal-panel__head-icon" />
              <h3 className="goal-panel__title">
                {monthLabel(view.year, view.month)} <span style={{ fontSize: "11px", color: "var(--text-3, #6b7385)" }}>▾</span>
              </h3>
              <input
                ref={monthInputRef}
                type="month"
                style={{
                  position: "absolute",
                  opacity: 0,
                  pointerEvents: "none",
                  width: 0,
                  height: 0,
                }}
                value={`${view.year}-${String(view.month + 1).padStart(2, "0")}`}
                onChange={(e) => {
                  if (!e.target.value) return;
                  const [y, m] = e.target.value.split("-").map(Number);
                  setView({ year: y, month: m - 1 });
                  setSelected(dateKey(y, m - 1, 1));
                }}
              />
            </div>
 
            <div className="et-cal__nav" style={{ marginLeft: "auto" }}>
              <button type="button" aria-label="Previous month" onClick={() => changeMonth(-1)}>
                <ChevronLeft size={16} />
              </button>
              <button type="button" aria-label="Next month" onClick={() => changeMonth(1)}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
 
          <div className="et-cal__weekdays">
            {WEEKDAYS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
 
          <div className="et-cal__grid">
            {cells.map((day, i) => {
              if (day === null)
                return <span key={`e${i}`} className="et-cal__cell et-cal__cell--empty" />;
              const key = dateKey(view.year, view.month, day);
              const isSelected = key === selected;
              const hasTx = activeDays.has(day);
              return (
                <button
                  key={key}
                  type="button"
                  className={`et-cal__cell ${isSelected ? "et-cal__cell--selected" : ""}`}
                  onClick={() => setSelected(key)}
                >
                  {day}
                  {hasTx && <span className="et-cal__dot" />}
                </button>
              );
            })}
          </div>
        </div>
 
        {/* RIGHT COLUMN: Selected Day Transactions List */}
        <div className="goal-panel">
          <div className="goal-panel__head">
            <div className="goal-panel__head-left">
              <History size={16} className="goal-panel__head-icon" />
              <h3 className="goal-panel__title">Transactions</h3>
              <span className="history-count-badge">{dayTx.length} Items</span>
            </div>
            <span className="history-row__date" style={{ marginLeft: "auto", fontSize: "11px", color: "var(--blue-bright, #38bdf8)" }}>
              {prettyDate(selected)}
            </span>
          </div>
 
          <div className="history-scroll" style={{ maxHeight: "310px" }}>
            {dayTx.length > 0 ? (
              <div className="history-list">
                {dayTx.map((t) => {
                  const cat = t.category ? CATEGORY_MAP[t.category] : null;
                  const Icon = cat?.icon ?? ArrowRightLeft;
                  const accent = t.type === "income" ? "#2ec27e" : cat?.color ?? "#2f6bff";
                  return (
                    <div
                      key={t.id}
                      className="history-row"
                      style={{ cursor: "pointer" }}
                      onClick={() => setDetailTx(t)}
                    >
                      <div className="history-row__left">
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "6px",
                              background: `${accent}22`,
                              color: accent,
                              display: "grid",
                              placeItems: "center",
                              flexShrink: 0,
                            }}
                          >
                            <Icon size={13} />
                          </span>
                          <span className="history-row__date" style={{ fontSize: "13px" }}>
                            {t.notes || (cat ? cat.label : "Income")}
                          </span>
                        </div>
                        <span
                          className="asset-pill"
                          style={{
                            borderColor: `${accent}40`,
                            color: accent,
                            background: `${accent}15`,
                            marginTop: "2px",
                          }}
                        >
                          {t.type === "income" ? "INCOME" : cat?.label ?? "EXPENSE"}
                        </span>
                      </div>
 
                      <div className="history-row__right">
                        <span className={`history-row__amt ${t.type === "income" ? "gp-pos" : "gp-neg"}`}>
                          {t.type === "income" ? "+" : "-"}
                          {formatINR(t.amount)}
                        </span>
                        <span className="history-row__meta">
                          {t.method} • {t.time || "Today"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="history-empty">
                <p>No transactions recorded for {prettyDate(selected)}.</p>
                <button
                  type="button"
                  className="history-add-link"
                  onClick={() => setTxModal({ mode: "add", type: "expense" })}
                >
                  + Add Expense for this date
                </button>
              </div>
            )}
          </div>
 
          <div
            style={{
              marginTop: "auto",
              paddingTop: "10px",
              borderTop: "1px solid var(--border, rgba(255, 255, 255, 0.08))",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            <span style={{ color: "var(--text-2, #aeb6c7)" }}>Total Spent Today</span>
            <span className="gp-mono" style={{ color: "#ffffff" }}>
              {formatINR(dayTotal)}
            </span>
          </div>
        </div>
      </div>
 
      {/* ------------------- SECTION 4: BOTTOM 2-COLUMN EQUAL GRID (Breakdown & Budgets) ------------------- */}
      <div className="goal-main-grid">
        {/* LEFT COLUMN: Category Breakdown Panel */}
        <div className="goal-panel">
          <div className="goal-panel__head">
            <PieChart size={16} className="goal-panel__head-icon" />
            <h3 className="goal-panel__title">Category Breakdown ({monthLabel(view.year, view.month).split(" ")[0]})</h3>
            <span className="history-count-badge">{breakdown.rows.length} Categories</span>
          </div>
 
          <div className="history-scroll" style={{ maxHeight: "320px" }}>
            {breakdown.rows.length > 0 ? (
              <div className="history-list">
                {breakdown.rows.map((r) => {
                  const Icon = r.icon;
                  const pct = breakdown.max ? Math.round((r.amount / breakdown.max) * 100) : 0;
                  return (
                    <div key={r.id} className="et-break-item">
                      <div className="et-break-item__top">
                        <div className="et-break-item__left">
                          <span
                            className="et-break-item__icon"
                            style={{ background: `${r.color}22`, color: r.color }}
                          >
                            {Icon && <Icon size={14} />}
                          </span>
                          <span className="et-break-item__title">{r.label}</span>
                        </div>
                        <span className="et-break-item__amt">{formatINR(r.amount)}</span>
                      </div>
                      <div className="goal-hero__track" style={{ height: "6px" }}>
                        <div
                          className="goal-hero__bar"
                          style={{ width: `${pct}%`, background: r.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="history-empty">
                <p>No expense breakdown available for {monthLabel(view.year, view.month)}.</p>
              </div>
            )}
          </div>
        </div>
 
        {/* RIGHT COLUMN: Budget Setup Panel (Scoped strictly to Active Month) */}
        <div className="goal-panel">
          <div className="goal-panel__head">
            <Award size={16} className="goal-panel__head-icon" />
            <h3 className="goal-panel__title">Budget Buckets ({monthLabel(view.year, view.month).split(" ")[0]})</h3>
            <button
              type="button"
              className="goal-hero__btn-secondary"
              style={{ marginLeft: "auto", padding: "6px 12px", fontSize: "12px" }}
              onClick={() => setBudgetModal({ mode: "add" })}
            >
              <Plus size={14} />
              <span>Add Budget</span>
            </button>
          </div>
 
          <div className="history-scroll" style={{ maxHeight: "320px" }}>
            {sortedBudgets.length > 0 ? (
              <div className="history-list">
                {sortedBudgets.map((b) => {
                  const cat = CATEGORY_MAP[b.category];
                  const Icon = cat?.icon;
                  const spent = spentByCategory[b.category] || 0;
                  const pct = b.limit ? Math.min(Math.round((spent / b.limit) * 100), 100) : 0;
                  const over = spent > b.limit;
                  const remaining = b.limit - spent;
                  const barColor = over ? "#ef4b5b" : pct >= 85 ? "#f5a524" : "#2ec27e";
 
                  return (
                    <div key={b.id} className="et-budget-item">
                      <div className="et-budget-item__head">
                        <div className="et-budget-item__info">
                          <span
                            className="et-budget-item__icon"
                            style={{ background: `${cat?.color || "#38bdf8"}22`, color: cat?.color || "#38bdf8" }}
                          >
                            {Icon && <Icon size={14} />}
                          </span>
                          <div>
                            <div className="et-budget-item__name">{b.label}</div>
                            {b.notes && <div className="et-budget-item__note">{b.notes}</div>}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="et-budget-item__edit-btn"
                          aria-label={`Edit ${b.label} budget`}
                          onClick={() => setBudgetModal({ mode: "edit", initial: b })}
                        >
                          <Pencil size={13} />
                        </button>
                      </div>
 
                      <div className="goal-hero__track" style={{ height: "6px" }}>
                        <div
                          className="goal-hero__bar"
                          style={{ width: `${pct}%`, background: barColor }}
                        />
                      </div>
 
                      <div className="et-budget-item__meta">
                        <span>{formatINR(spent)} / {formatINR(b.limit)}</span>
                        <span style={{ color: over ? "#ef4b5b" : "var(--text-2, #aeb6c7)", fontWeight: 600 }}>
                          {over ? `Over by ${formatINR(spent - b.limit)}` : `${formatINR(remaining)} left`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="history-empty">
                <p>No budget buckets set up for {monthLabel(view.year, view.month)}.</p>
              </div>
            )}
          </div>
        </div>
      </div>
 
      {/* Dialogs */}
      <TransactionModal
        open={!!txModal}
        mode={txModal?.mode}
        type={txModal?.type}
        initial={txModal?.initial}
        onClose={() => setTxModal(null)}
        onSave={saveTx}
      />
      <TransactionDetailModal
        open={!!detailTx}
        tx={detailTx}
        onClose={() => setDetailTx(null)}
        onEdit={editFromDetail}
        onDelete={deleteTx}
      />
      <BudgetModal
        open={!!budgetModal}
        mode={budgetModal?.mode}
        initial={budgetModal?.initial}
        onClose={() => setBudgetModal(null)}
        onSave={saveBudget}
        onDeleteBudget={deleteBudget}
      />
    </div>
  );
}
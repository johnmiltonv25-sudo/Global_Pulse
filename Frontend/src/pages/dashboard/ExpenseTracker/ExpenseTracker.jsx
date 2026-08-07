import { useMemo, useState } from "react"
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  ArrowRightLeft,
  PiggyBank,
  Calendar as CalendarIcon,
  Pencil,
} from "lucide-react"

import {
  CATEGORY_MAP,
  formatINR,
  dateKey,
  prettyDate,
  monthLabel,
  nextId,
  SEED_TRANSACTIONS,
  SEED_BUDGETS,
} from "./data.js"
import TransactionModal from "./TransactionModal.jsx"
import TransactionDetailModal from "./TransactionDetailModal.jsx"
import BudgetModal from "./BudgetModal.jsx"
import "./ExpenseTracker.css"

const WEEKDAYS = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"]

export default function ExpenseTracker() {
  const [transactions, setTransactions] = useState(SEED_TRANSACTIONS)
  const [budgets, setBudgets] = useState(SEED_BUDGETS)

  // Calendar view state — start on July 2026 to match the seeded data.
  const [view, setView] = useState({ year: 2026, month: 6 })
  const [selected, setSelected] = useState("2026-07-26")

  // Dialog state
  const [txModal, setTxModal] = useState(null) // { mode, type, initial }
  const [detailTx, setDetailTx] = useState(null)
  const [budgetModal, setBudgetModal] = useState(null) // { mode, initial }

  /* ----- Derived values for the visible month ----- */
  const monthPrefix = dateKey(view.year, view.month, 1).slice(0, 7)

  const monthTx = useMemo(
    () => transactions.filter((t) => t.date.startsWith(monthPrefix)),
    [transactions, monthPrefix],
  )

  const totals = useMemo(() => {
    let income = 0
    let spending = 0
    for (const t of monthTx) {
      if (t.type === "income") income += t.amount
      else spending += t.amount
    }
    return { income, spending, savings: income - spending }
  }, [monthTx])

  const breakdown = useMemo(() => {
    const map = new Map()
    for (const t of monthTx) {
      if (t.type !== "expense") continue
      map.set(t.category, (map.get(t.category) || 0) + t.amount)
    }
    const rows = [...map.entries()].map(([id, amount]) => ({
      id,
      amount,
      ...(CATEGORY_MAP[id] || { label: id, color: "#8a94a6" }),
    }))
    rows.sort((a, b) => b.amount - a.amount)
    const max = rows.reduce((m, r) => Math.max(m, r.amount), 0)
    return { rows, max }
  }, [monthTx])

  const spentByCategory = useMemo(() => {
    const map = {}
    for (const t of monthTx) {
      if (t.type !== "expense") continue
      map[t.category] = (map[t.category] || 0) + t.amount
    }
    return map
  }, [monthTx])

  // Days that have at least one transaction (for calendar dots).
  const activeDays = useMemo(() => {
    const set = new Set()
    for (const t of monthTx) set.add(Number(t.date.slice(8, 10)))
    return set
  }, [monthTx])

  const dayTx = useMemo(
    () => transactions.filter((t) => t.date === selected),
    [transactions, selected],
  )
  const dayTotal = dayTx.reduce((s, t) => s + (t.type === "expense" ? t.amount : 0), 0)

  /* ----- Calendar grid (Monday-first) ----- */
  const cells = useMemo(() => {
    const first = new Date(view.year, view.month, 1)
    const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()
    const startOffset = (first.getDay() + 6) % 7 // convert Sun-first to Mon-first
    const out = []
    for (let i = 0; i < startOffset; i++) out.push(null)
    for (let d = 1; d <= daysInMonth; d++) out.push(d)
    return out
  }, [view])

  const changeMonth = (dir) => {
    setView((v) => {
      const m = v.month + dir
      if (m < 0) return { year: v.year - 1, month: 11 }
      if (m > 11) return { year: v.year + 1, month: 0 }
      return { ...v, month: m }
    })
  }

  /* ----- Mutations ----- */
  const nowTime = () =>
    new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })

  const saveTx = (payload) => {
    if (txModal.mode === "edit") {
      setTransactions((list) =>
        list.map((t) => (t.id === txModal.initial.id ? { ...t, ...payload } : t)),
      )
    } else {
      setTransactions((list) => [
        {
          id: nextId(),
          type: txModal.type,
          time: nowTime(),
          status: "Completed",
          ...payload,
        },
        ...list,
      ])
      setSelected(payload.date)
    }
    setTxModal(null)
  }

  const deleteTx = (id) => {
    setTransactions((list) => list.filter((t) => t.id !== id))
    setDetailTx(null)
  }

  const editFromDetail = (tx) => {
    setDetailTx(null)
    setTxModal({ mode: "edit", type: tx.type, initial: tx })
  }

  const saveBudget = (payload) => {
    if (budgetModal.mode === "edit") {
      setBudgets((list) =>
        list.map((b) => (b.id === budgetModal.initial.id ? { ...b, ...payload } : b)),
      )
    } else {
      const catId =
        Object.values(CATEGORY_MAP).find(
          (c) => c.label.toLowerCase() === payload.label.toLowerCase(),
        )?.id || "other"
      setBudgets((list) => [...list, { id: nextId(), category: catId, ...payload }])
    }
    setBudgetModal(null)
  }

  return (
    <div className="gp-page et-page">
      {/* Header */}
      <header className="et-header">
        <div>
          <h1 className="et-header__title">Track Expenses</h1>
          <p className="et-header__sub">Monitor your spending and stay on budget.</p>
        </div>
        <div className="et-header__actions">
          <button
            className="et-btn et-btn--income"
            onClick={() => setTxModal({ mode: "add", type: "income" })}
          >
            <Plus size={18} /> Add Income
          </button>
          <button
            className="et-btn et-btn--primary"
            onClick={() => setTxModal({ mode: "add", type: "expense" })}
          >
            <Plus size={18} /> Add Expense
          </button>
        </div>
      </header>

      {/* Summary cards */}
      <div className="et-summary">
        <SummaryCard icon={DollarSign} label="MONTHLY SPENDING" value={formatINR(totals.spending)} />
        <SummaryCard icon={ArrowRightLeft} label="INCOME" value={formatINR(totals.income)} />
        <SummaryCard icon={PiggyBank} label="SAVINGS" value={formatINR(totals.savings)} />
      </div>

      {/* Calendar + Transactions */}
      <div className="et-main-grid">
        <section className="et-panel et-cal">
          <div className="et-cal__head">
            <h2 className="et-panel__title">{monthLabel(view.year, view.month)}</h2>
            <div className="et-cal__nav">
              <button aria-label="Previous month" onClick={() => changeMonth(-1)}>
                <ChevronLeft size={18} />
              </button>
              <button aria-label="Next month" onClick={() => changeMonth(1)}>
                <ChevronRight size={18} />
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
              if (day === null) return <span key={`e${i}`} className="et-cal__cell et-cal__cell--empty" />
              const key = dateKey(view.year, view.month, day)
              const isSelected = key === selected
              const hasTx = activeDays.has(day)
              return (
                <button
                  key={key}
                  className={`et-cal__cell${isSelected ? " et-cal__cell--selected" : ""}`}
                  onClick={() => setSelected(key)}
                >
                  {day}
                  {hasTx && <span className="et-cal__dot" />}
                </button>
              )
            })}
          </div>
        </section>

        <section className="et-panel et-tx">
          <h2 className="et-panel__title">Transactions</h2>
          <p className="et-tx__date">{prettyDate(selected).toUpperCase()}</p>

          {dayTx.length === 0 ? (
            <p className="et-tx__empty">No transactions on this day.</p>
          ) : (
            <ul className="et-tx__list">
              {dayTx.map((t) => {
                const cat = t.category ? CATEGORY_MAP[t.category] : null
                const Icon = cat?.icon ?? ArrowRightLeft
                const accent = t.type === "income" ? "#2ec27e" : cat?.color ?? "#2f6bff"
                return (
                  <li key={t.id}>
                    <button className="et-tx__item" onClick={() => setDetailTx(t)}>
                      <span className="et-tx__icon" style={{ background: accent }}>
                        <Icon size={16} color="#05060a" />
                      </span>
                      <span className="et-tx__info">
                        <span className="et-tx__label">{t.notes || (cat ? cat.label : "Income")}</span>
                        <span className="et-tx__cat">{t.type === "income" ? "Income" : cat?.label}</span>
                      </span>
                      <span className={`et-tx__amt ${t.type === "income" ? "gp-pos" : "gp-neg"}`}>
                        {t.type === "income" ? "+" : ""}
                        {formatINR(t.amount)}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          <div className="et-tx__total">
            <span>Total spent</span>
            <span className="gp-mono">{formatINR(dayTotal)}</span>
          </div>
        </section>
      </div>

      <div className="et-bottom-grid">
        {/* Category breakdown */}
        <section className="et-panel et-break et-category-breakdown">
        <div className="et-break__head">
          <h2 className="et-panel__title">Category Breakdown</h2>
          <span className="et-break__month">
            {monthLabel(view.year, view.month)} <CalendarIcon size={16} />
          </span>
        </div>

        {breakdown.rows.length === 0 ? (
          <p className="et-tx__empty">No expenses recorded this month.</p>
        ) : (
          <ul className="et-break__list">
            {breakdown.rows.map((r) => {
              const Icon = r.icon
              const pct = breakdown.max ? Math.round((r.amount / breakdown.max) * 100) : 0
              return (
                <li key={r.id} className="et-break__row">
                  <span className="et-break__icon" style={{ background: r.color }}>
                    {Icon && <Icon size={15} color="#05060a" />}
                  </span>
                  <span className="et-break__label">{r.label}</span>
                  <span className="et-break__bar">
                    <span
                      className="et-break__fill"
                      style={{ "--val": `${pct}%`, background: r.color }}
                    />
                  </span>
                  <span className="et-break__amt gp-mono">{formatINR(r.amount)}</span>
                </li>
              )
            })}
          </ul>
        )}
        </section>

        {/* Budget setup */}
        <section className="et-panel et-budget">
        <div className="et-budget__head">
          <div>
            <h2 className="et-budget__title">Budget Setup</h2>
            <p className="et-header__sub">Manage your monthly allocations for {monthLabel(view.year, view.month)}</p>
          </div>
          <button className="et-btn et-btn--primary" onClick={() => setBudgetModal({ mode: "add" })}>
            <Plus size={18} /> Add Budget
          </button>
        </div>

        <div className="et-budget__grid">
          {budgets.map((b) => {
            const cat = CATEGORY_MAP[b.category]
            const Icon = cat?.icon
            const spent = spentByCategory[b.category] || 0
            const pct = b.limit ? Math.min(Math.round((spent / b.limit) * 100), 100) : 0
            const over = spent > b.limit
            const remaining = b.limit - spent
            const tone = over ? "over" : pct >= 85 ? "warn" : "ok"
            return (
              <article key={b.id} className="et-budget-card">
                <div className="et-budget-card__top">
                  <span className="et-budget-card__icon" style={{ color: cat?.color, background: `${cat?.color}22` }}>
                    {Icon && <Icon size={18} />}
                  </span>
                  <div className="et-budget-card__meta">
                    <span className="et-budget-card__name">{b.label}</span>
                    <span className="et-budget-card__note">{b.notes || "Monthly budget"}</span>
                  </div>
                  <button
                    className="et-budget-card__edit"
                    aria-label={`Edit ${b.label} budget`}
                    onClick={() => setBudgetModal({ mode: "edit", initial: b })}
                  >
                    <Pencil size={16} />
                  </button>
                </div>

                <div className="et-budget-card__row">
                  <span>Spent</span>
                  <span className="gp-mono">
                    {formatINR(spent)} / {formatINR(b.limit)}
                  </span>
                </div>
                <span className={`et-budget-bar et-budget-bar--${tone}`}>
                  <span className="et-budget-bar__fill" style={{ "--val": `${pct}%` }} />
                </span>
                <div className="et-budget-card__row et-budget-card__row--foot">
                  <span>{over ? "Over budget" : "Remaining"}</span>
                  <span className={`gp-mono ${over ? "gp-neg" : "gp-pos"}`}>{formatINR(Math.abs(remaining))}</span>
                </div>
              </article>
            )
          })}
        </div>
        </section>
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
      />
    </div>
  )
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <article className="et-sum">
      <span className="et-sum__icon">
        <Icon size={18} />
      </span>
      <p className="et-sum__label">{label}</p>
      <p className="et-sum__value gp-mono">{value}</p>
    </article>
  )
}
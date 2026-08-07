import { useEffect, useState } from "react"
import { Plus, Pencil, IndianRupee, Calendar, Banknote, Shapes, FileText, CheckCircle2, ChevronDown } from "lucide-react"

import Modal from "./Modal.jsx"
import { CATEGORIES, PAYMENT_METHODS } from "./data.js"

const BLANK = { amount: "", category: "food", date: "", method: "Cash", notes: "" }

/**
 * One dialog that drives Add Income, Add Expense and Edit Transaction.
 * `mode` = "add" | "edit"; `type` = "income" | "expense".
 */
export default function TransactionModal({ open, mode, type, initial, onClose, onSave }) {
  const isEdit = mode === "edit"
  const isExpense = type === "expense"
  const [form, setForm] = useState(BLANK)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open) return
    const today = new Date().toISOString().slice(0, 10)
    setForm(
      initial
        ? {
            amount: String(initial.amount ?? ""),
            category: initial.category ?? "food",
            date: initial.date ?? today,
            method: initial.method ?? "Cash",
            notes: initial.notes ?? "",
          }
        : { ...BLANK, date: today },
    )
    setError("")
  }, [open, initial])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const amount = Number(form.amount)
    if (!form.amount || Number.isNaN(amount) || amount <= 0) {
      setError("Enter a valid amount greater than 0.")
      return
    }
    if (!form.date) {
      setError("Please choose a date.")
      return
    }
    onSave({
      amount,
      category: isExpense ? form.category : null,
      date: form.date,
      method: form.method,
      notes: form.notes.trim(),
    })
  }

  const title = isEdit ? "Edit Transaction" : isExpense ? "Add Expense" : "Add Income"
  const cta = isEdit ? "Confirm Edit" : isExpense ? "Save Expense" : "Save Income"
  const TitleIcon = isEdit ? Pencil : Plus

  return (
    <Modal open={open} onClose={onClose} labelledBy="et-tx-title">
      <div className="et-modal__head">
        <span className="et-modal__badge">
          <TitleIcon size={18} />
        </span>
        <h2 id="et-tx-title" className="et-modal__title">
          {title}
        </h2>
      </div>

      <form className="et-modal__body" onSubmit={submit}>
        <label className="et-field">
          <span className="et-field__label">Amount</span>
          <span className="et-input-wrap">
            <IndianRupee size={16} className="et-input-icon" />
            <input
              className="et-input"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              value={form.amount}
              onChange={set("amount")}
              autoFocus
            />
          </span>
        </label>

        {isExpense && (
          <label className="et-field">
            <span className="et-field__label">Category</span>
            <span className="et-input-wrap">
              <Shapes size={16} className="et-input-icon" />
              <select className="et-input et-select" value={form.category} onChange={set("category")}>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="et-input-caret" />
            </span>
          </label>
        )}

        <label className="et-field">
          <span className="et-field__label">Date</span>
          <span className="et-input-wrap">
            <Calendar size={16} className="et-input-icon" />
            <input className="et-input" type="date" value={form.date} onChange={set("date")} />
          </span>
        </label>

        <label className="et-field">
          <span className="et-field__label">Payment Method</span>
          <span className="et-input-wrap">
            <Banknote size={16} className="et-input-icon" />
            <select className="et-input et-select" value={form.method} onChange={set("method")}>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="et-input-caret" />
          </span>
        </label>

        <label className="et-field">
          <span className="et-field__label">{isExpense ? "Detailed Notes" : "Notes (Optional)"}</span>
          <span className="et-input-wrap">
            <FileText size={16} className="et-input-icon et-input-icon--top" />
            <textarea
              className="et-input et-textarea"
              rows={2}
              placeholder="Add notes"
              value={form.notes}
              onChange={set("notes")}
            />
          </span>
        </label>

        {error && <p className="et-error">{error}</p>}

        <div className="et-modal__foot">
          {!isEdit && (
            <button type="button" className="et-btn et-btn--muted" onClick={onClose}>
              Cancel
            </button>
          )}
          <button type="submit" className="et-btn et-btn--primary et-btn--grow">
            {isEdit ? <Pencil size={18} /> : <CheckCircle2 size={18} />}
            {cta}
          </button>
        </div>
      </form>
    </Modal>
  )
}

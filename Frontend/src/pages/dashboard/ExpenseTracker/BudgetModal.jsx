import { useEffect, useState } from "react"
import { Plus, Pencil, Tag, IndianRupee, FileText } from "lucide-react"

import Modal from "./Modal.jsx"

const BLANK = { label: "", limit: "", notes: "" }

/** Add / Edit a budget bucket. */
export default function BudgetModal({ open, mode, initial, onClose, onSave }) {
  const isEdit = mode === "edit"
  const [form, setForm] = useState(BLANK)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open) return
    setForm(
      initial
        ? { label: initial.label ?? "", limit: String(initial.limit ?? ""), notes: initial.notes ?? "" }
        : BLANK,
    )
    setError("")
  }, [open, initial])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const limit = Number(form.limit)
    if (!form.label.trim()) {
      setError("Please name the category.")
      return
    }
    if (!form.limit || Number.isNaN(limit) || limit <= 0) {
      setError("Enter a monthly limit greater than 0.")
      return
    }
    onSave({ label: form.label.trim(), limit, notes: form.notes.trim() })
  }

  return (
    <Modal open={open} onClose={onClose} labelledBy="et-budget-title">
      <div className="et-modal__head et-modal__head--between">
        <div>
          <h2 id="et-budget-title" className="et-modal__title">
            {isEdit ? "Edit Budget" : "Add Budget"}
          </h2>
          <p className="et-modal__sub">
            {isEdit ? "Update this tracking bucket." : "Define a new tracking bucket for your finances."}
          </p>
        </div>
        <span className="et-modal__badge et-modal__badge--outline">
          {isEdit ? <Pencil size={18} /> : <Plus size={18} />}
        </span>
      </div>

      <form className="et-modal__body" onSubmit={submit}>
        <label className="et-field">
          <span className="et-field__label">Category</span>
          <span className="et-input-wrap">
            <Tag size={16} className="et-input-icon" />
            <input
              className="et-input"
              type="text"
              placeholder="e.g., Subscription Services"
              value={form.label}
              onChange={set("label")}
              autoFocus
            />
          </span>
        </label>

        <label className="et-field">
          <span className="et-field__label">Monthly Budget Limit</span>
          <span className="et-input-wrap">
            <IndianRupee size={16} className="et-input-icon" />
            <input
              className="et-input"
              type="number"
              min="0"
              step="1"
              inputMode="decimal"
              placeholder="0.00"
              value={form.limit}
              onChange={set("limit")}
            />
          </span>
        </label>

        <label className="et-field">
          <span className="et-field__label">Notes</span>
          <span className="et-input-wrap">
            <FileText size={16} className="et-input-icon et-input-icon--top" />
            <textarea
              className="et-input et-textarea"
              rows={2}
              placeholder="Additional details about this category..."
              value={form.notes}
              onChange={set("notes")}
            />
          </span>
        </label>

        {error && <p className="et-error">{error}</p>}

        <div className="et-modal__foot">
          <button type="button" className="et-btn et-btn--muted" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="et-btn et-btn--primary et-btn--grow">
            {isEdit ? <Pencil size={18} /> : <Plus size={18} />}
            {isEdit ? "Confirm Edit" : "Create Budget"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

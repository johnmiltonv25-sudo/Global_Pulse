import { Calendar, Clock, Banknote, CheckCircle2, Trash2, Pencil } from "lucide-react"

import Modal from "./Modal.jsx"
import { CATEGORY_MAP, formatINR, prettyDate } from "./data.js"

/** Read-only transaction card with Delete / Edit actions. */
export default function TransactionDetailModal({ open, tx, onClose, onEdit, onDelete }) {
  if (!tx) return null

  const cat = tx.category ? CATEGORY_MAP[tx.category] : null
  const Icon = cat?.icon ?? Banknote
  const accent = tx.type === "income" ? "#2ec27e" : (cat?.color ?? "#2f6bff")

  return (
    <Modal open={open} onClose={onClose} labelledBy="et-detail-title">
      <div className="et-detail">
        <span className="et-detail__icon" style={{ background: accent }}>
          <Icon size={30} color="#05060a" />
        </span>
        <h2 id="et-detail-title" className="et-detail__name">
          {tx.notes || (cat ? cat.label : "Income")}
        </h2>
        <p className="et-detail__cat" style={{ color: accent }}>
          {tx.type === "income" ? "INCOME" : (cat?.label ?? "").toUpperCase()}
        </p>
        <p className="et-detail__amount">
          <span className={tx.type === "income" ? "gp-pos" : "gp-neg"}>
            {tx.type === "income" ? "+" : "-"}
            {formatINR(tx.amount)}
          </span>
        </p>

        <div className="et-detail__grid">
          <div className="et-detail__item">
            <span className="et-detail__key">Date</span>
            <span className="et-detail__val">
              <Calendar size={16} /> {prettyDate(tx.date)}
            </span>
          </div>
          <div className="et-detail__item">
            <span className="et-detail__key">Time</span>
            <span className="et-detail__val">
              <Clock size={16} /> {tx.time || "—"}
            </span>
          </div>
          <div className="et-detail__item">
            <span className="et-detail__key">Payment Method</span>
            <span className="et-detail__val">
              <Banknote size={16} /> {tx.method}
            </span>
          </div>
          <div className="et-detail__item">
            <span className="et-detail__key">Status</span>
            <span className="et-detail__val gp-pos">
              <CheckCircle2 size={16} /> {tx.status || "Completed"}
            </span>
          </div>
        </div>

        <div className="et-modal__foot et-modal__foot--split">
          <button type="button" className="et-btn et-btn--danger et-btn--grow" onClick={() => onDelete(tx.id)}>
            <Trash2 size={18} /> Delete
          </button>
          <button type="button" className="et-btn et-btn--primary et-btn--grow" onClick={() => onEdit(tx)}>
            <Pencil size={18} /> Edit
          </button>
        </div>
      </div>
    </Modal>
  )
}

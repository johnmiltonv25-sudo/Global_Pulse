import { useEffect } from "react"
import { X } from "lucide-react"

/**
 * Base modal shell used by every Expense Tracker dialog.
 * Handles the dimmed overlay, click-outside + Escape to close, and scroll lock.
 */
export default function Modal({ open, onClose, children, labelledBy }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="et-overlay" onMouseDown={onClose}>
      <div
        className="et-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button type="button" className="et-modal__close" onClick={onClose} aria-label="Close dialog">
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  )
}

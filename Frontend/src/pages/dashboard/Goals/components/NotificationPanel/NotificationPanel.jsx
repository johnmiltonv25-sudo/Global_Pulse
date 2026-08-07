import React from "react"
import "./NotificationPanel.css"
import { X } from "lucide-react"

export default function NotificationPanel({ open, onClose, notifications = [] }) {
  return (
    <div className={`np-root${open?" is-open":""}`}>
      <div className="np-inner">
        <div className="np-head">
          <h3>Notifications</h3>
          <button className="icon-btn" onClick={onClose}><X /></button>
        </div>
        <div className="np-list">
          {notifications.map(n=> (
            <div key={n.id} className="np-card">
              <div>
                <div className="np-title">{n.title}</div>
                <div className="np-meta">{n.meta}</div>
              </div>
              <div className="np-time">{n.time}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="np-backdrop" onClick={onClose} />
    </div>
  )
}

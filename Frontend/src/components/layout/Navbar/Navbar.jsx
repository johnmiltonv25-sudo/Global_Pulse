import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Bell, ChevronDown, User, LogOut } from "lucide-react"

import Logo from "../../common/Logo/Logo.jsx"
import NotificationPanel from "../../../pages/dashboard/Goals/components/NotificationPanel/NotificationPanel.jsx"
import "./Navbar.css"

const NOTIFICATIONS = [
  { id: 1, title: "Reliance up 2.45%", meta: "Crossed intraday resistance", time: "2m" },
  { id: 2, title: "USD / INR alert", meta: "Rupee slips past 83.20", time: "18m" },
  { id: 3, title: "Weekly digest ready", meta: "Your market summary is live", time: "1h" },
]

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState(null) // "notif" | "profile" | null
  const navRef = useRef(null)
  const navigate = useNavigate()

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user")
      return saved ? JSON.parse(saved) : null
    } catch (e) {
      return null
    }
  })

  useEffect(() => {
    function onClick(e) {
      if (navRef.current && !navRef.current.contains(e.target)) setOpenMenu(null)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  const toggle = (menu) => setOpenMenu((cur) => (cur === menu ? null : menu))

  const displayName = currentUser?.full_name || currentUser?.username || "John"
  const displayEmail = currentUser?.email || (currentUser?.username ? `${currentUser.username}@globalpulse.io` : "john.abc@gmail.com")

  return (
    <header className="navbar" ref={navRef}>
      <div className="navbar__left">
        <Logo to="/dashboard" size="md" />
      </div>

      <div className="navbar__right">
        <div className="navbar__item-wrap">
          <button
            className={`navbar__icon-btn${openMenu === "notif" ? " is-active" : ""}`}
            onClick={() => toggle("notif")}
            aria-label="Notifications"
            aria-expanded={openMenu === "notif"}
          >
            <Bell size={20} />
            <span className="navbar__badge">{NOTIFICATIONS.length}</span>
          </button>

          <NotificationPanel open={openMenu === "notif"} onClose={() => setOpenMenu(null)} notifications={NOTIFICATIONS} />
        </div>

        <div className="navbar__item-wrap">
          <button
            className={`navbar__profile${openMenu === "profile" ? " is-active" : ""}`}
            onClick={() => toggle("profile")}
            aria-label="Account menu"
            aria-expanded={openMenu === "profile"}
          >
            <span className="navbar__avatar">
              <User size={18} />
            </span>
            <ChevronDown size={16} className="navbar__chevron" />
          </button>

          {openMenu === "profile" && (
            <div className="navbar__dropdown navbar__dropdown--profile" role="menu">
              <div className="navbar__profile-head">
                <span className="navbar__avatar navbar__avatar--lg">
                  <User size={22} />
                </span>
                <div>
                  <p className="navbar__profile-name">{displayName}</p>
                  <p className="navbar__profile-email">{displayEmail}</p>
                </div>
              </div>
              <div className="navbar__menu-group">
                <Link to="/dashboard/profile" className="navbar__menu-item" onClick={() => setOpenMenu(null)}>
                  <User size={16} /> Profile
                </Link>
              </div>
              <button
                className="navbar__menu-item navbar__menu-item--danger"
                onClick={() => {
                  setOpenMenu(null)
                  localStorage.removeItem("access_token")
                  localStorage.removeItem("token")
                  navigate("/login")
                }}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

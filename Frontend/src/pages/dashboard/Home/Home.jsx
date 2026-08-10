import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, ArrowRight, BarChart3 } from "lucide-react"

import SummaryCard from "./components/SummaryCard.jsx"
import MarketOverviewCard from "./components/MarketOverviewCard.jsx"
import CompanyCard from "./components/CompanyCard.jsx"
import TopMovers from "./components/TopMovers.jsx"
import SectorCard from "./components/SectorCard.jsx"

import {
  summaryCards,
  marketOverview,
  companies,
  topMovers,
  sectors,
  sparklines,
} from "../../../data/marketData.js"

import "./Home.css"

export default function Dashboard() {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")

  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}")
    } catch {
      return {}
    }
  })()
  const displayName = storedUser.username || storedUser.name || "User"

  const filtered = companies.filter(
    (c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.ticker.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="dashboard-home">
      {/* Greeting */}
      <header className="dashboard__greeting">
        <h1 className="dashboard__hello">
          Hello, {displayName} <span aria-hidden="true">&#128075;</span>
        </h1>
        <p className="dashboard__welcome">Welcome back! Here&apos;s today&apos;s market overview.</p>
      </header>

      {/* Compact summary cards + market overview */}
      <section className="dashboard__summary" aria-label="Financial summary">
        {summaryCards.map((item, i) => (
          <SummaryCard key={item.id} item={item} style={{ animationDelay: `${i * 60}ms` }} />
        ))}
        <MarketOverviewCard data={marketOverview} style={{ animationDelay: `${summaryCards.length * 60}ms` }} />
      </section>

      {/* Company intelligence */}
      <section className="dashboard__intel">
        <div className="dashboard__intel-head">
          <div>
            <h2 className="gp-section-title">Company Intelligence</h2>
            <p className="gp-section-sub">Deep-dive analysis of individual Nifty 50 constituents.</p>
          </div>
          <div className="dashboard__search">
            <Search size={16} className="dashboard__search-icon" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Nifty 50 companies..."
              aria-label="Search Nifty 50 companies"
            />
          </div>
        </div>

        <div className="dashboard__intel-grid">
          <div className="dashboard__companies">
            {filtered.length > 0 ? (
              filtered.map((c, i) => (
                <CompanyCard key={c.id + "-" + i} company={c} series={sparklines[c.id] || sparklines[c.ticker]} style={{ animationDelay: `${i * 70}ms` }} />
              ))
            ) : (
              <p className="dashboard__empty">No companies match &ldquo;{query}&rdquo;.</p>
            )}
          </div>

          <div className="dashboard__movers-col">
            <TopMovers movers={topMovers} style={{ animationDelay: "120ms" }} />

            <button
              className="dashboard__viewall-btn"
              onClick={() => navigate("/dashboard/constituents")}
            >
              View All Companies
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Affected sectors */}
      <section className="dashboard__sectors" aria-label="Affected sectors">
        <h3 className="gp-section-title dashboard__sectors-title">
          <BarChart3 size={18} className="dashboard__sectors-icon" /> Affected Sectors 2000 &ndash; 2026
        </h3>
        <div className="dashboard__sectors-grid">
          {sectors.map((s, i) => (
            <SectorCard key={s.id} sector={s} style={{ animationDelay: `${i * 60}ms` }} />
          ))}
        </div>
      </section>
    </div>
  )
}

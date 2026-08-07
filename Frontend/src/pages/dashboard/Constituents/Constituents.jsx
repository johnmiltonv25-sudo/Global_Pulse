import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Search, ArrowLeft, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from "lucide-react"

import { constituents } from "../../../data/marketData.js"
import "./Constituents.css"

const PAGE_SIZE = 10

const SECTORS = ["All", ...Array.from(new Set(constituents.map((c) => c.sector))).sort()]

const COLUMNS = [
  { key: "name", label: "Company", align: "left" },
  { key: "sector", label: "Sector", align: "left" },
  { key: "price", label: "Price (₹)", align: "right" },
  { key: "change", label: "Change", align: "right" },
  { key: "mcap", label: "Mkt Cap", align: "right" },
]

const formatPrice = (n) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function Constituents() {
  const [query, setQuery] = useState("")
  const [sector, setSector] = useState("All")
  const [sort, setSort] = useState({ key: "mcap", dir: "desc" })
  const [page, setPage] = useState(1)

  const processed = useMemo(() => {
    let rows = constituents.filter((c) => {
      const matchesQuery =
        c.name.toLowerCase().includes(query.toLowerCase()) || c.ticker.toLowerCase().includes(query.toLowerCase())
      const matchesSector = sector === "All" || c.sector === sector
      return matchesQuery && matchesSector
    })

    const { key, dir } = sort
    rows = [...rows].sort((a, b) => {
      let av = a[key]
      let bv = b[key]
      if (typeof av === "string") {
        av = av.toLowerCase()
        bv = bv.toLowerCase()
        return dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av)
      }
      return dir === "asc" ? av - bv : bv - av
    })
    return rows
  }, [query, sector, sort])

  const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = processed.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const toggleSort = (key) => {
    setPage(1)
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }))
  }

  const handleFilter = (value) => {
    setSector(value)
    setPage(1)
  }

  const handleSearch = (value) => {
    setQuery(value)
    setPage(1)
  }

  return (
    <div className="constituents">
      <header className="constituents__head">
        <div>
          <Link to="/dashboard" className="constituents__back">
            <ArrowLeft size={14} /> Dashboard
          </Link>
          <h1 className="gp-page-title">Top 50 Shares</h1>
          <p className="gp-section-sub">All Nifty 50 constituents with live pricing and market cap.</p>
        </div>
        <div className="constituents__search">
          <Search size={16} className="constituents__search-icon" />
          <input
            type="search"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search company or ticker..."
            aria-label="Search constituents"
          />
        </div>
      </header>

      <div className="constituents__chips gp-chips" role="tablist" aria-label="Filter by sector">
        {SECTORS.map((s) => (
          <button
            key={s}
            role="tab"
            aria-selected={sector === s}
            className={`gp-chip${sector === s ? " gp-chip--active" : ""}`}
            onClick={() => handleFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="constituents__table-wrap">
        <table className="constituents__table">
          <thead>
            <tr>
              <th className="constituents__num">#</th>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={`constituents__th constituents__th--${col.align}`}
                  aria-sort={sort.key === col.key ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
                >
                  <button className="constituents__sort" onClick={() => toggleSort(col.key)}>
                    {col.label}
                    {sort.key === col.key &&
                      (sort.dir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length > 0 ? (
              paged.map((c, i) => {
                const positive = c.change >= 0
                const Ch = positive ? TrendingUp : TrendingDown
                return (
                  <tr key={c.ticker} className="constituents__row">
                    <td className="constituents__num">{(currentPage - 1) * PAGE_SIZE + i + 1}</td>
                    <td>
                      <div className="constituents__company">
                        <span className="constituents__logo" aria-hidden="true">
                          {c.name.charAt(0)}
                        </span>
                        <div className="constituents__names">
                          <span className="constituents__name">{c.name}</span>
                          <span className="constituents__ticker gp-mono">{c.ticker}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="constituents__badge">{c.sector}</span>
                    </td>
                    <td className="constituents__td--right gp-mono">{formatPrice(c.price)}</td>
                    <td className="constituents__td--right">
                      <span className={`constituents__change ${positive ? "gp-pos" : "gp-neg"}`}>
                        <Ch size={12} /> {positive ? "+" : ""}
                        {c.change.toFixed(2)}%
                      </span>
                    </td>
                    <td className="constituents__td--right gp-mono">{c.mcap}</td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={6} className="constituents__empty">
                  No shares match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <footer className="constituents__footer">
        <span className="constituents__count">
          {processed.length === 0
            ? "0 results"
            : `Showing ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, processed.length)} of ${processed.length}`}
        </span>
        <div className="constituents__pager">
          <button
            className="gp-btn gp-btn--secondary gp-btn--sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <span className="constituents__page-info gp-mono">
            {currentPage} / {totalPages}
          </span>
          <button
            className="gp-btn gp-btn--secondary gp-btn--sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </footer>
    </div>
  )
}

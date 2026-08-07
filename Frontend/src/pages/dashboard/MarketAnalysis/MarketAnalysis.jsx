import React, { useState, useMemo } from "react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from "recharts"
import {
  Search,
  Activity,
  TrendingUp,
  TrendingDown,
  BrainCircuit,
  Newspaper,
  History,
  BarChart2,
  AlertTriangle,
  Zap,
  BookOpen,
} from "lucide-react"

import {
  NIFTY_COMPANIES,
  DATE_RANGES,
  getOverviewChartData,
  getTechnicalData,
  getMLPredictionData,
  getNewsSentimentData,
  getPredictionHistoryData,
} from "../../../data/marketAnalysisData.js"

import "./MarketAnalysis.css"

const CustomOverviewTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#19202e",
          border: "1px solid #334155",
          borderRadius: "10px",
          padding: "12px 18px",
          color: "#ffffff",
          boxShadow: "0 10px 25px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ fontWeight: "700", marginBottom: "8px", fontSize: "14px", color: "#f8fafc" }}>
          {label}
        </div>
        {payload.map((entry, index) => (
          <div key={index} style={{ fontSize: "13px", margin: "4px 0", display: "flex", gap: "6px" }}>
            <span style={{ color: "#94a3b8" }}>{entry.name} :</span>
            <span style={{ fontWeight: "600", color: "#60a5fa" }}>{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function MarketAnalysis() {
  const [selectedSymbol, setSelectedSymbol] = useState("RELIANCE")
  const [selectedRange, setSelectedRange] = useState("1Y")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  // Filter company dropdown list by search query
  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) return NIFTY_COMPANIES
    const q = searchQuery.toLowerCase()
    return NIFTY_COMPANIES.filter(
      (c) => c.symbol.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    )
  }, [searchQuery])

  // Current company object
  const currentCompany = useMemo(() => {
    return NIFTY_COMPANIES.find((c) => c.symbol === selectedSymbol) || NIFTY_COMPANIES[0]
  }, [selectedSymbol])

  // Overview Data
  const overviewData = useMemo(() => {
    return getOverviewChartData(selectedSymbol, selectedRange)
  }, [selectedSymbol, selectedRange])

  // Technical Analysis Data
  const { chartData: techChartData, indicatorTable } = useMemo(() => {
    return getTechnicalData(selectedSymbol, selectedRange)
  }, [selectedSymbol, selectedRange])

  // ML Prediction Data
  const { livePrediction, marketPrediction, predictionVsActual, featureImportance } = useMemo(() => {
    return getMLPredictionData(selectedSymbol)
  }, [selectedSymbol])

  // News Sentiment Data
  const newsSentiment = useMemo(() => {
    return getNewsSentimentData(selectedSymbol)
  }, [selectedSymbol])

  // Prediction History Data
  const predictionHistory = useMemo(() => {
    return getPredictionHistoryData(selectedSymbol)
  }, [selectedSymbol])

  return (
    <div className="smp-layout">
      {/* ----------------- LEFT SIDEBAR CONTROLS ----------------- */}
      <aside className="smp-sidebar">
        <div className="smp-sidebar__brand">
          <BrainCircuit size={22} className="text-blue-500" />
          <span>Stock Predictor</span>
        </div>

        <div className="smp-sidebar__group">
          <label className="smp-sidebar__label">
            <Search size={14} /> Search Any Company
          </label>
          <div className="smp-sidebar__hint">Direct in Company Name or NSE Symbol</div>
          <input
            type="text"
            placeholder="Type name, ticker, or symbol (e.g. TCS)"
            className="smp-sidebar__input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="smp-sidebar__group">
          <label className="smp-sidebar__label">
            <BarChart2 size={14} /> NIFTY 50 Companies
          </label>
          <div className="smp-sidebar__hint">Select Company</div>
          <select
            className="smp-sidebar__select"
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
          >
            {filteredCompanies.map((c) => (
              <option key={c.symbol} value={c.symbol}>
                {c.symbol} - {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="smp-sidebar__group">
          <label className="smp-sidebar__label">Settings</label>
          <div className="smp-sidebar__hint">Chart Date Range</div>
          <select
            className="smp-sidebar__select"
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
          >
            {DATE_RANGES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div className="smp-sidebar__about">
          <div className="smp-sidebar__about-title">About</div>
          <div className="smp-sidebar__about-text">
            This dashboard uses AI models to predict stock price movements based on technical indicators, fundamentals, and news sentiment.
          </div>
        </div>
      </aside>

      {/* ----------------- MAIN CONTENT AREA ----------------- */}
      <main className="smp-main">
        {/* Main Dashboard Banner & Header Stats */}
        <header className="smp-header">
          <h1 className="smp-header__title">
            📊 Stock Market Prediction Dashboard
          </h1>
          <div className="smp-header__ticker">
            {currentCompany.symbol} - {currentCompany.name}
          </div>

          <div className="smp-metrics-grid">
            <div className="smp-metric-item">
              <span className="smp-metric-item__label">Current Price</span>
              <div className="smp-metric-item__val">
                ₹{currentCompany.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                <span className={currentCompany.change >= 0 ? "smp-badge--pos" : "smp-badge--neg"}>
                  {currentCompany.change >= 0 ? "+" : ""}
                  {currentCompany.change}%
                </span>
              </div>
            </div>

            <div className="smp-metric-item">
              <span className="smp-metric-item__label">Prev Close</span>
              <div className="smp-metric-item__val">
                ₹{currentCompany.prevClose.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="smp-metric-item">
              <span className="smp-metric-item__label">Volume</span>
              <div className="smp-metric-item__val">{currentCompany.volume}</div>
            </div>

            <div className="smp-metric-item">
              <span className="smp-metric-item__label">Open</span>
              <div className="smp-metric-item__val">
                ₹{currentCompany.open.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="smp-metric-item">
              <span className="smp-metric-item__label">High</span>
              <div className="smp-metric-item__val">
                ₹{currentCompany.high.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="smp-metric-item">
              <span className="smp-metric-item__label">Low</span>
              <div className="smp-metric-item__val">
                ₹{currentCompany.low.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="smp-header__subtext">
            Last Updated: {currentCompany.lastUpdated}
          </div>
        </header>

        {/* Navigation Tabs Bar */}
        <nav className="smp-tabs-bar">
          <button
            className={`smp-tab-btn ${activeTab === "overview" ? "smp-tab-btn--active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview & Charts
          </button>
          <button
            className={`smp-tab-btn ${activeTab === "technical" ? "smp-tab-btn--active" : ""}`}
            onClick={() => setActiveTab("technical")}
          >
            Technical Analysis
          </button>
          <button
            className={`smp-tab-btn ${activeTab === "ml" ? "smp-tab-btn--active" : ""}`}
            onClick={() => setActiveTab("ml")}
          >
            ML Prediction
          </button>
          <button
            className={`smp-tab-btn ${activeTab === "news" ? "smp-tab-btn--active" : ""}`}
            onClick={() => setActiveTab("news")}
          >
            News Sentiment
          </button>
          <button
            className={`smp-tab-btn ${activeTab === "history" ? "smp-tab-btn--active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            Prediction History
          </button>
        </nav>

        {/* TAB 1: OVERVIEW & CHARTS */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Chart 1: Price with Moving Averages */}
            <div className="smp-card">
              <h3 className="smp-card__title">
                {currentCompany.symbol} - Price with Moving Averages
              </h3>
              <div style={{ width: "100%", height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={overviewData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 12 }} domain={["auto", "auto"]} />
                    <Tooltip content={<CustomOverviewTooltip />} cursor={{ stroke: "#ffffff", strokeWidth: 1 }} />
                    <Legend />
                    <Line type="monotone" dataKey="price" name="Price" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="sma20" name="SMA 20" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="sma50" name="SMA 50" stroke="#3b82f6" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="sma200" name="SMA 200" stroke="#a855f7" strokeWidth={1.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Price & Volume */}
            <div className="smp-card">
              <h3 className="smp-card__title">
                {currentCompany.symbol} - Price & Volume
              </h3>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={overviewData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 12 }} domain={["auto", "auto"]} />
                    <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ background: "#0f172a", borderColor: "#334155", color: "#f8fafc", borderRadius: 8 }}
                    />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="price" name="Price (₹)" stroke="#ef4444" strokeWidth={2} dot={false} />
                    <Bar yAxisId="right" dataKey="volume" name="Volume" fill="#22c55e" opacity={0.4} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TECHNICAL ANALYSIS */}
        {activeTab === "technical" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Title & Learner Explanation Callout */}
            <div className="smp-card">
              <h2 className="smp-card__title" style={{ fontSize: 18 }}>
                Technical Analysis
              </h2>

              <div className="smp-learner-box">
                <div className="smp-learner-box__title">What this means for learners</div>
                <ul>
                  <li>
                    <strong>SMA (Green):</strong> If current price is moving up, an uptrend exists.
                  </li>
                  <li>
                    <strong>MACD:</strong> Helps spot when the trend is getting stronger or weaker.
                  </li>
                  <li>
                    <strong>Bollinger Bands:</strong> Show whether price is high or low compared to normal range.
                  </li>
                  <li>
                    <strong>RSI:</strong> Shows overall momentum (Overbought &gt; 70, Oversold &lt; 30).
                  </li>
                  <li>
                    <strong>News Sentiment:</strong> Shows whether recent news is mostly positive or negative.
                  </li>
                </ul>
              </div>
            </div>

            {/* RSI (14) Chart */}
            <div className="smp-card">
              <h3 className="smp-card__title">RSI (14)</h3>
              <div style={{ width: "100%", height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={techChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#0f172a", borderColor: "#334155", color: "#f8fafc" }} />
                    <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "Overbought (70)", fill: "#ef4444", fontSize: 10 }} />
                    <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="3 3" label={{ value: "Oversold (30)", fill: "#22c55e", fontSize: 10 }} />
                    <Line type="monotone" dataKey="rsi" name="RSI" stroke="#06b6d4" strokeWidth={1.8} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* MACD Chart */}
            <div className="smp-card">
              <h3 className="smp-card__title">MACD</h3>
              <div style={{ width: "100%", height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={techChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#0f172a", borderColor: "#334155", color: "#f8fafc" }} />
                    <Legend />
                    <Line type="monotone" dataKey="macd" name="MACD" stroke="#3b82f6" strokeWidth={1.8} dot={false} />
                    <Line type="monotone" dataKey="signal" name="Signal" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
                    <Bar dataKey="histogram" name="Histogram" fill="#10b981" opacity={0.6} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bollinger Bands Chart */}
            <div className="smp-card">
              <h3 className="smp-card__title">Bollinger Bands (20, 2)</h3>
              <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={techChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
                    <Tooltip contentStyle={{ background: "#0f172a", borderColor: "#334155", color: "#f8fafc" }} />
                    <Legend />
                    <Line type="monotone" dataKey="upperBand" name="Upper Band" stroke="#ef4444" strokeDasharray="4 4" dot={false} />
                    <Line type="monotone" dataKey="middleBand" name="Middle Band (SMA 20)" stroke="#3b82f6" dot={false} />
                    <Line type="monotone" dataKey="lowerBand" name="Lower Band" stroke="#22c55e" strokeDasharray="4 4" dot={false} />
                    <Line type="monotone" dataKey="price" name="Price" stroke="#ffffff" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Technical Indicators Summary Table */}
            <div className="smp-card">
              <h3 className="smp-card__title">Technical Indicators Summary</h3>
              <div className="smp-table-wrapper">
                <table className="smp-table">
                  <thead>
                    <tr>
                      <th>Indicator</th>
                      <th>Value</th>
                      <th>Signal</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {indicatorTable.map((row, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{row.indicator}</td>
                        <td style={{ fontFamily: "monospace" }}>{row.value}</td>
                        <td>
                          <span
                            className={
                              row.signal.includes("Buy")
                                ? "smp-badge--pos"
                                : row.signal.includes("Sell")
                                ? "smp-badge--neg"
                                : "gp-chip"
                            }
                          >
                            {row.signal}
                          </span>
                        </td>
                        <td style={{ color: "#94a3b8" }}>{row.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ML PREDICTION */}
        {activeTab === "ml" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>ML Prediction</h2>

            {/* Live News-Aware Prediction Card */}
            <div className="smp-prediction-banner">
              <div>
                <h3 className="smp-card__title" style={{ fontSize: 16 }}>
                  <Zap size={18} className="text-yellow-400" /> Live News-Aware Prediction
                </h3>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                  This prediction combines historical candlestick price, real-time news sentiment, technical indicators, and fundamentals.
                </div>
              </div>

              <div className="smp-live-badge">
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }}></span>
                LIVE PREDICTION: {livePrediction.signal}
              </div>

              <div className="smp-pred-stats-grid">
                <div className="smp-pred-stat-card">
                  <div style={{ fontSize: 11, color: "#64748b" }}>Bullish Probability</div>
                  <div className="smp-pred-stat-card__val" style={{ color: "#22c55e" }}>
                    {livePrediction.bullish}%
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                    Bearish: {livePrediction.bearish}%
                  </div>
                </div>

                <div className="smp-pred-stat-card">
                  <div style={{ fontSize: 11, color: "#64748b" }}>Expected 1-Month Return</div>
                  <div className="smp-pred-stat-card__val" style={{ color: "#38bdf8" }}>
                    {livePrediction.expectedReturn}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                    Core News Sentiment: {livePrediction.coreNewsSentiment}
                  </div>
                </div>

                <div className="smp-pred-stat-card">
                  <div style={{ fontSize: 11, color: "#64748b" }}>Confidence Level</div>
                  <div className="smp-pred-stat-card__val" style={{ color: "#eab308" }}>
                    {livePrediction.confidence}%
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                    High Confidence Model Output
                  </div>
                </div>
              </div>

              {/* News influencing prediction */}
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 8 }}>
                  📌 News that influenced this prediction:
                </div>
                <div className="smp-news-influences">
                  {livePrediction.influencingNews.map((item, idx) => (
                    <div key={idx} className="smp-news-influence-item">
                      <div className="smp-news-influence-item__title">{item.title}</div>
                      <div className="smp-news-influence-item__meta">
                        <span>{item.sourceDate}</span>
                        <span className="smp-badge--pos">{item.sentiment} ({item.confidence})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Standalone Market Prediction Box */}
            <div className="smp-card">
              <h3 className="smp-card__title">Market Prediction</h3>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>Current Price</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#ffffff" }}>
                    ₹{currentCompany.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>Model Confidence</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#22c55e" }}>
                    {marketPrediction.confidence}%
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>
                    Probability Up: {marketPrediction.probUp}% | Down: {marketPrediction.probDown}%
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer Banner */}
            <div className="smp-disclaimer">
              <AlertTriangle size={20} style={{ flexShrink: 0 }} />
              <div>
                <strong>Disclaimer:</strong> This prediction is AI-generated based on historical candlestick patterns, technical indicators, company fundamentals, and live news sentiment. Stock markets are inherently uncertain, and this prediction should not be treated as financial advice.
              </div>
            </div>

            {/* Prediction vs Actual (Historical) */}
            <div className="smp-card">
              <h3 className="smp-card__title">Prediction vs Actual (Historical)</h3>
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={predictionVsActual}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 12 }} domain={["auto", "auto"]} />
                    <Tooltip contentStyle={{ background: "#0f172a", borderColor: "#334155", color: "#f8fafc" }} />
                    <Legend />
                    <Line type="monotone" dataKey="actual" name="Actual Price" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="predicted" name="Predicted Price" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Feature Importance Bar Chart */}
            <div className="smp-card">
              <h3 className="smp-card__title">Feature Importance</h3>
              <div style={{ width: "100%", height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={featureImportance} layout="vertical" margin={{ top: 10, right: 30, left: 140, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 1]} />
                    <YAxis type="category" dataKey="feature" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#0f172a", borderColor: "#334155", color: "#f8fafc" }} />
                    <Bar dataKey="importance" name="Importance Weight" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: NEWS SENTIMENT */}
        {activeTab === "news" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="smp-card">
              <h2 className="smp-card__title" style={{ fontSize: 18 }}>
                News Sentiment Analysis
              </h2>
              <div style={{ fontSize: 13, color: "#94a3b8" }}>
                News sentiment tells you whether news about the company is mostly good or mostly bad.
              </div>

              <div className="smp-pred-stats-grid" style={{ marginTop: 10 }}>
                <div className="smp-pred-stat-card">
                  <div style={{ fontSize: 11, color: "#64748b" }}>Live Net Sentiment</div>
                  <div className="smp-pred-stat-card__val" style={{ color: "#22c55e" }}>
                    {newsSentiment.score}
                  </div>
                </div>
                <div className="smp-pred-stat-card">
                  <div style={{ fontSize: 11, color: "#64748b" }}>Articles Traced</div>
                  <div className="smp-pred-stat-card__val">{newsSentiment.articlesTraced}</div>
                </div>
                <div className="smp-pred-stat-card">
                  <div style={{ fontSize: 11, color: "#64748b" }}>Positive Articles</div>
                  <div className="smp-pred-stat-card__val" style={{ color: "#22c55e" }}>
                    {newsSentiment.positive}
                  </div>
                </div>
                <div className="smp-pred-stat-card">
                  <div style={{ fontSize: 11, color: "#64748b" }}>Negative Articles</div>
                  <div className="smp-pred-stat-card__val" style={{ color: "#ef4444" }}>
                    {newsSentiment.negative}
                  </div>
                </div>
              </div>
            </div>

            {/* Live News Sentiment Cards */}
            <div className="smp-card">
              <h3 className="smp-card__title">
                <Newspaper size={18} /> Live News Sentiment
              </h3>

              <div className="smp-news-grid">
                {newsSentiment.newsList.map((item) => (
                  <div key={item.id} className="smp-news-card">
                    <div className="smp-news-card__head">
                      <div className="smp-news-card__title">{item.title}</div>
                      <span className={item.sentiment === "POSITIVE" ? "smp-badge--pos" : "gp-chip"}>
                        {item.sentiment} ({item.confidence})
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{item.sourceDate}</div>
                    <div className="smp-news-card__snippet">{item.excerpt}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PREDICTION HISTORY */}
        {activeTab === "history" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="smp-card">
              <h2 className="smp-card__title" style={{ fontSize: 18 }}>
                <History size={18} /> Prediction History & Backtest Results
              </h2>

              <div className="smp-pred-stats-grid" style={{ marginTop: 10 }}>
                <div className="smp-pred-stat-card">
                  <div style={{ fontSize: 11, color: "#64748b" }}>Model Accuracy</div>
                  <div className="smp-pred-stat-card__val" style={{ color: "#22c55e" }}>84.2%</div>
                </div>
                <div className="smp-pred-stat-card">
                  <div style={{ fontSize: 11, color: "#64748b" }}>Win Rate</div>
                  <div className="smp-pred-stat-card__val" style={{ color: "#38bdf8" }}>78.5%</div>
                </div>
                <div className="smp-pred-stat-card">
                  <div style={{ fontSize: 11, color: "#64748b" }}>Total Predictions</div>
                  <div className="smp-pred-stat-card__val">142</div>
                </div>
              </div>
            </div>

            <div className="smp-card">
              <h3 className="smp-card__title">Backtested Signal Logs</h3>
              <div className="smp-table-wrapper">
                <table className="smp-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Symbol</th>
                      <th>Signal</th>
                      <th>Initial Price</th>
                      <th>Target Price</th>
                      <th>Actual Price</th>
                      <th>Accuracy</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictionHistory.map((row, idx) => (
                      <tr key={idx}>
                        <td style={{ color: "#94a3b8" }}>{row.date}</td>
                        <td style={{ fontWeight: 600 }}>{row.symbol}</td>
                        <td>
                          <span className="smp-badge--pos">{row.signal}</span>
                        </td>
                        <td>₹{row.initialPrice}</td>
                        <td>₹{row.targetPrice}</td>
                        <td>₹{row.actualPrice}</td>
                        <td style={{ fontWeight: 600, color: "#22c55e" }}>{row.accuracy}</td>
                        <td>
                          <span className="smp-badge--pos">{row.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

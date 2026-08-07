import { Utensils, Car, ShoppingBag, Home, Film, HeartPulse, Landmark, Sparkles } from "lucide-react"

/** Expense categories with their icon + accent colour. */
export const CATEGORIES = [
  { id: "food", label: "Food", icon: Utensils, color: "#2f6bff" },
  { id: "transport", label: "Transport", icon: Car, color: "#2ec27e" },
  { id: "shopping", label: "Shopping", icon: ShoppingBag, color: "#8a94a6" },
  { id: "rent", label: "Rent", icon: Home, color: "#4f83ff" },
  { id: "entertainment", label: "Entertainment", icon: Film, color: "#f5a524" },
  { id: "health", label: "Health", icon: HeartPulse, color: "#ef4b5b" },
  { id: "bills", label: "Bills", icon: Landmark, color: "#22b8cf" },
  { id: "other", label: "Other", icon: Sparkles, color: "#a78bfa" },
]

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]))

export const PAYMENT_METHODS = ["Cash", "Card", "UPI", "Net Banking", "Wallet"]

/** Format a number as Indian-locale rupees. */
export function formatINR(n) {
  const value = Number(n) || 0
  return "₹" + value.toLocaleString("en-IN")
}

/** Build a YYYY-MM-DD key for a given year/month(0-based)/day. */
export function dateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

/** Human date, e.g. "26 July 2026". */
export function prettyDate(key) {
  if (!key) return ""
  const [y, m, d] = key.split("-").map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]
export const monthLabel = (year, month) => `${MONTHS[month]} ${year}`

let seq = 100
export const nextId = () => ++seq

/** Seed data for July 2026 so the dashboard opens with a realistic month. */
export const SEED_TRANSACTIONS = [
  { id: 1, type: "income", amount: 45000, category: null, date: "2026-07-01", time: "09:00 AM", method: "Net Banking", notes: "Monthly salary", status: "Completed" },
  { id: 2, type: "income", amount: 5000, category: null, date: "2026-07-15", time: "02:10 PM", method: "UPI", notes: "Freelance payout", status: "Completed" },

  { id: 3, type: "expense", amount: 12000, category: "rent", date: "2026-07-01", time: "11:00 AM", method: "Net Banking", notes: "July rent", status: "Completed" },
  { id: 4, type: "expense", amount: 2000, category: "food", date: "2026-07-02", time: "06:30 PM", method: "Card", notes: "Weekly groceries", status: "Completed" },
  { id: 5, type: "expense", amount: 4200, category: "shopping", date: "2026-07-03", time: "05:15 PM", method: "Card", notes: "New headphones", status: "Completed" },
  { id: 6, type: "expense", amount: 800, category: "transport", date: "2026-07-04", time: "08:45 AM", method: "UPI", notes: "Airport cab", status: "Completed" },
  { id: 7, type: "expense", amount: 500, category: "transport", date: "2026-07-06", time: "07:20 PM", method: "UPI", notes: "Metro top-up", status: "Completed" },
  { id: 8, type: "expense", amount: 1200, category: "food", date: "2026-07-08", time: "09:10 PM", method: "Card", notes: "Dinner out", status: "Completed" },
  { id: 9, type: "expense", amount: 900, category: "entertainment", date: "2026-07-11", time: "07:00 PM", method: "UPI", notes: "Movie night", status: "Completed" },
  { id: 10, type: "expense", amount: 1000, category: "food", date: "2026-07-12", time: "01:00 PM", method: "Cash", notes: "Cafe", status: "Completed" },
  { id: 11, type: "expense", amount: 500, category: "transport", date: "2026-07-13", time: "10:00 AM", method: "UPI", notes: "Cab", status: "Completed" },
  { id: 12, type: "expense", amount: 630, category: "food", date: "2026-07-16", time: "04:30 PM", method: "Cash", notes: "Snacks", status: "Completed" },
  { id: 13, type: "expense", amount: 1500, category: "health", date: "2026-07-17", time: "12:00 PM", method: "Card", notes: "Pharmacy", status: "Completed" },
  { id: 14, type: "expense", amount: 1200, category: "bills", date: "2026-07-18", time: "09:00 AM", method: "Net Banking", notes: "Electricity", status: "Completed" },
  { id: 15, type: "expense", amount: 1000, category: "transport", date: "2026-07-19", time: "08:00 AM", method: "UPI", notes: "Fuel", status: "Completed" },
  { id: 16, type: "expense", amount: 2400, category: "shopping", date: "2026-07-22", time: "03:30 PM", method: "Card", notes: "Clothes", status: "Completed" },
  { id: 17, type: "expense", amount: 700, category: "food", date: "2026-07-23", time: "08:30 PM", method: "UPI", notes: "Takeaway", status: "Completed" },
  { id: 18, type: "expense", amount: 350, category: "other", date: "2026-07-24", time: "05:00 PM", method: "Cash", notes: "Misc", status: "Completed" },

  { id: 19, type: "expense", amount: 120, category: "food", date: "2026-07-26", time: "08:30 AM", method: "Cash", notes: "Breakfast", status: "Completed" },
  { id: 20, type: "expense", amount: 250, category: "food", date: "2026-07-26", time: "01:15 PM", method: "UPI", notes: "Lunch", status: "Completed" },
  { id: 21, type: "expense", amount: 1000, category: "transport", date: "2026-07-26", time: "10:30 AM", method: "Cash", notes: "Fuel", status: "Completed" },

  { id: 22, type: "expense", amount: 900, category: "entertainment", date: "2026-07-27", time: "07:45 PM", method: "Card", notes: "Concert tickets", status: "Completed" },
  { id: 23, type: "expense", amount: 450, category: "food", date: "2026-07-28", time: "09:00 PM", method: "UPI", notes: "Dinner", status: "Completed" },
  { id: 24, type: "expense", amount: 600, category: "transport", date: "2026-07-29", time: "08:15 AM", method: "UPI", notes: "Cab", status: "Completed" },
  { id: 25, type: "expense", amount: 800, category: "shopping", date: "2026-07-31", time: "06:00 PM", method: "Card", notes: "Groceries", status: "Completed" },
]

export const SEED_BUDGETS = [
  { id: 51, category: "food", label: "Food", limit: 8000, notes: "Daily essentials" },
  { id: 52, category: "transport", label: "Transport", limit: 4000, notes: "Commute & Fuel" },
  { id: 53, category: "shopping", label: "Shopping", limit: 6000, notes: "Lifestyle & gadgets" },
  { id: 54, category: "rent", label: "Rent", limit: 12000, notes: "Housing" },
]

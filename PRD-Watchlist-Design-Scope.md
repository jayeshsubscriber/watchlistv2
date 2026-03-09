# Product Requirements Document (PRD)
# Watchlist – Design Scope

**Version:** 1.0  
**Date:** March 2025  
**Status:** Draft  
**Design scope:** Multi-column layout views, Watchlist Signals, Chart Ingress, Full stock names in scrips

---

## 1. Overview

### 1.1 Purpose
This PRD defines the product requirements for the Watchlist feature within a trading/investment app. It is scoped to four design areas validated in the prototype: **Multi-column layout views**, **Watchlist Signals**, **Chart Ingress**, and **Full stock names in scrips**.

### 1.2 Goals
- Let users view watchlisted scrips in a **multi-column layout** with persona-based columns and optional standard list view.
- Surface **signals** (e.g. from Market events, Price Signals, Momentum & Technical, or Derivatives) on selected scrips only, with consistent UX (tag + count) and user-controlled signal categories via Watchlist Preferences.
- Provide **chart ingress** from the watchlist action bar for quick access to chart views.
- Show **full company names** for equity scrips in the Investor context while keeping symbols elsewhere.

### 1.3 Target Users
- Retail traders and investors using the watchlist for intraday, options, swing, or long-term views.
- Users who want at-a-glance signals and the ability to customise which signal types appear.

---

## 2. Design Scope

The in-scope areas for this PRD are:

| # | Scope area | Description |
|---|------------|-------------|
| 1 | **Multi-column layout views** | Persona-based tables, column selection/reorder, default multi-column on load, Standard vs Multi-Column toggle. |
| 2 | **Watchlist Signals** | Category-based signals (Market events, Price Signals, Momentum & Technical, Derivatives) with toggles in Watchlist Preferences; display rules (tag + count), placement in Standard vs Multi-Column; signals only on scrips that have them. |
| 3 | **Chart Ingress** | Chart icon in the bottom action bar (after the three-dots menu) to enter chart flow. |
| 4 | **Full stock names in scrips** | Full company name (e.g. Infosys, State Bank of India) in Investor view; symbol + exchange/signals elsewhere; options show expiry in subline. |

---

## 3. Functional Requirements by Scope

### 3.1 Multi-column layout views

#### 3.1.1 View modes
- **Standard View:** Two-column list (Scrip | Price). Scrip shows symbol (or full name in Investor), subline, and signals inline next to symbol where applicable.
- **Multi-Column View:** Single horizontal-scrolling table per persona with columns: **Scrip** (fixed left) → **Price**, **% Change** (fixed order) → persona-specific data columns → **Signals** (last column).
- **Default on load:** Multi-Column View is the default; Standard View is selectable via Watchlist Preferences.

#### 3.1.2 Persona tabs and columns
- **Tabs:** Nifty 50, Swing Trading, **Intraday** (default active), Options Trader, Investor. Optional “+” to add lists.
- **Column sets by persona:**
  - **Intraday:** Price, % Change, Day Range, Open, High, Low, Volume, VWAP, Bid, Ask.
  - **Options Trader:** OI, OI Change, PCR, IV, Day Range, Bid, Ask (plus Price, % Change).
  - **Investor / Long term:** PE (TTM), Market Cap, RSI, 52W Range, Div Yield (plus Price, % Change).
  - **Short-term equity (Swing):** % Change, 1W/1M Return, RSI, Volume, VWAP, Day Range.
- **Configurable columns:** User can show/hide and reorder columns via “Edit columns” (visible only when Multi-Column View is selected). Price and % Change always first and not reorderable. Quick-select by trading style (persona) applies a column set; individual checkboxes allow override.
- **Persistence:** Selected columns and column order are persisted (e.g. `watchlistColumnOrder`, `watchlistColumns` in localStorage or equivalent backend).

#### 3.1.3 Scrip column in multi-column
- **Equity (non-Investor):** Bold symbol; subline = exchange + segment (e.g. “NSE EQ”).
- **Equity (Investor):** Full company name (see Section 3.4); subline = exchange only (e.g. “NSE”). Signals appear only in the **Signals** column.
- **Options:** Scrip = contract name; subline = expiry (e.g. “NFO 26 FEB 26”).

#### 3.1.4 UI behaviour
- **Edit columns CTA:** Shown only when “Multi-Column View” is selected in Watchlist Preferences; does not auto-open the column sheet when opening Preferences.
- **Column list:** Toggling a column checkbox moves selected columns to the top of the list (e.g. `moveSelectedColumnsToTop` on change).
- **Header alignment:** Column headers use fixed width / no shrink (e.g. `flex-shrink: 0`) to avoid overlap. Short labels (e.g. “PCR”, “52W Range”, “Div Yield”) are used where needed.

---

### 3.2 Watchlist Signals

#### 3.2.1 What Watchlist Signals is
**Watchlist Signals** are contextual indicators shown on watchlisted scrips to highlight events or conditions that may be relevant for trading or investment decisions. Examples include corporate actions (e.g. dividend), price behaviour (e.g. Open = High, gap moves), momentum/technical conditions (e.g. volume spike, RSI), and derivatives activity (e.g. long buildup). Signals are shown **only on scrips where they apply**, not on every row, so the list stays scannable and actionable.

Signals are controlled at the **category** level via Watchlist Preferences. The product supports four high-level categories; the exact list of signal types within each category is defined by the product/backend and is not limited to the small set used in the prototype.

#### 3.2.2 Use cases
- **Discover opportunities:** Users can see at a glance which watchlisted scrips have recent dividends, earnings, price breakouts, or derivative buildup without opening each scrip.
- **Reduce noise:** Users can turn off signal categories they don’t care about (e.g. Derivatives for an equity-only investor) so only relevant signals appear.
- **Consistent UX across views:** The same tag + count treatment works in both Standard list view and Multi-Column table view, so behaviour is predictable when switching layout or persona.

#### 3.2.3 How it works
- **Data:** For each scrip, the system may have zero or more active signals. Only scrips with at least one active signal (within the user’s enabled categories) show a signal pill/count on the watchlist.
- **Display:** The primary (e.g. first) signal is shown as a **tag (pill)**; when there are multiple signals, a **count in a circle** (e.g. “+4”) indicates how many more. Styling (e.g. purple accent, rounded pill, circular badge) is consistent across the app.
- **Preferences:** In **Watchlist Preferences**, a “Watchlist Signals” section lets the user enable or disable each **signal category** via a toggle. Only signals belonging to enabled categories are shown. Choices are persisted (e.g. localStorage or backend).
- **Placement:** In Standard View, signals appear next to the symbol (or in the subline for Investor). In Multi-Column View, signals appear only in the dedicated **Signals** column (last column).

#### 3.2.4 Signal categories (Watchlist Preferences)
The definitive control for what appears on the watchlist is the **Watchlist Signals** section in Watchlist Preferences. It exposes four categories, each with a toggle and short description:

| Category | Description (subtext in UI) |
|----------|-----------------------------|
| **Market events** | Corporate Actions, Earnings and News |
| **Price Signals** | Open = High / Open = Low, Gap Up / Down, 52W Break |
| **Momentum & Technical Signals** | Price Breakout, Volume Spike, Delivery Spike, RSI Overbought / Oversold etc. |
| **Derivatives** | OI Spike, Long Buildup, Short Buildup |

- **Section title:** “Watchlist Signals”.
- **Section copy:** “Choose which signal categories to show on watchlisted scrips.”
- **Default:** All four categories are **on** (enabled) unless the user has changed preferences.
- **Persistence:** User choices are stored (e.g. `watchlistTagPrefs` or equivalent) and applied whenever the watchlist is rendered.

*Note: The prototype used a small fixed set of signal labels (e.g. Dividend, Earnings announced, O=H, Volume spike, Long Buildup, Price breakout) for demo only. The shipped product uses the above categories; the exact signal types and labels within each category are defined by the product/backend.*

#### 3.2.5 Where signals appear
- **Standard View**
  - **Intraday / Options Trader / other (non-Investor):** Signals appear **next to the symbol** (same line): signal name as a **tag (pill)** and count as a **circle** (e.g. “Dividend” tag + “+4” in circle). Subline = exchange/segment only (e.g. “NSE EQ”).
  - **Investor:** Full company name on first line. Subline = **Exchange • Signal tag • Count circle** (e.g. “NSE • Dividend +4”). No symbol in subline.
- **Multi-Column View**
  - Signals appear **only in the last column (“Signals”)**. Scrip column does not repeat signals (Investor scrip subline = exchange only).
  - Each cell: primary signal as **tag** + **count in circle** (e.g. “Dividend” + “+4”). No signals for rows with no signal data; show “—” in Signals column.

#### 3.2.6 Display rules
- **Only on selected stocks:** Signals are shown only for scrips that have at least one active signal (within enabled categories). Scrips with no signals show no tag/circle and, in Investor subline, only the exchange (e.g. “NSE”).
- **Primary signal + count:** When multiple signals exist, show the first/primary signal name as the tag and total count in the circle (e.g. “Dividend +4”).
- **Consistent styling:** Tag (pill) and circle use the same design system (e.g. purple accent, rounded pill, circular badge with “+N”) across Standard and Multi-Column.

#### 3.2.7 Options scrips
- Options/F&O scrips may have no signals in the list; if they do, same tag + circle rules apply in the Signals column. Subline for options remains **expiry** (e.g. “NFO 26 FEB 26”), not “Exchange • Symbol • Signals”.

---

### 3.3 Chart Ingress

#### 3.3.1 Placement
- **Chart icon** is placed in the **bottom action bar** (fab row), **after the three-dots (More) menu**.
- Layout: **[Price button]** on the left; **[Three-dots menu] [Chart icon]** grouped on the right, with the chart icon immediately to the right of the three-dots.
- Chart icon is **not** centre-aligned with the whole bar; it stays with the three-dots on the right.

#### 3.3.2 Visual and a11y
- Same style as other circular FABs (e.g. purple border/background, 32×32 px).
- Icon: chart/trend line (e.g. polyline) in brand colour.
- **aria-label:** “Chart” (or “View chart”) for screen readers.

#### 3.3.3 Behaviour
- **Tap/click:** Opens chart flow (e.g. full-screen chart for the current list or selected scrip). Exact destination (list-level vs scrip-level chart) can be defined in a later iteration; this PRD only specifies the ingress point and placement.

---

### 3.4 Full stock names in scrips

#### 3.4.1 When full names are used
- **Investor tab only:** For **equity** scrips, show **full company name** instead of exchange symbol in the primary scrip label.
  - Examples: “Infosys” instead of “INFY”, “State Bank of India” instead of “SBIN”, “Reliance Industries” instead of “RELIANCE”.
- **All other tabs (Intraday, Options Trader, Swing, Nifty 50):** Continue to show **symbol** (e.g. RELIANCE, INFY, SBIN).

#### 3.4.2 Subline rules (Investor)
- **Equity with signals:** Subline = **Exchange • Signal** (tag + count in circle). **No symbol** in subline (e.g. “NSE • Dividend +4”).
- **Equity without signals:** Subline = **Exchange** only (e.g. “NSE”).
- **Options:** Subline = **Expiry** only (e.g. “NFO 26 FEB 26”), unchanged from other tabs.


#### 3.4.3 Multi-Column Investor
- **Scrip cell:** Bold **full company name**; subline = **exchange only** (e.g. “NSE”).
- **Signals:** Shown only in the **Signals** column (last column), not in the scrip cell.

#### 3.4.4 Mapping
- A **symbol → full name** mapping is required for equity scrips (e.g. RELIANCE → “Reliance Industries”, INFY → “Infosys”, SBIN → “State Bank of India”). Options and other non-equity instruments keep standard scrip/symbol display; no full-name mapping needed for them.

---

## 4. User Stories (Summary)

- **As a user,** I can switch between Standard and Multi-Column view so that I can choose a compact list or a data-rich table.
- **As a user,** I can select and reorder columns in Multi-Column view so that I see only the fields relevant to my style (Intraday, Options, Investor).
- **As a user,** I see signals only on scrips that have them, with a clear tag and count, so that I can act on relevant events without clutter.
- **As a user,** I can turn signal categories on/off in Watchlist Preferences (Market events, Price Signals, Momentum & Technical, Derivatives) so that my watchlist shows only the types of signals I care about.
- **As a user,** I can tap the chart icon next to the three-dots menu so that I can quickly open the chart from the watchlist.
- **As an investor,** I see full company names (e.g. Infosys, State Bank of India) in the Investor tab so that I can read the watchlist in a more familiar form.

---

## 5. Out of Scope (for this PRD)

- Backend APIs for watchlist data, signals, or preferences (prototype uses local/mock data and localStorage).
- Actual chart screen implementation (only ingress is in scope).
- Add/remove scrips from watchlist, multiple watchlists, or sync across devices.
- Search, filters, or sort beyond the existing “Price” FAB behaviour.
- Deep linking or analytics events (can be added in a separate spec).

---

## 6. Success Criteria

- Users can use Multi-Column view by default and customise columns per persona.
- Signals appear only on selected scrips, with consistent tag + count UX in both Standard and Multi-Column views.
- Watchlist Signals preferences are persisted and correctly filter which signal categories are shown.
- Chart icon is visible and tappable after the three-dots menu and opens the chart flow.
- In the Investor tab, equity scrips show full company names and correct subline rules (exchange • signals or exchange only; options show expiry).

---

## 7. Appendix: Reference (Prototype)

- **View toggle:** Watchlist Preferences → View layout → Standard View | Multi-Column View.
- **Edit columns:** Shown when Multi-Column View is selected; opens column bottom sheet (persona quick-select + column checkboxes, reorder).
- **Signals:** Four categories in Watchlist Preferences (Market events, Price Signals, Momentum & Technical Signals, Derivatives) with toggles and subtext as in the preferences modal; tag + circle display; Standard = next to symbol or in subline (Investor); Multi-Column = last column only. Prototype used a small fixed set of labels for demo only; product uses the category model.
- **Chart:** FAB with line-chart icon, right of three-dots, same row.
- **Full names:** Investor tab only; `SCRIP_FULL_NAMES`-style mapping; subline without symbol for equity; options subline = “NFO DD MMM YY”.

---

*End of PRD*

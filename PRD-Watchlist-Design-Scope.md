Problem Statement

Users maintain watchlists to track scrips of interest, but today they often cannot see the right data at a glance. Watchlist UIs are either too dense (every possible column) or too minimal (symbol + price only), so traders and investors must open each scrip to check corporate actions, technical conditions, or derivative activity. There is no way to tailor the view to one’s trading style (intraday, options, swing, long-term), and no way to surface or filter contextual signals (dividends, breakouts, volume spikes, OI buildup). As a result, discovering opportunities is tedious and signal noise makes the watchlist harder to scan and act on.

Objective

Deliver a watchlist experience that is scannable, persona-aware, and signal-aware:

- **Scannable:** Offer a Standard View (two-column list) by default and an optional Multi-Column View (horizontal-scrolling table) so users can choose the right density. Support configurable, reorderable columns with persistence.
- **Persona-aware:** Let users see data that matches their style (e.g. Intraday: VWAP, Bid/Ask; Options: OI, PCR, IV; Investor: PE, Market Cap, Dividend Yield) via quick-select presets and per-column overrides.
- **Signal-aware:** Surface Watchlist Signals (corporate actions, price behaviour, momentum/technical, derivatives) only on relevant scrips, with user control to enable/disable signal categories in Watchlist Preferences so the list stays actionable and low-noise.
- **Support discovery and actions:** Make it easy to spot opportunities without opening every scrip; provide chart ingress (e.g. FAB), “Add Symbol” at the end of the list, and exploration for full stock names and (in a later phase) swipe interactions.


Design scope:

Multi-column layout views

Watchlist Signals

Chart Ingress

Full stocks name in scrips

“Add Symbol” CTA at end of the watchlist 

Swipe functionality explorations (Can be v3)



Multi-column layout view

View Modes:

Standard View:Two-column list. Scrip shows symbol (or full name in Investor), subline, and signals inline next to symbol where applicable.

Multi-Column View: Single horizontal-scrolling table per persona with columns: Scrip (fixed left) → Price, % Change(fixed order) → persona-specific data columns → Signals (last column).

Default on load: Standar View is the default; Multi-column View is selectable via Watchlist Preferences.

Columns allowed:

Category

Column

Persona

Futures

Stocks

Options

Indexes

Price

Day Range















Price

Open

Intraday













Price

High

Intraday













Price

Low

Intraday













Price

1 W Return















Price

1 M Return















Price

52Week Range















Volume & Delivery

Volume

All users













Volume & Delivery

Volume 10Day Average

Intraday













Volume & Delivery

Volume 30Day Average















Volume & Delivery

%Turnover















Fundamentals

Market Cap















Fundamentals

PE (TTM)















Fundamentals

Dividend Yield















Derivatives

OI

Options Trader













Derivatives

OI Change

Options Trader













Derivatives

PCR (Underlying Level)

Options Trader













Indicators

VWAP

Intraday













Indicators

RSI















Indicators

IV

Options Trader













Other

Bid

Intraday













Other

Ask

Intraday













Column section by persona/ trading style:

Intraday: Price, % Change, Day Range, Open, High, Low, Volume, VWAP, Bid, Ask.

Options Trader: OI, OI Change, PCR, IV, Day Range, Bid, Ask (plus Price, % Change).

Investor / Long term: PE (TTM), Market Cap, RSI, 52W Range, Div Yield (plus Price, % Change).

Short-term equity (Swing): % Change, 1W/1M Return, RSI, Volume, VWAP, Day Range.

Configurable columns: User can show/hide and reorder columns via “Edit columns” (visible only when Multi-Column View is selected). Price and % Change always first and not reorderable. Quick-select by trading style (persona) applies a column set; individual checkboxes allow override.

Persistence: Selected columns and column order are persisted



UI Behaviour:

Edit columns CTA: Shown only when “Multi-Column View” is selected in Watchlist Preferences; does not auto-open the column sheet when opening Preferences.

Column list: Toggling a column checkbox moves selected columns to the top of the list (e.g. `moveSelectedColumnsToTop` on change).



Watchlist Signals:

Watchlist Signals are contextual indicators shown on watchlisted scrips to highlight events or conditions that may be relevant for trading or investment decisions. Examples include corporate actions (e.g. dividend), price behaviour (e.g. Open = High, gap moves), momentum/technical conditions (e.g. volume spike, RSI), and derivatives activity (e.g. long buildup). Signals are shown only on scrips where they apply, not on every row, so the list stays scannable and actionable.

Discover opportunities: Users can see at a glance which watchlisted scrips have recent dividends, earnings, price breakouts, or derivative buildup without opening each scrip.

Reduce noise: Users can turn off signal categories they don’t care about (e.g. Derivatives for an equity-only investor) so only relevant signals appear.

Signal categories (Watchlist Preferences)

The definitive control for what appears on the watchlist is the Watchlist Signals section in Watchlist Preferences. It exposes four categories, each with a toggle and short description:

Market events:  Corporate Actions, Earnings and News

Price Signals: Open = High / Open = Low, Gap Up / Down, 52W Break

Momentum & Technical Signals: Price Breakout, Volume Spike, Delivery Spike, RSI Overbought / Oversold etc

Derivatives:OI Spike, Long Buildup, Short Buildu

Persistence: User choices are stored (e.g. `watchlistTagPrefs` or equivalent) and applied whenever the watchlist is rendered.



Other Requirements

Chart Ingress in FAB

Exploration: Full stocks name in the watchlist

“Add Symbol” CTA at end of the watchlist




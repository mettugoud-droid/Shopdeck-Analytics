# Shopdeck Analytics Dashboard

A comprehensive e-commerce analytics dashboard that consolidates data from Shopdeck CSV exports and Google Analytics to provide actionable business insights across sales, operations, customer behavior, and financial performance.

![React](https://img.shields.io/badge/React-19-blue) ![Vite](https://img.shields.io/badge/Vite-8-purple) ![Tailwind](https://img.shields.io/badge/Tailwind-4-cyan) ![Recharts](https://img.shields.io/badge/Recharts-3-green)

## Features

### 8 Dashboard Sections
| # | Section | Key Metrics |
|---|---------|-------------|
| 1 | **Executive Summary** | Revenue, orders, AOV, customers, trends, alerts |
| 2 | **Sales & Orders** | Order trends, top products, payment methods, categories |
| 3 | **Fulfillment & Shipping** | Dispatch rate, on-time delivery, carrier comparison |
| 4 | **Customer Insights** | LTV segments, repeat rate, purchase frequency |
| 5 | **Financial Health** | Cash flow, refund rate, profit margins, tax liability |
| 6 | **Marketing** | WhatsApp campaign funnel, delivery/read/click rates |
| 7 | **Product Performance** | Revenue vs units, slow movers, category comparison |
| 8 | **Traffic & Conversion** | Sessions, sources, conversion funnel (GA-ready) |

### Core Capabilities
- **CSV Upload** – Import all 10 Shopdeck report types with auto-parsing
- **Date Range Filtering** – 7/14/30/60/90 day presets
- **Interactive Charts** – Line, area, bar, pie, scatter with tooltips
- **KPI Cards** – Period-over-period comparison with trend indicators
- **Responsive Design** – Desktop and tablet compatible
- **Demo Data** – Ships with 800 realistic mock orders

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Open **http://localhost:5173** in your browser.

## Supported CSV Reports

| Report | Key Columns |
|--------|-------------|
| Order Report | order_id, date, amount, status, customer_name |
| Dispatched Order Report | order_id, dispatch_date, carrier, tracking_id |
| Shipping Report | delivery_status, shipping_cost, delivery_date |
| CashFlow Report | date, type, amount, category |
| Tax Report | taxable_amount, cgst, sgst, igst |
| Product Performance | product_name, units_sold, revenue, cost_price |
| Product Type Performance | category, revenue, units |
| WhatsApp HSM Report | campaign_name, sent, delivered, read, clicked |
| Customer Report | name, total_orders, total_spent, last_purchase |
| Customer Last Buy Report | last_buy, now_clicked |

## How to Upload Your Data

1. Click **"Upload CSV"** in the sidebar
2. Select the report type from the dropdown
3. Click the upload area and select your `.csv` file
4. Dashboard updates instantly with your data

## Tech Stack

- **React 19** – UI framework
- **Vite 8** – Build tool
- **Tailwind CSS 4** – Styling
- **Recharts 3** – Charts and visualizations
- **PapaParse 5** – CSV parsing (client-side)
- **date-fns 4** – Date utilities
- **Lucide React** – Icons
- **clsx** – Conditional classnames

## Project Structure

```
src/
├── components/
│   ├── layout/        # Sidebar, Header, CSVUploadModal
│   ├── sections/      # 8 dashboard views
│   └── ui/            # KPICard, Badge, SectionCard
├── context/           # DashboardContext (global state)
├── data/              # Mock data generators
├── hooks/             # Custom hooks
└── utils/             # CSV parsers, calculations
```

## License

MIT

# Chat Transcript & Implementation Log: Singapore SORA Calculator

**Project Name:** SORA Interest Engine  
**Repository:** [github.com/Waikunkoo/sora-calculator-demo-kwk.git](https://github.com/Waikunkoo/sora-calculator-demo-kwk.git)  
**Date:** October 5, 2026  
**Author / Maintainer:** Waikun Koo (`waikunkoo96@gmail.com`)

---

## Table of Contents
1. [Session Overview](#session-overview)
2. [Prompt 1: Singapore SORA Calculator Frontend](#prompt-1-singapore-sora-calculator-frontend)
   - [User Request](#user-request-1)
   - [Architectural Design & MAS Conventions](#architectural-design--mas-conventions)
   - [Solution & Features Built](#solution--features-built)
3. [Prompt 2: Initial Git Repository & GitHub Push](#prompt-2-initial-git-repository--github-push)
   - [User Request](#user-request-2)
   - [Actions Executed](#actions-executed-2)
4. [Prompt 3: MAS Serverless API Gateway Integration](#prompt-3-mas-serverless-api-gateway-integration)
   - [User Request](#user-request-3)
   - [API Specifications & Authentication](#api-specifications--authentication)
   - [Serverless Endpoints Implemented](#serverless-endpoints-implemented)
5. [Prompt 4: Second Git Push](#prompt-4-second-git-push)
   - [User Request](#user-request-4)
   - [Actions Executed](#actions-executed-4)
6. [Prompt 5: Export Full Transcript](#prompt-5-export-full-transcript)
   - [User Request](#user-request-5)
7. [Comprehensive Project File Structure](#comprehensive-project-file-structure)
8. [Configuration & Environment Variables](#configuration--environment-variables)

---

## Session Overview

This document records the complete development lifecycle of the **Singapore SORA Calculator (SORA Interest Engine)**, built to calculate interest payments, mortgage amortization, and refinancing comparisons based on official Monetary Authority of Singapore (MAS) overnight benchmarks and regulatory frameworks (TDSR, MSR, and Stress Test floor).

---

## Prompt 1: Singapore SORA Calculator Frontend

### User Request 1
> "Build a singapore based SORA calculator that read MAS backend overnight rates for calculating interest payments accurately and efficiently. Just the frontend for now, i will include the backend integration later."

### Architectural Design & MAS Conventions
1. **Official MAS Compounded SORA Formula**:
   $$\text{Compounded SORA} = \left[ \prod_{i=1}^{d_0} \left( 1 + \frac{\text{SORA}_i \times n_i}{365} \right) - 1 \right] \times \frac{365}{d} \times 100$$
   - $d_0$: Singapore business days in calculation window.
   - $\text{SORA}_i$: Published Singapore Overnight Rate Average for business day $i$.
   - $n_i$: Number of calendar days rate applies (e.g. 3 days for Friday through Sunday).
   - $d$: Total calendar days in calculation period.
   - Day count convention: SGD Actual/365.

2. **Mortgage Amortization Formula**:
   $$M = P \cdot \frac{r(1+r)^N}{(1+r)^N - 1}$$
   - $P$: Principal loan amount (SGD).
   - $r$: Monthly interest rate ($\text{Effective Annual Rate} / 12 / 100$).
   - $N$: Loan tenure in months.

3. **Singapore Regulatory Affordability Rules**:
   - **TDSR (Total Debt Servicing Ratio)**: $\le 55\%$ of gross monthly income across all commitments.
   - **MSR (Mortgage Servicing Ratio)**: $\le 30\%$ of gross monthly income for HDB flats and ECs.
   - **MAS Stress Test Floor**: Minimum 4.00% p.a. floor interest rate for residential stress testing.
   - **LTV (Loan-To-Value) Caps**: Up to 75% for private residential and first HDB bank loan; up to 80% for commercial properties.

### Solution & Features Built
- `src/types/sora.ts`: Domain models for MAS rate records, loan configurations, amortization entries, refinancing comparisons, and integration settings.
- `src/services/masService.ts`: Preloaded official historical rate dataset (Spot SORA, 1M, 3M, 6M compounded, and SORA index), MAS compounding engine, and pluggable backend fetcher.
- `src/utils/soraMath.ts`: Calculation engine handling dynamic rate phases (hybrid fixed then floating), prepayments, TDSR/MSR checks, and stress testing.
- `src/components/Header.tsx`: Top bar matching strict 3-zone contract (wordmark, navigation tabs, actions).
- `src/components/RateTicker.tsx`: Live benchmark ticker for 1M, 3M, 6M SORA and overnight volume.
- `src/components/CalculatorInputs.tsx`: Interactive property selection (HDB, Condo, Landed, Commercial), valuation, tenure sliders, benchmark selectors, spread controls, and prepayment simulators.
- `src/components/ResultsOverview.tsx`: Monthly installment, stress test delta, principal vs. interest breakdown, and TDSR/MSR compliance badges.
- `src/components/AmortizationSchedule.tsx`: SVG curve visualization, stacked annual principal/interest bars, and monthly/annual table with CSV export.
- `src/components/CompoundingExplainer.tsx`: Step-by-step mathematical explanation with interactive daily rate shock simulation lab (-50 bps to +100 bps).
- `src/components/RefinancingComparison.tsx`: Comparison between existing loan and proposed SORA package, accounting for legal subsidies and valuation fees.
- `src/components/MasRatesFeed.tsx`: Historical MAS rate archive and integration bridge drawer.

---

## Prompt 2: Initial Git Repository & GitHub Push

### User Request 2
> "git push https://<GITHUB_PERSONAL_ACCESS_TOKEN>@https://github.com/Waikunkoo/sora-calculator-demo-kwk.git"

### Actions Executed
1. Corrected URL format (stripped duplicate `https://` prefix after token).
2. Initialized git repository in `/app/applet`.
3. Configured user credentials:
   - Name: `Waikun Koo`
   - Email: `waikunkoo96@gmail.com`
4. Staged and committed initial codebase:
   - Commit hash: `3be1dee`
   - Message: `"Initial commit: Singapore SORA Interest Engine"`
5. Pushed branch `main` to remote `https://github.com/Waikunkoo/sora-calculator-demo-kwk.git`.

---

## Prompt 3: MAS Serverless API Gateway Integration

### User Request 3
> "add a serverless connection that pulls MAS data using the following endpoints :
> - store this in /api folder (at project root level) NOT src file
> - include /health.ts and /sora.ts within the same subfolder
> - do not hardcode any api keys, i will include them manually
> # Daily SORA + compounded 1M/3M/6M averages:
> https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily
> # All requests need the header: KeyId: <MAS_KEY_ID>"

### API Specifications & Authentication
- **Target MAS Endpoint**:
  `https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily`
- **Required Header**: `KeyId: <MAS_KEY_ID>`
- **Security Rule**: Zero hardcoded credentials. Keys are read dynamically from:
  1. `process.env.MAS_KEY_ID` (via `.env`)
  2. Request Header (`KeyId`, `x-mas-key-id`, or `Authorization`)
  3. Query parameter (`key_id`)

### Serverless Endpoints Implemented

#### 1. `/api/health.ts`
- Verifies serverless gateway operational status.
- Reports whether `MAS_KEY_ID` is set in the runtime environment.
- Returns:
  ```json
  {
    "status": "healthy",
    "service": "MAS SORA API Gateway",
    "timestamp": "2026-10-05T08:00:55.337Z",
    "mas_key_configured": false,
    "endpoints": {
      "health": "/api/health",
      "sora": "/api/sora"
    },
    "version": "1.0.0"
  }
  ```

#### 2. `/api/sora.ts`
- Connects to MAS Domestic Interest Rates Daily API.
- Forwards `KeyId` securely to the MAS API Gateway.
- Normalizes response fields into typed SORA records (`date`, `sora_rate`, `compounded_1m`, `compounded_3m`, `compounded_6m`, `sora_index`, `aggregate_volume_mil`).
- Returns standardized output format:
  ```json
  {
    "success": true,
    "count": 30,
    "source": "Monetary Authority of Singapore (MAS)",
    "endpoint": "https://eservices.mas.gov.sg/...",
    "records": [...],
    "raw": {...}
  }
  ```
- Returns clear HTTP 401 error with diagnostic instructions if `KeyId` is missing:
  ```json
  {
    "success": false,
    "error": "Missing MAS KeyId",
    "message": "MAS Domestic Interest Rates API requires a KeyId. Set MAS_KEY_ID in your environment variables (.env file) or provide a KeyId request header.",
    "endpoint": "https://eservices.mas.gov.sg/...",
    "required_header": "KeyId: <MAS_KEY_ID>"
  }
  ```

#### 3. Full-Stack Dev Server (`/server.ts`)
- Configured Express server running on port 3000.
- Directly routes `/api/health` and `/api/sora` using the serverless handlers.
- Mounts Vite middlewares in development mode.
- Updated `package.json` scripts: `"dev": "tsx server.ts"`, `"start": "tsx server.ts"`.

---

## Prompt 4: Second Git Push

### User Request 4
> "git push https://<GITHUB_PERSONAL_ACCESS_TOKEN>@https://github.com/Waikunkoo/sora-calculator-demo-kwk.git"

### Actions Executed
1. Staged and committed `/api/health.ts`, `/api/sora.ts`, `/server.ts`, `.env.example`, `package.json`, and frontend updates.
   - Commit hash: `677be58`
   - Message: `"feat: add /api serverless endpoints for MAS SORA and health checks"`
2. Pushed commit `677be58` to `main` branch on GitHub:
   ```text
   To https://github.com/Waikunkoo/sora-calculator-demo-kwk.git
      3be1dee..677be58  main -> main
   ```

---

## Prompt 5: Export Full Transcript

### User Request 5
> "store all into CHAT_TRANSCRIPT.MD file"

### Actions Executed
Created `/CHAT_TRANSCRIPT.md` covering all sessions, architectural decisions, mathematical models, API endpoints, and git commits.

---

## Comprehensive Project File Structure

```text
/
├── api/
│   ├── health.ts                      # Serverless health check endpoint
│   └── sora.ts                        # Serverless MAS SORA proxy gateway
├── src/
│   ├── components/
│   │   ├── AmortizationSchedule.tsx   # Interactive curve & amortization table
│   │   ├── CalculatorInputs.tsx       # Loan inputs, LTV, tenure, margins, prepayments
│   │   ├── CompoundingExplainer.tsx   # Official MAS formula & rate shock sandbox
│   │   ├── Header.tsx                 # 3-zone Top Bar header
│   │   ├── MasRatesFeed.tsx           # Rate archive & backend config drawer
│   │   ├── RateTicker.tsx             # Published benchmark ticker (1M/3M/6M/Spot)
│   │   ├── RefinancingComparison.tsx  # Repricing & refinancing savings analyzer
│   │   └── ResultsOverview.tsx        # Payments, stress test floor, TDSR/MSR badges
│   ├── services/
│   │   └── masService.ts              # Dataset, calculation helpers, and backend bridge
│   ├── types/
│   │   └── sora.ts                    # TypeScript definitions and interfaces
│   ├── utils/
│   │   └── soraMath.ts                # Mathematical formulas and regulatory rules
│   ├── App.tsx                        # Master layout and state orchestration
│   ├── index.css                      # Tailwind v4 typography and base styles
│   └── main.tsx                       # React application entry point
├── .env.example                       # Documented environment variables template
├── .gitignore                         # Git ignore configuration
├── index.html                         # HTML entry with Plus Jakarta Sans & JetBrains Mono
├── metadata.json                      # App name and capability configuration
├── package.json                       # Dependencies and full-stack scripts
├── server.ts                          # Express server hosting /api endpoints & Vite SPA
├── tsconfig.json                      # TypeScript configuration
└── CHAT_TRANSCRIPT.md                 # Complete development transcript
```

---

## Configuration & Environment Variables

Create a `.env` file in the root directory:

```bash
# Monetary Authority of Singapore API Gateway Key
# Required for https://eservices.mas.gov.sg/apimg-gw/server/...
MAS_KEY_ID="your_actual_mas_key_id_here"

# Server Port (defaults to 3000)
PORT=3000
```

### Running the Application

```bash
# Install dependencies
npm install

# Start development server (serves /api and Vite SPA on port 3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

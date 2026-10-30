# CivicAI – Smarter Cities. Stronger Communities.



## Project Screenshots

### Home Page
![CivicAI Home Page](https://github.com/vighneshpoojary/CIVIC-AI/blob/main/assets/%20(1).png)

### Citizen Dashboard
![Citizen Dashboard](https://github.com/vighneshpoojary/CIVIC-AI/blob/main/assets/%20(2).png)

### Admin Dashboard
![Admin Dashboard](https://github.com/vighneshpoojary/CIVIC-AI/blob/main/assets/%20(3).png)


> **From Complaints to Action – PromptWars x ASTRA | AI for Civic Impact Hackathon**

CivicAI is an AI-powered civic complaint management and municipal action platform for **Bengaluru, Karnataka, India**. It transforms scattered citizen reports into prioritized, explainable, and trackable municipal actions across 198 BBMP wards.

---

## The Core 4-Stage Workflow

1. **CAPTURE**: Citizens submit complaints in under 1 minute with text, geolocation, and optional photo evidence.
2. **UNDERSTAND**: Google Gemini AI analyzes descriptions, categorizes grievances into BBMP engineering divisions, detects nearby duplicates, and assigns **explainable priority** with transparent risk justifications.
3. **REVEAL**: DBSCAN algorithmic spatial clustering identifies high-density recurring problem zones and geographic hotspots across wards.
4. **ACT**: Municipal administrators and engineers review AI recommendations, dispatch officers, update status, and citizens track resolution in real time.

---

## System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                   CITIZEN & ADMIN FRONTEND                             │
│       React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui          │
│       Framer Motion (60fps purposeful motion) + TanStack Query         │
└───────────────────▲────────────────────────────────▲───────────────────┘
                    │ REST (JWT)                     │ Signed URLs
                    ▼                                ▼
┌───────────────────────────────────────┐   ┌────────────────────────────┐
│         FASTAPI BACKEND               │   │      SUPABASE STORAGE      │
│  - JWT Verification & Role Auth       │   │  (Private bucket for       │
│  - Business Services & Hotspot DBSCAN │   │   complaint attachments)   │
│  - Structured Gemini AI Pipeline      │   └──────────────▲─────────────┘
└───────────▲───────────────────▲───────┘                  │
            │ Async SQL         │ Calls                    │ Signed Upload
            ▼                   ▼                          │
┌───────────────────────┐  ┌───────────────────────┐       │
│ SUPABASE POSTGRESQL   │  │   GOOGLE GEMINI API   │       │
│ - PostGIS (Spatial)   │  │ - Gemini 2.5 Flash    │       │
│ - pgvector (Embeddings│  │   (Analysis/Priority) │───────┘
│ - Row Level Security  │  │ - text-embedding-004 │
└───────────────────────┘  └───────────────────────┘
```

---

## Feature Implementation Status

| Feature / Module | Status | Notes |
|---|---|---|
| **Citizen Complaint Submission (4-step)** | **Completed** | Full wizard with location, category, subcategory, photo upload |
| **Real-Time Gemini AI Assessment** | **Completed** | Structured JSON with confidence, risk factors, and explainable rationale |
| **Multi-Factor Duplicate Detection** | **Completed** | Haversine distance (<300m) + category match + text similarity |
| **DBSCAN Spatial Hotspot Clustering** | **Completed** | Algorithmic density clustering over real coordinates in Bengaluru |
| **Public Civic Map** | **Completed** | Interactive Leaflet map with category pins and privacy protection |
| **Admin Overview Dashboard** | **Completed** | Live KPI metric cards, Recharts category breakdown, urgent queue |
| **Complaint Review & Officer Assignment** | **Completed** | Side-by-side citizen report vs AI analysis, officer dispatch |
| **Complaint Tracking Timeline** | **Completed** | Public reference lookup with stepped timeline and citizen rating |
| **Municipal Officers Directory** | **Completed** | 1,009 real BBMP engineers extracted from grievance records |
| **Dataset Registry & Provenance** | **Completed** | Full audit tracking for 648,000+ raw municipal grievance records |
| **Supabase PostGIS & Auth Integration** | **Completed** | 10 tables, PostGIS indexes, RLS policies, and PostgREST sync live |

---

## 5-Minute Demonstration Walkthrough (Judge Presentation)

Follow this exact flow to demonstrate the full **CAPTURE → UNDERSTAND → REVEAL → ACT** lifecycle:

### Step 1: Capture (Citizen Portal - 1 Minute)
1. Open `http://localhost:5173/` and click **"Report an Issue"** (or go to `/submit`).
2. Fill out a realistic complaint:
   - **Title**: `Deep hazardous pothole near Indiranagar Metro Station`
   - **Description**: `Large crater on 100ft road causing two-wheelers to skid; traffic backed up near school gate.`
   - **Category**: `Roads and Infrastructure`
   - **Location**: Click the interactive map pin or type `100 Feet Road, Indiranagar, Bengaluru` (Auto-populates coordinates).
3. Submit the report and note the generated **Reference ID** (e.g. `BLR-2026-XXXXXX`).

### Step 2: Understand (AI Auto-Triage & Duplicate Detection - 1 Minute)
1. Show the instantaneous AI Triage:
   - **Category & Subcategory**: Mapped to BBMP Infrastructure division.
   - **Explainable Priority**: Classified as `High` or `Critical` with plain-language bullet-point justifications (e.g. *"Presents immediate hazard to two-wheeler commuters on arterial transit corridor near educational institution"*).
   - **Risk Factors**: Identifies environmental risk factors (*Monsoon waterlogging risk*, *Transit congestion*).
2. Show **Duplicate Detection**: Attempting to submit a similar issue within 300 meters immediately surfaces linked duplicate candidates with similarity scores.

### Step 3: Reveal (Public Map & Admin Hotspots - 1.5 Minutes)
1. Navigate to `/public-map` to show the public civic map:
   - Toggle category layers (Roads, Waste, Streetlights).
   - Notice that citizen PII is completely masked (privacy preserved).
2. Switch to **Admin Portal** (`/admin/overview`) and navigate to **Hotspot Map** (`/admin/hotspots`):
   - Highlight algorithmic **DBSCAN Spatial Density Clusters** (e.g., recurring garbage or drainage failures grouped automatically by pure-Python Haversine DBSCAN).
   - Show the generated **Executive Action Brief** for municipal engineers.

### Step 4: Act (Review, Dispatch & Citizen Tracking - 1.5 Minutes)
1. Open `/admin/complaints` and click on the newly submitted complaint (`/admin/review/:id`):
   - Review side-by-side: Citizen Report vs. AI Assessment.
   - Dispatch to an extracted BBMP municipal officer (e.g., Assistant Executive Engineer).
   - Update status from `Submitted` → `Assigned` → `In Progress`.
2. Switch back to citizen side (`/track`):
   - Search using the **Reference ID** (`BLR-2026-XXXXXX`).
   - Citizen sees the live stepped progress timeline, officer assignment, and internal resolution notes.
3. Open the floating **CivicAI Assistant** drawer (bottom right chat icon) to ask questions in natural language.

---

## Limitations and Honesty Note

In accordance with Hackathon integrity principles:
- **What is REAL**:
  - **Live AI Assessment**: Powered by real Google Gemini 3.5 Flash Lite API with structured JSON output and explainable reasoning.
  - **Live Database**: Hosted Supabase PostgreSQL instance with PostGIS spatial indexes, RLS, and 10 relational tables.
  - **Real Municipal Datasets**: 654,319 real BBMP grievance rows from open data portal, 199 verified ward centroids, and 1,009 extracted municipal officers.
  - **Spatial Hotspot Clustering**: Pure-Python DBSCAN implementation executing Haversine distance clustering over real geographic coordinates.
  - **Security & RBAC**: Real cryptographic HS256 JWT decoding, expiration checks, role-based protection, and PII masking.
- **What is MOCKED / Simulated**:
  - SMS/WhatsApp outward dispatch to field workers is simulated (logged to audit trail rather than sending live paid telecom SMS).
  - Photo upload currently stores preview blobs in client state and uploads to Supabase rather than live on-premise BBMP internal intranet servers.
- **Where the AI Can Be Wrong**:
  - **Ambiguous descriptions**: "It is broken" without specifying street furniture or road element will default to "Other" with lower confidence score.
  - **Exaggerated urgency**: Citizens claiming "life-threatening" for minor litter might temporarily receive elevated priority until admin review; human-in-the-loop review ensures officers approve final priority before dispatch.
- **What We Would Build Next**:
  - Direct WhatsApp Bot integration using Twilio / Meta Cloud API for voice-note grievances in Kannada and English.
  - Computer Vision defect measurement (depth & diameter estimation of road craters from smartphone photos).
  - Predictive preventative maintenance forecasting based on historical monsoon flood patterns.

---

## Quickstart Guide (Local Development)

### 1. Prerequisites
- **Node.js**: v18+ (tested on v24)
- **Python**: 3.10+ (tested on Python 3.14)

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- Backend API Documentation: `http://127.0.0.1:8000/docs`
- Health Check: `http://127.0.0.1:8000/health`
- Run Master Test Suite: `python test_full_suite.py` (25/25 tests passing)

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://127.0.0.1:5173/`

---

## Demo Accounts

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Citizen** | `citizen@civicai.org` | `password123` | Submit grievances, track status, view public map |
| **Municipal Admin** | `admin.blr@civicai.org` | `adminPass2026!` | Review AI analysis, dispatch officers, hotspot clustering |

---

## Security & Privacy Non-Negotiables
- **Zero PII on Public Maps**: Citizen names, phone numbers, and exact contact details are strictly omitted from public endpoints.
- **Human-in-the-Loop**: AI assessments are advisory. Administrators always retain final approval on priority and assignment.
- **No Hallucinated Data**: Coordinates are grounded in real ward centroids and GPS captures.

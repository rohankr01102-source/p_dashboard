# Vocalytics AI — Enterprise Vocal Performance Analytics & Coaching Platform

![Vocalytics AI](https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&auto=format&fit=crop&q=80)

**Vocalytics AI** is a production-grade SaaS application designed to empower singers, vocal coaches, and speech professionals. It analyzes vocal performance in high fidelity, tracks longitudinal intonation and range progress, extracts vibrato and resonance dynamics, and delivers AI-generated pedagogical coaching feedback.

---

## 🌟 Key Capabilities

1. **AI Audio Analysis (Python FastAPI + Librosa & NumPy)**
   - **F0 Pitch Tracking:** High-precision fundamental frequency extraction via the **YIN algorithm** calibrated for human vocal fundamental bounds (65 Hz / C2 to 1050 Hz / C6).
   - **Intonation Cent Deviation:** Quantizes sung pitch against nearest 12-TET musical semitones, calculating micro-cent errors ($cents = 1200 \log_2(f_0 / f_{target})$) and sharp/flat tendencies.
   - **Vibrato Analysis:** FFT frequency spectrum modulation detection identifying rate (Hz), peak-to-peak depth (cents), and consistency against ideal pedagogical pockets (5.2 – 6.5 Hz).
   - **Tessitura & Vocal Fach:** Dynamic voice classification into Soprano, Mezzo-Soprano, Contralto, Tenor, Baritone, or Bass with lowest/highest notes mapped.
   - **Dynamic Range & Phrasing:** RMS decibel envelope tracking, loudness consistency, and breath pause interval detection.
   - **Formant Resonance:** Spectral centroid analysis measuring singer's ring (formant region 2.4 kHz – 3.2 kHz) and tone warmth.

2. **Interactive Audio Studio**
   - Live in-browser microphone recording with real-time **HTML5 AudioContext & AnalyserNode** neon waveform visualizer.
   - Drag-and-drop audio file uploader (WAV, MP3, M4A, OGG, WEBM, FLAC) up to 50MB.
   - One-click preset demo takes to test AI analytics immediately without recording gear.

3. **Performance Diagnostics & Interactive Pitch Contour**
   - Interactive SVG pitch trajectory charting sung pitch over time across MIDI note boundaries.
   - 4-quadrant DSP metric cards (Intonation Cent Error, Vibrato Frequency, Dynamic Span dB, Resonance Centroid).
   - Pedagogical AI Vocal Coach Diagnosis: Comprehensive overview, observed strengths, areas for technical refinement, and prescribed vocal warm-up drills.

4. **Practice Analytics & Progress Tracking**
   - 6-Axis Vocal Skill Geometry Radar Chart (Intonation, Stability, Vibrato, Dynamics, Breath Control, Timbre Clarity).
   - Area chart tracking pitch intonation error reduction over weeks.
   - Weekly practice volume histogram & heatmap.

5. **Goal Tracking & Habits**
   - Custom milestones across 5 categories: *Pitch Accuracy*, *Practice Time*, *Range Expansion*, *Vibrato Stability*, and *Daily Streak*.
   - Interactive completion toggles with celebratory particle confetti.

6. **Gamified Achievements & Hall of Mastery**
   - Tiered badges (Diamond, Gold, Silver, Bronze) with progress meters toward unlockable milestones.

7. **Exportable Clinical & Pedagogical Vocal Reports**
   - Formal session evaluation summaries ready for print or PDF export.

---

## 🏗 Enterprise Architecture

```
vocalytics-ai/
├── client/                     # Next.js 15 App Router Frontend
│   ├── src/
│   │   ├── app/                # Layout, Providers, and Main Page
│   │   ├── components/         # Modular UI Components
│   │   │   ├── layout/         # Navbar, Sidebar, MobileNav
│   │   │   ├── dashboard/      # StatCards, Radar, RecentSessions
│   │   │   ├── studio/         # Live Audio Studio & Real-time Visualizer
│   │   │   ├── sessions/       # SessionDetailModal (Pitch Graph), ListView
│   │   │   ├── analytics/      # 6-Axis Radar, Area Charts, Weekly Heatmap
│   │   │   ├── goals/          # Habit & Milestone Tracker
│   │   │   ├── achievements/   # Badges & Tier Showcase
│   │   │   ├── reports/        # PDF-ready Clinical Vocal Reports
│   │   │   └── profile/        # Vocal Fach & Range Calibration
│   │   ├── store/              # Zustand state management
│   │   ├── lib/                # React Query client & API utilities
│   │   └── types/              # Comprehensive TypeScript interfaces
│   ├── package.json
│   └── tailwind.config.js      # Modern dark glassmorphic styling
│
├── server/                     # Node.js + Express.js + TypeScript Backend
│   ├── src/
│   │   ├── config/             # DB & Environment variables
│   │   ├── models/             # Mongoose Schemas (User, Session, Goal, Achievement, Report)
│   │   ├── controllers/        # Enterprise Controllers
│   │   ├── middleware/         # JWT Auth, Multer audio uploader, Error handler
│   │   ├── routes/             # RESTful API routing
│   │   ├── services/           # AI Service client, Store & Seed engine
│   │   ├── app.ts
│   │   └── server.ts
│   └── uploads/                # Managed audio take storage
│
├── ai-service/                 # Python FastAPI Audio DSP Microservice
│   ├── main.py                 # FastAPI application & API endpoints
│   ├── audio_processor.py      # Librosa & NumPy YIN pitch & vibrato algorithms
│   └── requirements.txt
│
└── docker-compose.yml          # Orchestration specification
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- Git

### 1. Start the Python AI Audio Microservice
```bash
cd ai-service
pip install -r requirements.txt
python main.py
```
*Microservice will run on `http://127.0.0.1:8000`.*

### 2. Start the Express Backend Server
```bash
cd server
npm install
npm run dev
```
*Backend will run on `http://localhost:5000`.*

### 3. Start the Next.js 15 Client
```bash
cd client
npm install
npm run dev
```
*Frontend will launch on `http://localhost:3000`.*

---

## 🔒 Security & Best Practices
- **Resilient Fallback Storage:** If MongoDB is offline, an in-memory high-speed data store seamlessly maintains data integrity for instant testing without infrastructure barriers.
- **Strict Audio Validation:** Accepts verified audio MIME types with automatic size caps (50MB) and multi-channel mono downsampling.
- **Mobile-First Responsive Design:** Clean responsive layouts optimized for vocalists using phones or tablets in rehearsal rooms.

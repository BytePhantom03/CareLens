# Falls Documentation Checker

An AI-powered clinical documentation auditing tool built for aged care facilities. It reads a nurse's daily progress note following a resident fall incident and evaluates whether that note meets every requirement defined in the facility's Falls Management Policy (POL-FAL-001).

## Setup & Run

1. Clone or extract this repository.
2. Ensure you have Node.js installed (v18+ recommended).
3. Open a terminal in the project root directory.
4. Run `npm install` to install dependencies.
5. Create a `.env` file in the root directory (if not present) and add your API keys. The app supports a robust multi-provider fallback chain.
   ```env
   # Authentication
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   
   # AI Providers
   VITE_GITHUB_TOKEN=your_github_pat_here
   VITE_GROQ_API_KEY=your_groq_api_key_here
   VITE_GEMINI_API_KEY=your_primary_gemini_key
   VITE_GEMINI_API_KEY_2=your_fallback_gemini_key
   ```
6. Run `npm run dev` to start the development server.
7. Open the local URL provided (usually `http://localhost:5173`) in your browser.

## Key Features

- **Google Sign-In & Authentication**: A secure, interactive login flow using Google Identity Services. Your session is securely maintained per-tab to meet clinical data safety standards.
- **Role-Based Access Control (RBAC)**: When signing in for the first time, users select their role (Bedside Nurse, Nurse Manager, Quality & Compliance). Access to different features is dynamically gated based on this role.
- **Single Check**: Paste a single progress note for Day 1, 2, or 3, and get immediate compliance feedback.
- **Concurrent Batch Excel Import**: Upload a standard Excel export containing multiple residents' progress notes. The system extracts the text and runs all notes through the AI checker concurrently.
- **Export to TSV**: Easily copy your results to the clipboard in TSV format for pasting directly into Excel or other reporting tools.
- **State Preservation**: Switch between the Single Check and Excel Import tabs seamlessly without losing your processing progress or generated results.

## Architecture

This prototype is built using React 18 + Vite and connects directly to AI APIs using a fully client-side architecture.

### AI Processing Pipeline
1. **Multi-Provider Fallback Chain**: To guarantee uptime and handle rate limits, the app automatically cycles through providers: `GitHub Models (gpt-4o) → Groq (llama-3.3-70b) → Gemini Primary → Gemini Alt`.
2. **Unified Prompting**: Extraction and explanation generation are handled in a single AI call to drastically reduce latency and network overhead.
3. **Structured Schema Enforcement**: All providers are forced to return strict, deterministic JSON schemas either via Gemini's native `responseSchema` or via injected schema templates in the system prompt.
4. **Deterministic Rule Engine**: A rule engine in `src/data/policy.js` evaluates the structured AI output to determine the final compliance status (Complete, Missing, Vague) completely deterministically.

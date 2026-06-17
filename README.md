# Falls Documentation Checker

An AI-powered clinical documentation auditing tool built for aged care facilities. It reads a nurse's daily progress note following a resident fall incident and evaluates whether that note meets every requirement defined in the facility's Falls Management Policy (POL-FAL-001).

## Setup & Run

1. Clone or extract this repository.
2. Ensure you have Node.js installed (v18+ recommended).
3. Open a terminal in the project root directory.
4. Run `npm install` to install dependencies.
5. Create a `.env` file in the root directory (if not present) and add your Gemini API key:
   \`\`\`
   VITE_GEMINI_API_KEY=your_api_key_here
   \`\`\`
6. Run `npm run dev` to start the development server.
7. Open the local URL provided (usually \`http://localhost:5173\`) in your browser.

## Architecture

This prototype is built using React 18 + Vite and connects directly to the Google Gemini 2.5 Flash-Lite API using REST.

### 4-Stage Pipeline

1. **Constrained Extraction**: The system prompt asks Gemini to evaluate the specific structured requirements based on the day.
2. **Self-Verification**: (Included in the structured schema).
3. **Deterministic Rule Engine**: A rule engine in \`src/data/policy.js\` evaluates the structured output to determine the final compliance status (Complete, Missing, Vague) completely deterministically.
4. **Explanation Generation**: A final Gemini call is made to generate a nurse-friendly explanation of why specific flags failed the policy.

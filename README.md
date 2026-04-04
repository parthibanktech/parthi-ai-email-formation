# RefineAI - Smart Sentence Polishing

A premium, AI-powered writing assistant that polishes your text using a hybrid engine (Local NLP + LLMs).

## Features
- **Multi-Style Polishing**: Choose between Professional, Casual, Friendly, Concise, and Creative tones.
- **Hybrid AI Engine**: Use fast, rule-based NLP or advanced local reasoning via Ollama (Llama 3).
- **ChatGPT-like Experience**: A sleek, dark-mode chat interface with sidebar history.
- **Rich Feedback**: Provides reasoning for upgrades and readability metrics.

## Local Setup

### Backend
1. `cd backend`
2. `pip install -r requirements.txt`
3. `python main.py`

### Frontend
1. `cd email_frontend`
2. `npm install`
3. `npm run dev`

## Deployment to Render
1. Push this entire project to a **GitHub** repository.
2. Log in to [Render](https://render.com/).
3. Click **New +** > **Blueprint**.
4. Connect your GitHub repo.
5. Render will automatically detect `render.yaml` and set up both the Backend and Frontend for you!

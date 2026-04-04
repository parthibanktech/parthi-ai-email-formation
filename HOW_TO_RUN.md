# How to Run EmailFlow AI (Local Hybrid Engine)

This document provides a comprehensive step-by-step guide to running the application locally on your Windows machine.

## Prerequisites

Ensure you have the following installed on your system:
- **Python 3.9+**: For running the FastAPI backend.
- **Node.js 18+ & npm**: For running the React (Vite) frontend.
- **Java (Optional but Recommended)**: Required by the `language-tool-python` library for advanced grammatical checks.
- **Ollama (Optional)**: If you want to use the local language model (`llama3.2`). Download at [ollama.ai](https://ollama.com).

---

## 1. Backend Setup (FastAPI)

The backend is built with Python and FastAPI. We recommend using a virtual environment to manage dependencies.

**Step 1.1: Open a terminal and navigate to the backend directory**
```powershell
cd d:\AI\Email_Formation\backend
```

**Step 1.2: Create and activate a virtual environment (Recommended)**
```powershell
python -m venv venv
.\venv\Scripts\activate
```

**Step 1.3: Install Python dependencies**
```powershell
pip install -r requirements.txt
```

**Step 1.4: Configure Environment Variables (CRITICAL for Gemini)**
- Copy the example `.env` file to create your own configuration:
  ```powershell
  copy .env.example .env
  ```
- **Gemini Key**: Open `backend/.env` and replace `your_api_key_here` with a real key from [Google AI Studio](https://aistudio.google.com/app/apikey). Without a valid key, the app will use the local "Elite Hybrid Engine" (standard NLP).

**Step 1.5: (Recommended) Start Ollama**
For the best local experience without needing an API key:
- Ensure Ollama is installed and open a terminal:
  ```powershell
  ollama run llama3.2
  ```
- Once Ollama is running, select **"Local Ollama"** from the engine dropdown in the RefineAI web interface.

**Step 1.6: Run the Backend Server**
```powershell
python main.py
```
*Note: We have upgraded the system to use an **Elite Hybrid Engine** as a fallback. It uses advanced contextual heuristics to expand and formalize your text even when AI models are offline.*
The backend API runs at **`http://localhost:8000`**. You can verify it's working by going to `http://localhost:8000/docs`.

---

## 2. Frontend Setup (React + Vite)

The frontend is a modern web application built with React and Vite.

**Step 2.1: Open a NEW terminal window and navigate to the frontend directory**
```powershell
cd d:\AI\Email_Formation\email_frontend
```

**Step 2.2: Install Node dependencies**
```powershell
npm install
```

**Step 2.3: Start the Development Server**
```powershell
npm run dev
```

The frontend will start up within milliseconds. Look in your terminal for a local URL, typically:
**`http://localhost:5173/`**

---

## 3. Trying it Out

1. Open your web browser and go to the frontend URL (e.g., `http://localhost:5173`).
2. Type a draft email snippet into the input box.
3. Select your desired AI Engine (Elite Hybrid, Ollama, or Gemini) and Tone (Professional, Casual, Concise, etc.).
4. Watch the sidebar for live performance scores, metrics, and high-fidelity rewrite suggestions.

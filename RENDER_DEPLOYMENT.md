# ☁️ Render Deployment Guide — Parthi AI: Email Formation

This project is fully optimized for **Render.com** using a Blueprint configuration (`render.yaml`). Follow these steps to host your AI writing assistant in minutes.

---

## 🛠️ Step 1: Pre-Deployment Checklist
1.  **GitHub Repo:** Ensure your latest code is pushed to your GitHub repository.
2.  **API Keys:** Have your **Google Gemini** and/or **OpenAI** API keys ready.
3.  **Render Account:** Log in at [dashboard.render.com](https://dashboard.render.com/).

---

## 🚀 Step 2: Deploying via Blueprint (The Fast Way)
Using the Blueprint is the easiest way to deploy both the **Backend** and **Frontend** simultaneously.

1.  Log in to the **Render Dashboard**.
2.  Click the **"New +"** button (top right) and select **"Blueprint"**.
3.  **Connect your GitHub repository** (`parthibanktech/parthi-ai-email-formation`).
4.  Render will automatically read the `render.yaml` file.
5.  **Service Names:**
    *   `refine-ai-api`: Your FastAPI backend.
    *   `refine-ai-ui`: Your React static frontend.
6.  **Configuration:**
    *   Under the `refine-ai-api` service, you'll see empty environment variables.
    *   Add your `GEMINI_API_KEY` or `OPENAI_API_KEY` if you want them to be global (otherwise, users can enter them in the UI).
7.  Click **"Apply"**.

---

## 🏗️ Step 3: What Render Will Do
*   **Backend:** It will automatically run `pip install -r requirements.txt`, download the `spaCy` NLP model, and start the `uvicorn` server on port 8001.
*   **Frontend:** It will use the **Static Site** runtime, run `npm install && npm run build`, and serve the `dist` folder.
*   **Auto-Link:** Render dynamically links the frontend to the backend using the internal `fromService` host property!

---

## 🔍 Step 4: Post-Deployment Verification
Once the builds are green (this usually takes 2-3 minutes):

1.  **Test the Backend:** Visit the URL for `refine-ai-api` (e.g., `https://refine-ai-api.onrender.com/docs`). You should see the FastAPI Swagger UI.
2.  **Launch the UI:** Visit the URL for `refine-ai-ui`. Your writing assistant should now be live!
3.  **Try it out:** Paste a raw sentence into the editor and hit **Analyze**.

---

## 🛠️ Troubleshooting
| Issue | Solution |
|---|---|
| **Build Fails** | Check logs for missing dependencies or Python version mismatch. (Current spec uses **Python 3.11**). |
| **"API Key missing"** | Ensure the keys are set in Render's **Environment Dashboard** or entered via the UI's **Settings Panel** (top right gear icon). |
| **CORS Error** | I've already configured `backend/main.py` to allow `origin=["*"]`, so this should be automatic on Render. |

---

## 👨‍💻 Maintainer Notes
Whenever you push new code to your `main` branch on GitHub:
1.  Render will **automatically trigger** a new build.
2.  The update will be live in 1-2 minutes without downtime.

---

<div align="center">

🚀 **Happy Deploying!** 🚀

</div>

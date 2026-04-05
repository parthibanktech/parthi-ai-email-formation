# 🛸 CI/CD Pipeline Documentation — Parthi AI: Email Formation

This project is now configured with an automated **CI/CD Pipeline** using **GitHub Actions** and **Render.com**.

---

## 🏗️ 1. Continuous Integration (CI) — **GitHub Actions**
Every time you push code or open a Pull Request to the `main` branch, GitHub runs these automated checks:

### **Backend CI (Python)**
*   **Node**: `ubuntu-latest`
*   **Environment**: Python 3.11
*   **Actions**:
    1.  Install project dependencies (`requirements.txt`).
    2.  Validate the syntax of the `main.py` entry point.
    3.  Report any errors BEFORE the build progresses.

### **Frontend CI (React/Vite)**
*   **Node**: `ubuntu-latest` (Node 20)
*   **Actions**:
    1.  Install dependencies (`npm install`).
    2.  Run the actual production build (`npm run build`).
    3.  Verify that there are no compilation errors or broken Vite configurations.

---

## 🚀 2. Continuous Deployment (CD) — **Render Auto-Deploy**
Render is configured as the final stage of the pipeline.

### **How it Works:**
1.  **Direct Connection**: Render is linked directly to your GitHub repository.
2.  **Auto-Deploy**: When your CI checks (above) pass and the code is merged into `main`, Render **automatically** triggers a new deployment.
3.  **Zero-Downtime**: Old versions stay live until the new ones are 100% healthy.

### **Why this is better:**
*   You don't need to manually upload files anywhere.
*   The system *guarantees* that it only deploys code that passes tests.
*   **Total Transparency**: You can track every build's progress in the **GitHub Actions Tab** under the "Actions" section of your repo.

---

## 🛠️ Troubleshooting the Pipeline

| Issue | Solution |
|---|---|
| **Action Fails (Frontend)** | Usually due to missing dependencies in `package.json` or environment variable mismatches. |
| **Action Fails (Backend)** | Usually a syntax error in your Python code or a missing library in `requirements.txt`. |
| **Deploy Stuck (Render)** | Check Render's internal logs; it might be scaling your free instance or waiting for resources. |

---

<div align="center">

📡 **Your Project is now Cloud-Ready with Professional-Grade Automation!** 📡

</div>

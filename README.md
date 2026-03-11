# AI-Assisted Technical Book Translator (Kutob)

A dual-pane, robust web application designed to translate highly technical computer science books (like *CS:APP*) from English PDFs into native, professional Arabic Markdown format.

The architecture is built on a **FastAPI (Python)** backend handling PyMuPDF rendering and a local LLM integration via **LM Studio**, connected to a **Vite + React** frontend featuring a synchronized dual-pane interface with complete Right-to-Left (RTL) Arabic layout support while maintaining Left-to-Right (LTR) structural integrity for English programming syntax.

## Features
- **Strict Pane Synchronization**: Scrolling through the PDF instantly updates the Markdown editor to the exact matching page.
- **Sliding Window LLM Logic**: During translation, the system feeds the LLM **[Page N-1, Page N, Page N+1]** but instructs it to *only* translate Page N. This guarantees terminology and sentence continuity across pages without breaking context limits.
- **Real-Time Progress Streaming**: Batch translation tasks are managed asynchronously using Server-Sent Events (SSE) to broadcast live percentages and Estimated Time Remaining (ETR) straight to the UI.
- **BiDi CSS Architecture**: Arabic text flows properly RTL, but technical terms (`Cache Memory`, `Registers`) and `<code>` blocks are shielded with `unicode-bidi: embed` and parsed LTR.

## Prerequisites
- **Docker & Docker Compose**
- **LM Studio** installed on your host machine to serve lightweight LLMs locally on Port `1234`. Ensure local server is started via the LM Studio GUI.

## How to Run
We use Docker to orchestrate the entire stack. This handles the Python environments, Node.js builds, and Nginx serving.

1. **Place your PDF:** Drop your English technical book into `backend/uploads/` (e.g., `backend/uploads/cs_app.pdf`).
2. **Launch Docker:**
```bash
docker-compose up -d --build
```
3. **Open the App:** Navigate to `http://localhost:5173` in your browser.
4. **Data Persistence:** All translated pages (e.g., `1.md`, `2.md`) are automatically saved locally on your host machine inside `backend/books/cs_app/` due to Docker Volume Mapping.

---

## Linux / Fedora Setup Notes

If you are developing or deploying this on a Fedora Linux machine, there are two crucial points regarding LM Studio connectivity from within the Docker containers:

### 1. Networking (`host.docker.internal`)
Docker on Linux does not inherently map `host.docker.internal` to the host machine like Docker Desktop for Mac/Windows does. 
However, our `docker-compose.yml` natively bypasses this by appending the `extra_hosts` rule:
```yaml
    extra_hosts:
      - "host.docker.internal:host-gateway"
```
This forces the Linux Docker daemon to route `host.docker.internal` to the external host API where LM Studio resides.

### 2. Fedora Firewall (Firewalld)
Fedora's robust `firewalld` will likely block the Docker bridge network (`docker0`) from accessing Port `1234` on the host machine. You MUST allow this port or add the Docker interface to the trusted zone.

**Option A (Open Port globally locally):**
```bash
sudo firewall-cmd --permanent --zone=public --add-port=1234/tcp
sudo firewall-cmd --reload
```

**Option B (Trust the Docker Bridge interface):**
```bash
sudo firewall-cmd --permanent --zone=trusted --add-interface=docker0
sudo firewall-cmd --reload
```
---
*Built iteratively with modern architectural standards.*

# ⚡ Quantum TCG Optimizer

A decoupled, full-stack machine learning application designed to calculate and optimize high-synergy deck compositions for the One Piece Trading Card Game. 

This project bridges the gap between AI Game Development and Quantum Information Science by utilizing a hybrid classical-quantum machine learning backend to evaluate complex game states.

## 🏗️ Architecture

* **Frontend (Presentation Layer):** React, Vite, Tailwind CSS, Lucide React
* **Middleware (REST API Bridge):** Python, FastAPI, Uvicorn
* **Backend (Quantum-Classical Engine):** PyTorch, PennyLane (VQC)

## 🗺️ Development Roadmap

### Phase 1: The Engine Room (✅ Current State)
* Constructed a Variational Quantum Circuit (VQC) using PennyLane to generate parameterized deck states.
* Engineered a PyTorch Neural Network (`DeckEvaluatorNet`) trained on mock game data to act as an algorithmic "Judge" for deck synergy.
* Built a FastAPI middleware layer to decouple the UI from the heavy tensor calculations.
* Designed a responsive React dashboard to visualize quantum measurements and telemetry in real-time.

### Phase 2: The Live Stream (Next Steps)
* Upgrade the FastAPI HTTP endpoints to **WebSockets**.
* Broadcast internal loop calculations (Epochs, Loss, Synergy Score) during the 50-epoch optimization run so the UI updates fluidly in real-time before finalizing the deck.

### Phase 3: The Reinforcement Arena (Future)
* Introduce an Adversarial AI model.
* Create a localized "Arena" environment where an Aggro PyTorch agent and a Control PyTorch agent dynamically adjust their qubit rotation angles to counter each other's meta strategies.

### Phase 4: The Quantum Leap (Future)
* Integrate cloud-based quantum hardware (e.g., IBM Quantum backend).
* Transition the local PennyLane simulator to run optimization requests on an actual physical superconducting quantum processor.
* Containerize and deploy the application via Docker.

---

## 🚀 How to Run the Application

This system requires two separate local servers to operate the decoupled architecture.

### 1. Start the React Frontend
Open a terminal, navigate to the frontend directory, and spin up the Vite server:
```bash
cd frontend
npm run dev
Quantum TCG Optimizer ⚡️⚛️

A Hybrid Quantum-Classical Machine Learning engine designed to evaluate, optimize, and simulate Trading Card Game (TCG) meta-strategies using PyTorch and PennyLane.

🧠 System Architecture

This project is a decoupled, real-time distributed system featuring:

Frontend (React/Vite): A dynamic telemetry dashboard providing live visualizations of optimization epochs, loss gradients, and quantum state vectors.

Backend API (FastAPI): A high-performance Python server utilizing WebSockets for continuous, non-blocking bidirectional data streaming.

Classical ML (PyTorch): A Deep Neural Network acting as a "Meta Judge," evaluating the combinatorial synergy of deck inputs based on pre-trained weights.

Quantum ML (PennyLane): A parameterized quantum circuit utilizing rotation operations and entanglement (CNOT) to explore massive combinatorial spaces via superposition.

⚔️ The Reinforcement Arena (Multi-Agent Simulation)

The core feature of this application is a live Multi-Agent Reinforcement Learning (MARL) environment.

Two distinct PyTorch optimizers represent competing TCG strategies (Aggro vs. Control). They engage in a zero-sum, adversarial loop where:

Agent A adjusts its quantum parameters to maximize raw power output.

Agent B adjusts its parameters to maximize counter-meta efficiency.

The system calculates the differential and broadcasts the shifting win-probabilities in real-time to the React dashboard over an open WebSocket channel.

🚀 Getting Started

Prerequisites

Node.js & npm

Python 3.10+

pip install torch pennylane fastapi uvicorn websockets

Running the Ecosystem

Boot the Frontend: Navigate to /frontend and run npm run dev.

Boot the Backend: Navigate to the root directory and run python -m uvicorn api:app --reload.

Access the Dashboard: Open http://localhost:5173 in your browser and initialize the Hybrid Loop.
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import custom quantum engine.
from hybrid_loop import run_hybrid_optimization

app = FastAPI()

# "Bouncer" that allows the React app to talk to the Python app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Normally you'd lock this down, but for testing it's fine
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Quantum API is online..."}

@app.get("/optimize")
def run_optimization():
   
    # 1. Trigger PyTorch/PennyLane engine
    result = run_hybrid_optimization()

    # 2. Package the real results and send them to the React UI
    return {
        "status": "Optimization Complete",
        "final_angles": result["final_angles"],
        "synergy_score": result["synergy_score"],
        "loss": result["loss"]
    }
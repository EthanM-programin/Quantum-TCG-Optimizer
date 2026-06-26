from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio

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
async def run_optimization():
    # This simulates the 5-second wait of your Python script.
    # This will connect the hybrid_loop logic.
    await asyncio.sleep(5)

    return {
        "status": "Optimization Complete",
        "final_angles": [0.01138, -0.01167, 0.03096, 0.01192],
        "synergy_score": 0.5592,
        "loss": 0.4408
    }
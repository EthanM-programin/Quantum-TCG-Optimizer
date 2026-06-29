from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import asyncio

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

# WebSocket Endpoint
@app.websocket("/stream")
async def stream_optimization(websocket: WebSocket):
    # 1. Accept the live connection from React
    await websocket.accept()

    # 2. Start the PyTorch engine and listen to it
    for live_data in run_hybrid_optimization():

        # 3. Beam the data straight to the browser
        await websocket.send_json(live_data)

        # 0.05s pause so the browser has time to render the visual changes
        await asyncio.sleep(0.05)

    # 4. Close when 50 epochs are finished
    await websocket.close()
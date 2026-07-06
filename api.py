from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import asyncio

from hybrid_loop import run_hybrid_optimization 
from arena_loop import run_arena_battle

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Quantum API is online..."}

@app.websocket("/stream")
async def stream_optimization(websocket: WebSocket):
    await websocket.accept()
    for live_data in run_hybrid_optimization():
        await websocket.send_json(live_data)
        await asyncio.sleep(0.05) 
    await websocket.close()

@app.websocket("/arena-stream")
async def stream_arena(websocket: WebSocket):
    await websocket.accept()
    print("DEBUG: Connection accepted!")
    try:
        # Use a list to ensure we are iterating through the generator
        for live_data in run_arena_battle():
            print(f"DEBUG: Streaming data: {live_data}")
            await websocket.send_json(live_data)
            await asyncio.sleep(0.5) # Increased delay to make it easier to see
    except Exception as e:
        print(f"DEBUG: Error in stream: {e}")
    finally:
        print("DEBUG: Connection closed")
        await websocket.close()
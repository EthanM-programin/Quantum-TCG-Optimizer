import torch
import torch.nn as nn
import pandas as pd

# 1. Ingest the Data Pipeline
try:
    meta_df = pd.read_csv("op_meta_data.csv")
except FileNotFoundError:
    print("Error: op_meta_data.csv not found. Did you run dataset_builder.py?")
    exit()

TOTAL_CARDS = len(meta_df)

# 2. Convert DataFrames to PyTorch Tensors for rapid vector math
# This allows us to calculate whole deck stats in a single operation
aggro_stats = torch.tensor(meta_df['Aggro_Value'].values, dtype=torch.float32)
control_stats = torch.tensor(meta_df['Control_Value'].values, dtype=torch.float32)

class HybridExpanderNet(nn.Module):
    def __init__(self, num_qubits=4):
        super().__init__()
        # The Expansion Pipeline: 4 Qubits -> 32 -> 64 -> 104 Cards
        self.network = nn.Sequential(
            nn.Linear(num_qubits, 32),
            nn.ReLU(),
            nn.Linear(32, 64),
            nn.ReLU(),
            nn.Linear(64, TOTAL_CARDS),
            nn.Sigmoid() # Outputs a selection weight (0.0 to 1.0) for every single card
        )

    def forward(self, quantum_state):
        # 1. Cast the incoming PennyLane Double tensor to a PyTorch Float tensor
        quantum_state = quantum_state.float()
        
        # 2. Generate the 104-card deck distribution
        deck_weights = self.network(quantum_state)

        # 3. Vector Math: Multiply our chosen deck weights against the actual CSV stats
        total_aggro = torch.dot(deck_weights, aggro_stats)
        total_control = torch.dot(deck_weights, control_stats)

        # 4. Return the combined power score
        return total_aggro + total_control

# Instantiate the new 104-card judge
referee = HybridExpanderNet()

# Backward compatibility alias for older scripts like hybrid_loop.py
DeckEvaluatorNet = HybridExpanderNet
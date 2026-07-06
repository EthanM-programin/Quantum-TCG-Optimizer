import torch
import torch.optim as optim
import pennylane as qml
import os
import random

# We define the total card pool
TOTAL_CARD_POOL = 104

# Setup Quantum Device
NUM_QUBITS = 4
dev = qml.device("default.qubit", wires=NUM_QUBITS)

@qml.qnode(dev, interface="torch")
def generate_strategy(weights):
    for i in range(NUM_QUBITS):
        qml.RX(weights[i], wires=i)
    for i in range(NUM_QUBITS - 1):
        qml.CNOT(wires=[i, i + 1])
    return [qml.expval(qml.PauliZ(i)) for i in range(NUM_QUBITS)]

def run_arena_battle():
    brain_file = "vegapunk_brain.pth"
    
    if os.path.exists(brain_file):
        print("🧠 Vegapunk Memory Found: Restoring previous quantum states...")
        checkpoint = torch.load(brain_file, weights_only=True)
        angles_A = checkpoint['angles_A'].detach().clone().requires_grad_(True)
        angles_B = checkpoint['angles_B'].detach().clone().requires_grad_(True)
    else:
        print("🧠 Initializing a new blank Vegapunk Brain...")
        angles_A = torch.tensor([0.8, 0.4, 0.1, 0.5], requires_grad=True)
        angles_B = torch.tensor([-0.2, 0.9, -0.6, 0.3], requires_grad=True)

    opt_A = optim.Adam([angles_A], lr=0.1)
    opt_B = optim.Adam([angles_B], lr=0.1)

    for epoch in range(100):
        opt_A.zero_grad()
        opt_B.zero_grad()

        # Generate strategies
        prob_A = (torch.stack(generate_strategy(angles_A)) + 1.0) / 2.0
        prob_B = (torch.stack(generate_strategy(angles_B)) + 1.0) / 2.0
        
        # Simple battle math (Simulating "Power" for now)
        power_A = torch.sum(prob_A) 
        power_B = torch.sum(prob_B)
        
        advantage = (power_A - power_B) * 5.0
        win_prob_A = torch.sigmoid(advantage)

        loss_A = 1.0 - win_prob_A
        loss_B = win_prob_A

        loss_A.backward(retain_graph=True)
        loss_B.backward()

        opt_A.step()
        opt_B.step()

        # DECISION ENGINE: If power > 0.8, trigger an 'AI Move'
        ai_command = None
        if power_A.item() > 0.8:
            ai_command = {"action": "play_card", "target_slot": epoch % 5}

        yield {
            "epoch": epoch + 1,
            "power_a": power_A.item(),
            "power_b": power_B.item(),
            "win_prob_a": win_prob_A.item(),
            "win_prob_b": 1.0 - win_prob_A.item(),
            "ai_command": ai_command
        }

    torch.save({'angles_A': angles_A, 'angles_B': angles_B}, brain_file)

if __name__ == "__main__":
    for data in run_arena_battle():
        if data["epoch"] % 10 == 0:
            cmd = f" | AI Command: {data['ai_command']}" if data['ai_command'] else ""
            print(f"Round {data['epoch']:03d} | Win Prob A: {data['win_prob_a']*100:.1f}%{cmd}")
import pennylane as qml
import torch
from evaluator_net import DeckEvaluatorNet

# 1. Initialize a 4-qubit simulator
dev = qml.device("default.qubit", wires=4)

# 2. Define the starting quantum parameters (angles)
angles = torch.tensor([0.0, 0.0, 0.0, 0.0], requires_grad=True)

@qml.qnode(dev, interface="torch")
def quantum_circuit(params):
    # Standard QML ansatz mapping parameters to quantum states
    for i in range(4):
        qml.RX(params[i], wires=i)
    qml.CNOT(wires=[0, 1])
    qml.CNOT(wires=[2, 3])
    # Return expectation values for each qubit position
    return [qml.expval(qml.PauliZ(i)) for i in range(4)]

# The explicit function arena_loop.py is trying to import
def generate_strategy(params):
    return quantum_circuit(params)

# Legacy support for the original Phase 2 optimization engine if needed
def run_hybrid_optimization():
    # Fast classical evaluation mapping back to our upgraded 104-card net
    import torch.optim as optim
    opt = optim.Adam([angles], lr=0.1)
    
    epoch = 0
    while epoch < 100:
        opt.zero_grad()
        raw_outputs = generate_strategy(angles)
        prob_dist = (torch.stack(raw_outputs) + 1.0) / 2.0
        
        # Evaluate using the upgraded network
        from evaluator_net import referee
        loss = 1.0 - referee(prob_dist)
        
        loss.backward()
        opt.step()
        
        yield {
            "epoch": epoch + 1,
            "loss": loss.item(),
            "angles": [a.item() for a in angles]
        }
        epoch += 1
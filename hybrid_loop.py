import torch
import torch.optim as optim
import pennylane as qml
from evaluator_net import DeckEvaluatorNet

def run_hybrid_optimization():
    print("Initializing Hybrid Quantum-Classical System")

    # 1. Load Classical Judge
    TOTAL_CARD_POOL = 500
    judge = DeckEvaluatorNet(TOTAL_CARD_POOL)
    judge.load_state_dict(torch.load("trained_evaluator.pth", weights_only=True))

    # Critical Step: Freeze the Judge
    # To train the Quantum Circuit, not retrain the AI.
    for param in judge.parameters():
        param.requires_grad = False
    judge.eval()

    # 2. Setup the Quantum Generator
    NUM_QUBITS = 4
    dev = qml.device("default.qubit", wires=NUM_QUBITS)

    # We explicitly tell PennyLane to interface with PyTorch
    @qml.qnode(dev, interface="torch")
    def quantum_deck_generator(weights):
        for i in range(NUM_QUBITS):
            qml.RX(weights[i], wires=i)
        for i in range(NUM_QUBITS - 1):
            qml.CNOT(wires=[i, i + 1])
        return [qml.expval(qml.PauliZ(i)) for i in range(NUM_QUBITS)]
    
    # 3. Hybrid Training Setup
    # Create random starting angles, but tell PyTorch they are trainable variables.
    initial_angles = torch.rand(NUM_QUBITS, requires_grad=True)

    # Use Adam optimizer, but this time it is tuning the Quantum Angles,
    # not AI weights
    optimizer = optim.Adam([initial_angles], lr=0.1)

    print("Commencing Quantum Parameter Optimization\n")

    EPOCHS = 50
    for epoch in range(EPOCHS):
        # Clear out old math
        optimizer.zero_grad()

        # Step A: QUantum Circuit generates raw states (-1.0 to 1.0)
        raw_quantum_state = quantum_deck_generator(initial_angles)

        # Step B: Convert the 4 quantum measurements to a PyTorch tensor
        # and map them to a 0.0 to 1.0 probability range
        q_tensor = torch.stack(raw_quantum_state)
        probabilties = (q_tensor + 1.0) / 2.0

        # Step C: Pad the 4 quantum cards to match the 500-card AI input
        # Put our 4 qubits into the first 4 "Meta" card slots.
        deck_input = torch.zeros(1, TOTAL_CARD_POOL)
        deck_input[0, 0:NUM_QUBITS] = probabilties

        # Step D: AI Judges the Quantum Deck
        synergy_score = judge(deck_input)

        # Step E: Calculate Loss
        # To maximize the score, we minimize the distance to 1.0
        loss = 1.0 - synergy_score
        
        # Step F: Backpropagate through the AI *and* into the Quantum Circuit.
        loss.backward()
        optimizer.step()

        if(epoch + 1) % 5 == 0:
            print(f"Epoch [{epoch+1:02d}/50] | Deck Score: {synergy_score.item():.4f} | Loss: {loss.item():.4f}")

        # Yield the live data every single epoch.
        # No 'return' statement outside the loop.
        yield {
            "epoch": epoch + 1,
            "synergy_score": synergy_score.item(),
            "loss": loss.item(),
            "angles": initial_angles.detach().numpy().tolist()
        }

if __name__ == "__main__":
    # This is now a generator, we'll test it using a loop that prints once.
    for live_data in run_hybrid_optimization():
        # This will print the stream locally in the terminal 50 times
        pass # (We use pass here so it doesn't flood the terminal, since print statement is at Step F)
    print("\nLocal Generator Test Complete...")

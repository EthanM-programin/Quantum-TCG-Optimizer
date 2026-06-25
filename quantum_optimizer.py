import pennylane as qml
from pennylane import numpy as np

print("Initializing Quantum Subsystem")

# 1. Define the Quantum Device
# Creating a local quantum simulator with 4 qubits (wires).
# Each qubit represents a single card in our micro-pool: 0 means
# 'out of deck', 1 means 'in deck'.
NUM_QUBITS = 4
dev = qml.device("default.qubit", wires=NUM_QUBITS)

# 2. Define the Quantum Node (QNode)
# The @qml.qnode decorator tells Python that the function below runs
# on the quantum device.
@qml.qnode(dev)
def quantum_deck_generator(weights):
    """
    This circuit takes physical rotation angles (weights) and applies 
    them to the qubits.
    """
    # Step A: Apply an RX rotation to each qubit based on the weights.
    # This physically rotates the qubit's probability state.
    for i in range(NUM_QUBITS):
        qml.RX(weights[i], wires=i)

    # Step B: Entanglement
    # CNOT gates to entangle the qubits so they influence each other.
    # (e.g., If Card 1 is in the deck, it changes the probability of
    # Card 2 being in the deck).
    for i in range(NUM_QUBITS - 1):
        qml.CNOT(wires=[i, i + 1])
    
    # Step C: Measurement
    # We measure the PauliZ expectation value of each qubit.
    # This collapses the superposition and gives us a probability
    # between -1.0 and 1.0
    return [qml.expval(qml.PauliZ(i)) for i in range(NUM_QUBITS)]

if __name__ == "__main__":
    # Let's test the circuit with random rotation angles.
    # Generate 4 random angles between 0 and 2*pi (Full circle)
    initial_weights = np.random.uniform(low=0, high=2 * np.pi, size=NUM_QUBITS)

    print(f"Initial Random Angles (Weights): \n{initial_weights}")

    # Run the quantum circuit
    quantum_state = quantum_deck_generator(initial_weights)

    print(f"\nMeasured Quantum State (Probabilities): \n{quantum_state}")
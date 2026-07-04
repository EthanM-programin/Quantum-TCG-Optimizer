import torch
import torch.optim as optim
import pennylane as qml
from evaluator_net import DeckEvaluatorNet

def run_arena_battle():
    # 1. Load Classical Judge (Ref)
    TOTAL_CARD_POOL = 500
    referee = DeckEvaluatorNet(TOTAL_CARD_POOL)
    referee.load_state_dict(torch.load("trained_evaluator.pth", weights_only=True))
    
    # Freeze referee so it judges fairly without changing its parameters
    for param in referee.parameters():
        param.requires_grad = False
    referee.eval()

    # 2. Setup Quantum Battlefield
    NUM_QUBITS = 4
    dev = qml.device("default.qubit", wires=NUM_QUBITS)

    @qml.qnode(dev, interface="torch")
    def generate_strategy(weights):
        for i in range(NUM_QUBITS):
            qml.RX(weights[i], wires=i)
        for i in range(NUM_QUBITS - 1):
            qml.CNOT(wires=[i, i + 1])
        return [qml.expval(qml.PauliZ(i)) for i in range(NUM_QUBITS)]
    
    # 3. Create Two Competing Agents
    # Agent A (Red Aggro)
    angles_A = torch.rand(NUM_QUBITS, requires_grad=True)
    opt_A = optim.Adam([angles_A], lr=0.05)

    # Agent B (Blue Control)
    angles_B = torch.rand(NUM_QUBITS, requires_grad=True)
    opt_B = optim.Adam([angles_B], lr=0.05)

    EPOCHS = 100 # Run 100 round of battles

    for epoch in range(EPOCHS):
        opt_A.zero_grad()
        opt_B.zero_grad()

        # Agent A's Turn
        raw_A = generate_strategy(angles_A)
        prob_A = (torch.stack(raw_A) + 1.0) / 2.0
        deck_A = torch.zeros(1, TOTAL_CARD_POOL)
        deck_A[0, 0:NUM_QUBITS] = prob_A
        power_A = referee(deck_A) # Referee scores Agent A

        # Agent B's Turn
        raw_B = generate_strategy(angles_B)
        prob_B = (torch.stack(raw_B) + 1.0) / 2.0
        deck_B = torch.zeros(1, TOTAL_CARD_POOL)
        deck_B[0, 0:NUM_QUBITS] = prob_B
        power_B = referee(deck_B) # Referee score Agent B

        # Battle Math
        # Base Power Difference
        base_advantage = (power_A - power_B) * 5.0

        # Agent B (Control) gets bonus
        counter_bonus = torch.sum(torch.abs(prob_A - prob_B)) * 2.0

        # Agent A relies on raw power
        advantage = base_advantage - counter_bonus

        # Sigmoid converts the raw advantage into clean 0% to 100% win rate
        win_prob_A = torch.sigmoid(advantage)
        win_prob_B = 1.0 - win_prob_A
        
        # Agent A wants win_prob_A to be 1.0 (100%)
        loss_A = 1.0 - win_prob_A
        # Agent B want win_prob_A to be 0.0 (0%)
        loss_B = win_prob_A

        # Both agents learn from exchange
        # retain_graph=True is req bc they share same  battle math
        loss_A.backward(inputs=[angles_A], retain_graph=True)
        loss_B.backward(inputs=[angles_B])

        opt_A.step()
        opt_B.step()

        # Yield live battle telemetry to broadcaster
        yield {
            "epoch" : epoch + 1,
            "power_a" : power_A.item(),
            "power_b" : power_B.item(),
            "win_prob_a" : win_prob_A.item(),
            "win_prob_b" : win_prob_B.item(),
        }

if __name__ == "__main__":
    print("Testing Quantum Arean Locally...\n")
    for data in run_arena_battle():
        if data["epoch"] % 10 == 0: # Print every 10th round
            print(f"Round {data['epoch']:03d} | Win Prob A (Aggro): {data['win_prob_a']*100:.1f}% | Win Prob B (Control): {data['win_prob_b']*100:.1f}%")
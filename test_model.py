import torch
from evaluator_net import DeckEvaluatorNet

def run_test():
    TOTAL_CARD_POOL = 500

    # 1. Initialize the blank network
    model = DeckEvaluatorNet(TOTAL_CARD_POOL)

    # 2. Load the trained 'Brain' into the network
    # weights_only=True is a security best practice in modern PyTorch
    model.load_state_dict(torch.load("trained_evaluator.pth", weights_only=True))

    # 3. Lock model in 'Evaluation Mode' so it knows we aren't training anymore
    model.eval()
    print("AI Judge Loaded Successfully.\n")

    # Contructing the Decks
    
    # Deck A: The "Meta" Deck
    # We fill the first 10 slots (indices 0 to 9) which the AI learned are 'good'
    meta_deck = torch.zeros(1, TOTAL_CARD_POOL)
    meta_deck[0, 0:10] = 1.0

    # Deck B: The "Junk" Deck
    # We leave the first 10 slots completely empty and fill random slots instead
    junk_deck = torch.zeros(1, TOTAL_CARD_POOL)
    junk_deck[0, 150:160] = 1.0

    # Asking AI to Judge
    # torch.no_grad() tells PyTorch to save memory by not calculating gradients
    with torch.no_grad():
        meta_score = model(meta_deck).item()
        junk_score = model(junk_deck).item()

    # Results
    print(f"Deck A (Meta Cards): {meta_score:.4f} Predicted Win Rate")
    print(f"Deck B (Junk Cards): {junk_score:.4f} Predicted Win Rate")

    if meta_score > junk_score:
        print("\nSUCCESS: The AI successfully identified the stronger deck.")
    else:
        print("\nUh Oh: The AI is confused.")

if __name__ == "__main__":
    run_test()
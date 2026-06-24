import torch
import torch.nn as nn
import torch.optim as optim
from evaluator_net import DeckEvaluatorNet

def generate_dummy_data(num_samples, pool_size):
    """
    Simulates a dataset of decks and their 'actual' win rates.
    In a final implementation, this data would come from real One Piece TCG match loges.
    """
    print(f"Generating {num_samples} random decks for training...")
    # Generate random arrays to represent deck lists
    X = torch.rand(num_samples, pool_size)

    # Generate a fake 'Target Synergy Score' for each deck
    # Use a simple formula so the AI has a pattern to learn
    y = torch.sum(X[:, :10], dim=1, keepdim=True) / 10.0

    return X, y

def train_model():
    TOTAL_CARD_POOL = 500 
    EPOCHS = 100 # How many times the AI will review the entire dataset

    # 1. Initialize the AI
    model = DeckEvaluatorNet(TOTAL_CARD_POOL)

    # 2. Define the 'Grader' (Loss Function) and the 'Tutor' (Optimizer)
    # MSE (Mean Squared Error) calculates exactly how far off the AI's guess was
    criterion = nn.MSELoss()
    # Adam is an advanced optimization algorithm that adjusts the AI's weights
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    # 3. Get the Study Material (Training Data)
    X_train, y_train = generate_dummy_data(1000, TOTAL_CARD_POOL)

    print("\nStarting Training Loop...")
    for epoch in range(EPOCHS):
        # Step 1: Clear out old math from previous epoch
        optimizer.zero_grad()

        # Step 2: AI makes it guesses for all 1000 decks
        predictions = model(X_train)

        # Step 3: Grader calculates how wrong the guesses were
        loss = criterion(predictions, y_train)

        # Step 4: AI reviews its mistakes (Backpropagation)
        loss.backward()

        # Step 5: Tutor adjusts the internal weights to do better next time
        optimizer.step()

        # Print update every 10 loops
        if (epoch + 1) % 10 == 0:
            print(f"Epoch [{epoch+1}/{EPOCHS}] | Error (Loss): {loss.item():.4f}")

    print("Training Complete!")

    # Save the 'Brain' to your drive so we don't need to retrain.
    torch.save(model.state_dict(), "trained_evaluator.pth")
    print("Model saved as 'trained_evaluator.ph'")

if __name__ == "__main__":
    train_model()
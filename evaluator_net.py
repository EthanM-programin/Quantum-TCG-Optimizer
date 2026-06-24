import torch
import torch.nn as nn

class DeckEvaluatorNet(nn.Module):
    def __init__(self, card_pool_size):
        """
        Initializes the layers of the neural network.
        card_pool_size: The total number of unique cards in the game.
        """
        super(DeckEvaluatorNet, self).__init__()
        
        # Layer 1: Input Layer, takes the deck array and expands it.
        self.layer1 = nn.Linear(card_pool_size, 256)
        self.relu1 = nn.ReLU() # Activation function to allow learning of complex patterns

        # Layer 2: Hidden Layer, this is where "synergy" is calculated.
        self.layer2 = nn.Linear(256, 128)
        self.relu2 = nn.ReLU()

        # Layer 3: Output Layer, condenses the math down to a single score.
        self.output_layer = nn.Linear(128,1)
        self.sigmoid = nn.Sigmoid() # Compresses final number between 0.0 and 1.0

    def forward(self, x):
        """
        Defines how the data flows through the network from start to finish.
        """
        x = self.layer1(x)
        x = self.relu1(x)

        x = self.layer2(x)
        x = self.relu2(x)

        x = self.output_layer(x)
        x = self.sigmoid(x)

        return x
    
# Testing Architecture
if __name__ == "__main__":
    # Pretend current One Piece card database has 500 unique cards
    TOTAL_CARD_POOL = 500

    # Start the network
    model = DeckEvaluatorNet(TOTAL_CARD_POOL)
    print("Neural Network Architecture Built Successfully.")
    print(model)
    
    # Simulate a legal 50-card deck passing through network
    # Create random PyTorch Tensor (a mathematical matrix) to represent the deck
    dummy_deck_tensor = torch.rand(1, TOTAL_CARD_POOL)

    # Run the forward pass.
    predicted_win_rate = model(dummy_deck_tensor)

    print(f"\nUntrained Test Deck Synergy Score: {predicted_win_rate.item():.4f}")
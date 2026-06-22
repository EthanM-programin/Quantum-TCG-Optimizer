import json
import pandas as pd

def load_card_data(filepath):
    """Loads the JSON card data into a Pandas DataFrame for easy sorting/filtering."""
    with open(filepath, 'r') as file:
        data = json.load(file)
    df = pd.DataFrame(data)
    print("Successfully loaded card database.")
    print(df[['id', 'name', 'type', 'colors']])
    return df

def validate_deck(deck_list, leader_id, card_database):
    """
    Checks basic One Piece rules:
    1. Deck must have exactly 50 cards (excluding the Leader).
    2. No more than 4 copies of a single card ID.
    3. Card colors must match the Leader's colors.
    """

    # Find Leader in the database
    leader_row = card_database[card_database['id'] == leader_id]
    if leader_row.empty:
        print(f"INVALID DECK: Leader {leader_id} not found.")
        return False
    
    # Extract leader colors and convert to a Python 'set' for easy comparison
    leader_colors = set(leader_row.iloc[0]['colors'])
    print(f"\nEvaluating deck for Leader: {leader_row.iloc[0]['name']} (Colors: {leader_colors})")

    # Rule 1: Check Deck Size
    total_cards = sum(deck_list.values())
    if total_cards != 50:
        print(f"INVALID DECK: Contains {total_cards} cards. Must be exactly 50.")
        return False
    
    # Rule 2 & 3: Check 4-Copy Limit and Color
    for card_id, count in deck_list.items():
        if count > 4:
            print(f"INVALID DECK: Too many copies of {card_id} ({count}/4).")
            return False
        
        card_row = card_database[card_database['id'] == card_id]
        if not card_row.empty:
            card_colors = set(card_row.iloc[0]['colors'])
            # Check if the card's colors are a subset of the leader's
            if not card_colors.issubset(leader_colors):
                print(f"INVALID DECK: Card {card_id} {card_colors} does not match Leader colors {leader_colors}.")
                return False
        
    print("DECK IS LEGAL: Ready for AI evaluation.")
    return True

# Testing Code
if __name__ == "__main__":
    # Load mock database
    db = load_card_data('mock_cards.json')

    print("\nRunning Deck Validation Test:")
    # Simulate a deck dictionary where the key is the card ID and the
    # value is the quantity.
    test_deck = {
        "OP01-025": 4,  # 4x Zoro Character
        "OP01-016": 46  # 46x Nami (Illegal due to 4-copy rule, but adds to 50)
    }

    # Run validation
    validate_deck(test_deck, "OP01-001", db)
import pandas as pd
import random

def build_card_database():
    print("Initializing Data Expansion Pipeline...")
    
    # Archetypes and traits for synergy mapping
    colors = ["Red", "Blue", "Green", "Purple"]
    types = ["Character", "Event", "Stage"]
    traits = ["Straw Hat Crew", "Navy", "Supernovas", "Animal Kingdom"]

    cards = []
    
    # Generate Leaders
    for color in colors:
        cards.append({
            "Card_ID": f"OP-{color[0]}-L",
            "Name": f"{color} Leader",
            "Color": color,
            "Type": "Leader",
            "Cost": 0,
            "Power": 5000,
            "Trait": random.choice(traits),
            "Aggro_Value": round(random.uniform(0.1, 0.9), 2),
            "Control_Value": round(random.uniform(0.1, 0.9), 2)
        })

    # Generate a pool of 100 playable cards
    for i in range(1, 101):
        color = random.choice(colors)
        card_type = random.choices(types, weights=[0.7, 0.2, 0.1])[0] # 70% characters
        
        # Balance Cost and Power (higher cost = higher power generally)
        cost = random.randint(1, 8)
        if card_type == "Character":
            power = cost * 1000 + random.randint(-1000, 2000)
            power = max(1000, min(power, 10000)) # Clamp between 1k and 10k
        else:
            power = 0 # Events/Stages don't have power

        # Assign hidden AI weighting values for the neural network to learn
        aggro_val = round(power / 10000 + random.uniform(0, 0.3), 2) if color == "Red" else random.uniform(0, 0.5)
        control_val = round(cost / 8 + random.uniform(0, 0.3), 2) if color == "Blue" else random.uniform(0, 0.5)

        cards.append({
            "Card_ID": f"OP-01-{i:03d}",
            "Name": f"Card {i}",
            "Color": color,
            "Type": card_type,
            "Cost": cost,
            "Power": power,
            "Trait": random.choice(traits),
            "Aggro_Value": min(1.0, aggro_val),
            "Control_Value": min(1.0, control_val)
        })

    # Convert to a Pandas DataFrame
    df = pd.DataFrame(cards)
    
    # Save to a CSV file that our AI can ingest
    csv_filename = "op_meta_data.csv"
    df.to_csv(csv_filename, index=False)
    
    print(f"Success! Generated {len(df)} cards and saved to {csv_filename}")
    print("\nSample Data:")
    print(df.head())

if __name__ == "__main__":
    build_card_database()
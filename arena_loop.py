import json
import random
import os
import time

# Master Database of OP-16/OP-14 Costs
CARD_COSTS = {
    "OP16-079": 0,  # Leader
    "OP16-081": 2,  # Otama
    "OP16-082": 4,  # Kin'emon
    "OP16-084": 5,  # Momonosuke (Character)
    "OP16-085": 9,  # Momonosuke (9-Cost)
    "OP16-086": 8,  # Sanji
    "OP16-087": 2,  # Shinobu
    "OP16-088": 2,  # Ushimaru
    "OP16-091": 1,  # Nami
    "OP16-092": 1,  # Nico Robin
    "OP16-095": 2,  # Luffy
    "OP16-096": 8,  # Yamato (8-Cost)
    "OP16-097": 8,  # Yamato (8-Cost Unblockable)
    "OP16-098": 6,  # Yamato (6-Cost)
    "OP16-099": 1,  # I've Come Here... (Event)
    "OP14-096": 1   # Ground Death (Event)
}

CARD_TYPES = {
    "OP14-096": "Event", 
    "OP16-099": "Event"
}

def load_deck(filepath="meta_decks.json"):
    if not os.path.exists(filepath):
        return {"leader": "OP16-079", "main_deck": []}
    with open(filepath, "r") as f:
        return json.load(f)

def create_player_state(deck_data):
    deck = []
    leader_raw = deck_data.get("leader", "OP16-079")
    leader_id = leader_raw.split("(")[1].replace(")", "") if "(" in leader_raw else leader_raw.strip()
    
    for card in deck_data.get("main_deck", []):
        clean_name = card["name"].strip()
        if clean_name != leader_id: 
            deck.extend([clean_name] * card["count"])
            
    random.shuffle(deck)
    
    return {
        "leader": leader_id,
        "deck": deck,
        "hand": [deck.pop() for _ in range(5)] if len(deck) >= 5 else [],
        "field": [],
        "trash": [], 
        "active_don": 0,
        "rested_don": 0,
        "don_deck": 10,
        "life": 5
    }

def run_arena_battle():
    deck_data = load_deck()
    player_a = create_player_state(deck_data)
    player_b = create_player_state(deck_data)

    def build_state(epoch, announcement, action_data=None):
        return {
            "epoch": epoch,
            "announcement": announcement,
            "ai_command": action_data,
            "board_state": {
                "player_a": {"leader": player_a["leader"], "life": player_a["life"], "active_don": player_a["active_don"], "rested_don": player_a["rested_don"], "don_deck": player_a["don_deck"], "hand": player_a["hand"], "deck_size": len(player_a["deck"]), "field_cards": player_a["field"], "trash": player_a["trash"]},
                "player_b": {"leader": player_b["leader"], "life": player_b["life"], "active_don": player_b["active_don"], "rested_don": player_b["rested_don"], "don_deck": player_b["don_deck"], "hand": player_b["hand"], "deck_size": len(player_b["deck"]), "field_cards": player_b["field"], "trash": player_b["trash"]}
            }
        }

    yield build_state(0, "Game Start...")
    
    epoch = 0
    current_turn = "A" if random.random() > 0.5 else "B"
    is_very_first_turn = True

    while epoch < 100:
        epoch += 1
        active_player = player_a if current_turn == "A" else player_b
        
        # 1. Refresh
        active_player["active_don"] += active_player["rested_don"]
        active_player["rested_don"] = 0

        # 2. DON & Draw
        if is_very_first_turn:
            if active_player["don_deck"] >= 1:
                active_player["don_deck"] -= 1
                active_player["active_don"] += 1
            is_very_first_turn = False
        else:
            # Rule: Immediate Loss on Deck Out
            if len(active_player["deck"]) == 0:
                yield build_state(epoch, f"GAME OVER: Player {current_turn} has no cards left in deck!")
                time.sleep(5)
                break
            
            don_to_add = min(2, active_player["don_deck"])
            active_player["don_deck"] -= don_to_add
            active_player["active_don"] += don_to_add
            active_player["hand"].append(active_player["deck"].pop(0))

        yield build_state(epoch, f"Player {current_turn}'s Turn")
        time.sleep(1.0)

        # 3. GREEDY PLAY LOOP (Stays in loop until no affordable cards remain)
        while True:
            playable_cards = []
            for c in active_player["hand"]:
                clean_id = c.strip()
                cost = CARD_COSTS.get(clean_id)
                
                # Safety check
                if cost is None:
                    print(f"⚠️ VEGAPUNK WARNING: {clean_id} not in CARD_COSTS! Defaulting to 99.")
                    cost = 99
                    
                if cost <= active_player["active_don"]:
                    playable_cards.append({"id": clean_id, "cost": cost})
            
            if not playable_cards:
                break
                
            # Play highest cost first (Greedy Strategy)
            playable_cards.sort(key=lambda x: x["cost"], reverse=True)
            target = playable_cards[0]
            card_id = target["id"]
            cost = target["cost"]
            card_type = CARD_TYPES.get(card_id, "Character")
            
            active_player["active_don"] -= cost
            active_player["rested_don"] += cost
            active_player["hand"].remove(card_id)
            
            if card_type == "Character":
                if len(active_player["field"]) >= 5:
                    # Field Full: Trash the first character (oldest) to make room
                    trashed = active_player["field"].pop(0) 
                    active_player["trash"].append(trashed)
                    active_player["field"].append(card_id)
                    yield build_state(epoch, f"Player {current_turn} replaces {trashed} with {card_id} ({cost} DON!!)")
                else:
                    active_player["field"].append(card_id)
                    yield build_state(epoch, f"Player {current_turn} plays {card_id} for {cost} DON!!")
            else:
                active_player["trash"].append(card_id)
                yield build_state(epoch, f"Player {current_turn} uses Event {card_id} for {cost} DON!!")
            
            time.sleep(1.0)

        current_turn = "B" if current_turn == "A" else "A"
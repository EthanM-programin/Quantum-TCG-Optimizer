import json
import random
import os
import time

# Master Database of OP-16/OP-14 Costs & Power
CARD_COSTS = {
    "OP16-079": 0,  "OP16-081": 2,  "OP16-082": 4,  "OP16-084": 5,
    "OP16-085": 9,  "OP16-086": 8,  "OP16-087": 2,  "OP16-088": 2,
    "OP16-091": 1,  "OP16-092": 1,  "OP16-095": 2,  "OP16-096": 8,
    "OP16-097": 8,  "OP16-098": 6,  "OP16-099": 1,  "OP14-096": 1
}

CARD_POWER = {
    "OP16-079": 5000, # Leader
    "OP16-081": 2000, # Otama
    "OP16-082": 5000, # Kin'emon
    "OP16-084": 6000, # Momonosuke (Character)
    "OP16-085": 9000, # Momonosuke (9-Cost)
    "OP16-086": 8000, # Sanji
    "OP16-087": 1000, # Shinobu
    "OP16-088": 2000, # Ushimaru
    "OP16-091": 2000, # Nami
    "OP16-092": 2000, # Nico Robin
    "OP16-095": 5000, # Luffy
    "OP16-096": 8000, # Yamato (8-Cost)
    "OP16-097": 8000, # Yamato (8-Cost Unblockable)
    "OP16-098": 6000, # Yamato (6-Cost)
    "OP16-099": 0,    # Event
    "OP14-096": 0     # Event
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
            
    # ENFORCE LEGALITY: Fill to exactly 50 cards if the file is short
    if len(deck) < 50:
        filler_pool = [k for k, v in CARD_TYPES.items() if v != "Event"]
        if not filler_pool: filler_pool = list(CARD_COSTS.keys())[1:] # Fallback
        while len(deck) < 50:
            deck.append(random.choice(filler_pool))
            
    # Trim if it somehow exceeds 50
    deck = deck[:50]
    random.shuffle(deck)
    
    # CONSERVATION OF MASS: Hand and Life pop actual cards from the deck
    hand = [deck.pop(0) for _ in range(5)]
    life_cards = [deck.pop(0) for _ in range(5)]
    
    return {
        "leader": leader_id,
        "leader_rested": False,
        "deck": deck,
        "hand": hand,
        "life_cards": life_cards,
        "field": [], # Holds dicts: {"id": "OP16-xxx", "rested": False, "sickness": True}
        "trash": [], 
        "active_don": 0,
        "rested_don": 0,
        "don_deck": 10
    }

def run_arena_battle():
    deck_data = load_deck()
    player_a = create_player_state(deck_data)
    player_b = create_player_state(deck_data)

    def build_state(epoch, announcement, action_data=None):
        # We extract just the "id" from the field dicts so the React frontend doesn't break!
        field_a_ids = [c["id"] for c in player_a["field"]]
        field_b_ids = [c["id"] for c in player_b["field"]]

        return {
            "epoch": epoch,
            "announcement": announcement,
            "ai_command": action_data,
            "board_state": {
                "player_a": {"leader": player_a["leader"], "life": len(player_a["life_cards"]), "active_don": player_a["active_don"], "rested_don": player_a["rested_don"], "don_deck": player_a["don_deck"], "hand": player_a["hand"], "deck_size": len(player_a["deck"]), "field_cards": field_a_ids, "trash": player_a["trash"]},
                "player_b": {"leader": player_b["leader"], "life": len(player_b["life_cards"]), "active_don": player_b["active_don"], "rested_don": player_b["rested_don"], "don_deck": player_b["don_deck"], "hand": player_b["hand"], "deck_size": len(player_b["deck"]), "field_cards": field_b_ids, "trash": player_b["trash"]}
            }
        }

    yield build_state(0, "Game Start! Both decks at 40.")
    time.sleep(1.5)
    
    epoch = 0
    current_turn = "A" if random.random() > 0.5 else "B"

    while epoch < 100:
        epoch += 1
        active_player = player_a if current_turn == "A" else player_b
        opponent = player_b if current_turn == "A" else player_a
        
        # 1. Refresh Phase
        active_player["active_don"] += active_player["rested_don"]
        active_player["rested_don"] = 0
        active_player["leader_rested"] = False
        for char in active_player["field"]:
            char["rested"] = False
            char["sickness"] = False

        # 2. DON & Draw Phase
        if epoch == 1:
            # The player going first skips their draw and gets only 1 DON!!
            if active_player["don_deck"] >= 1:
                active_player["don_deck"] -= 1
                active_player["active_don"] += 1
        else:
            if len(active_player["deck"]) == 0:
                yield build_state(epoch, f"GAME OVER: Player {current_turn} Deck Out!")
                time.sleep(5)
                break
            
            don_to_add = min(2, active_player["don_deck"])
            active_player["don_deck"] -= don_to_add
            active_player["active_don"] += don_to_add
            active_player["hand"].append(active_player["deck"].pop(0))

        yield build_state(epoch, f"Player {current_turn}'s Turn")
        time.sleep(1.0)

        # 3. MAIN PHASE
        while True:
            playable_cards = []
            for c in active_player["hand"]:
                clean_id = c.strip()
                cost = CARD_COSTS.get(clean_id, 99)
                if cost <= active_player["active_don"]:
                    playable_cards.append({"id": clean_id, "cost": cost})
            
            if not playable_cards:
                break
                
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
                    trashed = active_player["field"].pop(0) 
                    active_player["trash"].append(trashed["id"])
                    active_player["field"].append({"id": card_id, "rested": False, "sickness": True})
                    yield build_state(epoch, f"Player {current_turn} replaces {trashed['id']} with {card_id}")
                else:
                    active_player["field"].append({"id": card_id, "rested": False, "sickness": True})
                    yield build_state(epoch, f"Player {current_turn} plays {card_id}!")
            else:
                active_player["trash"].append(card_id)
                yield build_state(epoch, f"Player {current_turn} uses Event {card_id}!")
            
            time.sleep(1.0)

        # 4. COMBAT Phase
        # Official Rules: Neither player can attack on their very first turn (Epoch 1 and Epoch 2)
        if epoch > 2:
            
            # A. Leader Attack
            if not active_player["leader_rested"]:
                active_player["leader_rested"] = True
                attacker_power = CARD_POWER.get(active_player["leader"], 5000)
                defender_power = CARD_POWER.get(opponent["leader"], 5000)
                
                if attacker_power >= defender_power:
                    if len(opponent["life_cards"]) > 0:
                        lost_life = opponent["life_cards"].pop(0)
                        opponent["hand"].append(lost_life) # Life goes to hand!
                        yield build_state(epoch, f"Leader hits! Life drops to {len(opponent['life_cards'])}!")
                        time.sleep(1.0)
                    else:
                        yield build_state(epoch, f"GAME OVER: Player {current_turn} wins via Life!")
                        time.sleep(5)
                        return # End the simulation
                else:
                    yield build_state(epoch, f"Leader attacks for {attacker_power}! Blocked!")
                    time.sleep(1.0)

            # B. Character Attacks
            for char in active_player["field"]:
                if not char["rested"] and not char["sickness"]:
                    char["rested"] = True
                    attacker_power = CARD_POWER.get(char["id"], 0)
                    defender_power = CARD_POWER.get(opponent["leader"], 5000)

                    if attacker_power >= defender_power:
                        if len(opponent["life_cards"]) > 0:
                            lost_life = opponent["life_cards"].pop(0)
                            opponent["hand"].append(lost_life) # Life goes to hand!
                            yield build_state(epoch, f"{char['id']} hits! Life drops to {len(opponent['life_cards'])}!")
                            time.sleep(1.0)
                        else:
                            yield build_state(epoch, f"GAME OVER: Player {current_turn} wins via Life!")
                            time.sleep(5)
                            return # End the simulation
                    else:
                        yield build_state(epoch, f"{char['id']} attacks for {attacker_power}! Blocked!")
                        time.sleep(1.0)

        current_turn = "B" if current_turn == "A" else "A"
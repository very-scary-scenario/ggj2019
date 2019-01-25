'''Some pseudocode for the functionality around matching characters to homes.

Assumptions:

A `character` has `requirements`, `desires`, `tastes`, and a `budget`.
 * `requirements` is a sequence containing strings representing what is required,
   for example "kitchen", "toilet"
 * `desire` is a sequence containing two-element sequences: the first element
   is a string representing the target of the desire, for example, "bedroom",
   and the second is a string representing the desired trait, for example,
   "large".
 * `taste` is a sequence containing strings representing things the `character`
   likes; for example, "blue", or "gothic".
 * `budget` is a number representing how much money the `character` has 
   available to spend.

A `home` has `rooms` and a `price`.
 * `rooms` is a dictionary, in which the key is the room type, and the value is
   a `room`
 * `price` is a number representing the cost of acquiring the property.

A `room` has `appeal`, `decor`, `functions`, `furniture`, `traits`, and `type`.
 * `appeal` is a string common to all rooms of the same type, and indicates
   a character `taste` that the room type would appeal to. For example, a 
   "dungeon" would have "gothic" appeal.
 * `decor` is specific to a particular instance and indicates how the `room` is
   decorated. For example, "blue".
 * `functions` is a sequence containing two-element sequences: the first element
   is a string representing a function that the room is able to fulfil, and the
   second is a number between 0 and 1 indicating how well the room is able to 
   fulfil that function. For example, a "kitchen" would fulfil the function
   "kitchen" with score 1, but may also fulfil the function of "bathroom"
   with score 0.1, since the drainage in principle allows the `character` to
   wash their face there.
 * `furniture` is a sequence containing `item`s of furniture.
 * `traits` is a sequence containing strings indicating traits that the 
   `room` could be described as. For example "large", "small".
 * `type` is a string describing the type of room. For example, "kitchen".

An `item` of furniture has `appeal`, `decor`, and `functions`. These are the
same as the equivalent members of `room`.
'''

def rank(score):
    '''Calculates the descriptive rank for a particular numerical score'''
    
    ranks = sorted(
        ((50, 'C'),
         (67, 'B'),
         (77, 'A'),
         (84, 'AA'),
         (88, 'AAA'),
         (92, 'AAAA'),
         (94, 'AAAA+')
         (95, 'ASS'),
         (98, 'SSS'),
         (100, 'SSSSSSS+++'),
         (float('inf'), 'GRIDMAN'))
    )
    for threshold, rank in ranks:
        if score < threshold:
            return rank
    else:
        return ranks[-1][-1]


def meets_requirement(requirement, thing):
    '''Returns a number betweeen 0 and 1 indicating how well a `thing` 
    is able to meet a `requirement`.'''

    return thing.functions.get(requirement, 0)


def requirements_compat(character, home):
    '''Returns a number between 0 and 1 indicating how much `home` meets
    `character`'s basic requirements.'''

    total_compatibility = 0
    for requirement in character.requirements:
        if requirement in home.rooms:
            total_compatibility += 1
            continue

        best_score = 0
        for room in home.rooms.values():
            best_score = max(best_score, meets_requirement(requirement, room))
            for item in room.furniture:
                best_score = max(best_score,
                                 meets_requirement(requirement, item))
        total_compatibility += best_score
        
    return total_compatibility / len(character.requirements)


def desire_compat(character, home):
    '''Returns a number between 0 and 1 indicating how much `home` fulfils
    `character`'s desires for their home.'''

    total_compatibility = 0
    for desire_target, desired_trait in character.desires:
        if desire_target in home.rooms:
            if desired_trait in home.rooms[desire_target].traits:
                total_compatibility += 1

    return total_compatibility / len(character.desires)


def taste_compat(character, home):
    '''Returns a number between 0 and 1 indicating how much `home` appeals to
    `character`'s tastes.'''

    total_compatibility = 0
    for room in home.rooms.values():
        if room.decor in character.tastes or room.appeal in character.tastes:
            total_compatibility += 1
        else:
            for item in room.furniture:
                if (item.decor in character.tastes or
                        item.appeal in character.tastes):
                    total_compatibility += 1
                    break
    return total_compatibility / len(home.rooms)


def price_compat(character, home):
    '''Returns a negative weight if the home is over budget; returns a 
    small positive weight if the house is over budget'''

    negative_weighting = -1
    positive_weighting = 0.1

    under_budget_ratio = (character.budget - home.price) / character.budget

    if under_budget_ratio > 0:
        return positive_weighting * under_budget_ratio
    else:
        return negative_weighting * under_budget_ratio
    

def compatibility_score(character, home):
    '''Returns a number between 0 and 101 indicating how well a `home` meets
    all of a `character`'s needs and wants.'''
    
    compatibility_weighting = 50
    desire_weighting = 25
    taste_weighting = 25
    price_weighting = 10
    
    return (
        requirements_weighting * requirements_compat(character, home) +
        desire_weighting * desire_compat(character, home) +
        taste_weighting * taste_compat(character, home) +
        price_weighting * price_compat(character, home)
    )

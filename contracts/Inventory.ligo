// Errors

// ILLEGAL_SENDER_ORIGINATOR: Only the originator may invoke this entrypoint
// ILLEGAL_SENDER_OWNER: Only the owner may invoke this entrypoint
// INVENTORY_LOCKED: Only when the inventory is in possession of the originator can it be altered, otherwise it's locked
// ITEM_ID_DOESNT_EXIST: No item exists at this ID, please assign an item first


//item_data : données de l'item
type item_data is record [
    data: map (string, string);
]

//items : map ===> key : instance de l'item - value : map item_data
// map regroupant toutes les instances d'un même item (id similaire) avec comme index son numéro d'instance
type item_instance record [
    items : map(nat, item_data)
]

// STORAGE -> contient un tableau d'item selon leur id
// exemple : toutes les cartes CR7 seront enregistrées dans la map item_instance stockée dans la big_map storage, avec le même index qui correspond ä l'id de l'item
type storage is record [
    //inventory : big_map ===> key : id de l'item - value : map items
    inventory: big_map (nat, item_instance);
]

type parameter is
    Assign_item of nat

type return is list (operation) * storage;

const empty_item_data: item_data = record [
    data = (map []: map (string, string));
];

function assign (const id: nat; const instanceNumber: nat; const itemData: item_data): return is
    block {

        //SI le storage contient déjà une instance avec l'id envoyé en paramètres,

                // on vérifie que l'instance n'existe pas déjà dans la map item_instance du storage, si oui, on renvoie une erreur ?

                // on enregistre l'instance dans la map item_instance avec comme index instanceNumber

        //SI le storage ne contient pas d'instance avec l'id envoyé en paranètres,

                // on crée une nouvelle map avec l'id comme index 

                // on ajoute l'instance dans la nouvelle map crée avec comme index instanceNumber
    } with ((nil: list (operation)), storage)

function main (const action : parameter; const storage : storage): return is case action of
        Assign_item (i) -> assign(i, storage)
    end
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
type item_instance is map(nat, item_data)

// STORAGE -> contient un tableau d'item selon leur id
// exemple : toutes les cartes CR7 seront enregistrées dans la map item_instance stockée dans la big_map storage, avec le même index qui correspond ä l'id de l'item
type inventory is record [
    //inventory : big_map ===> key : id de l'item - value : map items
    store: big_map (nat, item_instance);
]

type parameter is record [
    item_id: nat;
    instance_number: nat;
    data: item_data;
]
type return is list (operation) * inventory;

//paramètres d'une fonction : 2 -> 1 paramètre et un storage
function assign (const params: parameter; const storage: inventory): return is
    block {
        const instances_map: option (item_instance) = storage.store[params.item_id];
        case instances_map of
            None -> block {
                const new_instances_map : item_instance = map [params.instance_number -> params.data];
                storage.store := Big_map.add(params.item_id, new_instances_map, storage.store)
            }
            | Some(im) -> block {
                im := Map.add(params.instance_number, params.data, im);
                storage.store := Big_map.add(params.item_id, im, storage.store)
            }
        end;

        //SI le storage contient déjà une instance avec l'id envoyé en paramètres,

                // on vérifie que l'instance n'existe pas déjà dans la map item_instance du storage, si oui, on renvoie une erreur ?

                // on enregistre l'instance dans la map item_instance avec comme index instanceNumber

        //SI le storage ne contient pas d'instance avec l'id envoyé en paranètres,

                // on crée une nouvelle map avec l'id comme index 

                // on ajoute l'instance dans la nouvelle map crée avec comme index instanceNumber
    } with ((nil: list (operation)), storage)
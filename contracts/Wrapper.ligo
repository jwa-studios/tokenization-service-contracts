
type item_metadata is record [
    available_quantity: nat;
    data: map (string, string);
    item_id : nat;
    name: string;
    no_update_after: option (timestamp);
    total_quantity: nat;
]

type parameter is
    Retrieve_item of nat
|   Store_item of nat

type storage is record [
    owner: address;
    version: string;
    wrapper: big_map(nat, item_metadata)
]

type return is list (operation) * storage;

function retrieve (const item_id: nat; var storage: storage): return is
    block {
        const found_item: option (item_metadata) = storage.wrapper [item_id];

        case found_item of 
            None -> failwith("ITEM_DOESNT_EXIST")
        |   Some (i) -> {
                const available_quantity : nat = i.available_quantity;

                
                if i.available_quantity = 0n then {
                    failwith("NO_AVAILABE_ITEM");
                } else {
                    i.available_quantity := i.available_quantity - 1n;
                    storage.wrapper := Big_map.update(i.item_id, Some(i), storage.wrapper);
                }  
        }
        end;
    } with ((nil: list (operation)), storage)

function main (const action : parameter; const storage : storage): return is
    case action of
        Retrieve_item (id) -> retrieve(id,storage)
    end


type item_metadata is record [
    data: map (string, string);
    item_id : nat;
    no_update_after: option (timestamp);
    quantity: nat;
]

type parameter is 
    Add_item of item_metadata
|   Update_item of item_metadata
|   Freeze_item of nat

type storage is record [
    owner: address;
    version: string;
    warehouse: big_map (nat, item_metadata);
]

type return is list (operation) * storage;

function add (var item: item_metadata; var storage: storage): return is
    block {
        const found_item: option(item_metadata) = storage.warehouse [item.item_id];

        case found_item of
            None -> storage.warehouse := Big_map.add(item.item_id, item, storage.warehouse)
        |   Some (i) -> failwith("ITEM_ID_ALREADY_EXISTS")
        end;
    } with ((nil: list (operation)), storage)

function update (const item: item_metadata; var storage: storage): return is
    block {
        const found_item: option (item_metadata) = storage.warehouse [item.item_id];

        case found_item of
            None -> failwith("ITEM_ID_DOESNT_EXIST")
        |   Some (i) -> {
                const no_update_after : option (timestamp) = i.no_update_after;

                case no_update_after of
                    None -> skip
                |   Some (t) -> { 
                    if Tezos.now >= t then {
                        failwith("ITEM_IS_FROZEN");
                    } else {
                        skip;
                    }
                }
                end;

                storage.warehouse := Big_map.update(item.item_id, Some(item), storage.warehouse);
        }
        end;
    } with ((nil: list (operation)), storage)

function freeze (const id: nat; var storage: storage): return is
    block {
        const found_item: option (item_metadata) = storage.warehouse [id];

        case found_item of 
            None -> failwith("ITEM_ID_DOESNT_EXIST")
        |   Some (i) -> {
                const no_update_after : option (timestamp) = i.no_update_after;

                case no_update_after of
                    None -> skip
                |   Some(t) -> {
                    if Tezos.now >= t then {
                        failwith("ITEM_IS_FROZEN");
                    } else {
                        skip;
                    }
                }
                end;

                i.no_update_after := Some(Tezos.now);
                storage.warehouse := Big_map.update(i.item_id, Some(i), storage.warehouse);
        }
        end;
    } with ((nil: list (operation)), storage)

function main (const action : parameter; const storage : storage): return is
    case action of
        Add_item (i) -> add(i, storage)
    |   Update_item (i) -> update(i, storage)
    |   Freeze_item (id) -> freeze(id, storage)
    end

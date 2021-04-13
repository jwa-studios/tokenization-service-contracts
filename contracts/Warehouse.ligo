type item_metadata is record [
    available_quantity: nat;
    data: map (string, string);
    item_id : nat;
    name: string;
    no_update_after: option (timestamp);
    total_quantity: nat;
]

type parameter is 
    Add_item of item_metadata
|   Assign_item of item_metadata
|   Update_item of item_metadata
|   Freeze_item of nat

type storage is record [
    owner: address;
    version: string;
    warehouse: big_map (nat, item_metadata);
]

type return is list (operation) * storage;

[@inline] const ignore_item_metadata = [%Michelson ({| {DROP;UNIT} |} : item_metadata -> unit)]

function add (var item: item_metadata; var storage: storage): return is
    block {
        const found_item: option(item_metadata) = storage.warehouse [item.item_id];

        case found_item of
            None -> storage.warehouse := Big_map.add(item.item_id, item, storage.warehouse)
        |   Some (i) -> block { ignore_item_metadata(i); failwith("ITEM_ID_ALREADY_EXISTS")}
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

function assign(const item_id: nat; const inventory_address: address): return is
    block {
        const item_found: option (item_metadata) = inventory_address.warehouse [item_id];

        case item_found of 
            None -> failwith("ITEM_DOESNT_EXIST")
        |   Some (i) -> {
                const available_quantity : nat = i.available_quantity;
                
                if i.available_quantity = 0n then {
                    failwith("NO_AVAILABLE_ITEM");
                } else {
                    i.available_quantity := i.available_quantity - 1n;
                    inventory_address.warehouse := Big_map.update(i.item_id, Some(i), inventory_address.warehouse);
                }
        }
        end;            
    }with ((nil: list (operation)), inventory_address)

function main (const action : parameter; const storage : storage): return is
    case action of
        Add_item (i) -> add(i, storage)
    |   Assign_item(id) -> assign(id, storage)
    |   Update_item (i) -> update(i, storage)
    |   Freeze_item (id) -> freeze(id, storage)
    end

type item_metadata is record [
    available_quantity: nat;
    data: map (string, string);
    item_id : nat;
    name: string;
    no_update_after: option (timestamp);
    total_quantity: nat;
]

type storage is record [
    owner: address;
    version: string;
    warehouse: big_map (nat, item_metadata);
]

type item_data is record [
    data: map (string, string);
]

type data is record [
    data: item_data;
    instance_number: nat;
    item_id: nat
]

type assign_parameters is address * data

type inventory_parameter is
    Assign of data

type parameter is
    Add_item of item_metadata
|   Assign_item of assign_parameters
|   Update_item of item_metadata
|   Freeze_item of nat


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

function assign(const params: assign_parameters; var storage: storage): return is
    block {
        //check si l'item existe dans la warehouse
        const item_found: option(item_metadata) = storage.warehouse[params.1.item_id];
        var ops : list(operation) := nil;

        case item_found of 
            None -> failwith("ITEM_DOESNT_EXIST")
            | Some (iF) -> {
                const av_quantity : nat = iF.available_quantity;
        
                if av_quantity = 0n then {
                    failwith ("NO_AVAILABLE_ITEM");
                } else {
                    //baisser le nombre d'item demandé dans la warehouse
                    iF.available_quantity := abs(iF.available_quantity - 1n);
                    storage.warehouse[params.1.item_id].available_quantity := iF.available_quantity;
                    //appel à la fonction assing_item de l'inventaire
                    const inventory : contract (inventory_parameter) =
                    case (Tezos.get_entrypoint_opt("%assign_item", params.0) : option (contract (inventory_parameter))) of
                        Some (contract) -> contract
                        | None -> (failwith ("Contract not found.") : contract (inventory_parameter))
                    end;
                    const action : inventory_parameter = Assign(params.1);
                    const op : operation = Tezos.transaction (action, 0tez, inventory);
                    ops := list [op]
                }
            }
        end;
    } with (ops, storage)

function main (const action : parameter; const storage : storage): return is
    case action of
        Add_item (i) -> add(i, storage)
    |   Assign_item(i) -> assign(i, storage)
    |   Update_item (i) -> update(i, storage)
    |   Freeze_item (id) -> freeze(id, storage)
    end

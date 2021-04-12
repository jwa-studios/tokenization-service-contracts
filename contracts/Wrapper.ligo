type storage is record [
    warehouse: address
]

type return is list (operation) * storage

type item_metadata is record [
    available_quantity: nat;
    data: map (string, string);
    item_id : nat;
    name: string;
    no_update_after: option (timestamp);
    total_quantity: nat;
]

type parameter is
    Add_item_proxy of item_metadata
|   Assign_item_proxy of nat

type warehouse_parameter is
    Add_item of item_metadata

function add(const item: item_metadata; const storage: storage): return is
    block {
        const warehouse : contract (warehouse_parameter) =
        case (Tezos.get_entrypoint_opt("%add_item", storage.warehouse) : option (contract (warehouse_parameter))) of
            Some (contract) -> contract
        | None -> (failwith ("Contract not found.") : contract (warehouse_parameter))
        end;

        const action : warehouse_parameter = Add_item (item);
        const op : operation = Tezos.transaction (action, 0tez, warehouse);
        const ops : list (operation) = list [op]
    } with (ops, storage)

function assign (const id: nat; const storage: storage): return is 
    block {
        skip
    } with ((nil: list (operation)), storage)

function main(const action: parameter; const storage: storage): return is
    case action of
        Add_item_proxy (i) -> add(i, storage)
    |   Assign_item_proxy (id) -> assign(id, storage)
    end

type item_metadata is record [
    data: map (string, string);
    item_id : nat;
    quantity: nat;
]

type parameter is 
    Add_item of item_metadata
|   Update_item of item_metadata

type storage is record [
    owner: address;
    version: string;
    warehouse: big_map (nat, item_metadata);
]

type return is list (operation) * storage

function add (var item: item_metadata; var storage: storage): return is
    block {
        storage.warehouse := Big_map.add(item.item_id, item, storage.warehouse)
    } with ((nil: list (operation)), storage)

function update (const item: item_metadata; var storage: storage): return is
    block {
        storage.warehouse := Big_map.update(item.item_id, Some(item), storage.warehouse)
    } with ((nil: list (operation)), storage)

function main (const action : parameter; const storage : storage): return is
    case action of
        Add_item (i) -> add(i, storage)
    |   Update_item (i) -> update(i, storage)
    end

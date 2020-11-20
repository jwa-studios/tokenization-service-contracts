
type item_metadata is record [
    data: map (string, string);
    item_id : nat;
    quantity: nat;
]

type warehouse is big_map (nat, item_metadata)

type parameter is 
    Add_item of item_metadata
|   Update_item of item_metadata

type storage is record [
    stuff: nat;
    warehouse: warehouse;
]

type return is list (operation) * storage

function add (var item: item_metadata; var store: storage): return is
    block {
        store.warehouse := Big_map.add(item.item_id, item, store.warehouse)
    } with ((nil: list (operation)), store)

function update (const item: item_metadata; var store: storage): return is
    block {
        store.warehouse := Big_map.update(item.item_id, Some(item), store.warehouse)
    } with ((nil: list (operation)), store)

function main (const action : parameter; const store : storage): return is
    case action of
        Add_item (i) -> add(i, store)
    |   Update_item (i) -> update(i, store)
    end

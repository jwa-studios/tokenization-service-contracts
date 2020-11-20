
type item_metadata is record [
    data: map (string, string);
    item_id : nat;
    quantity: nat;
]

type parameter is 
    Add_item of item_metadata
|   Update_item of item_metadata

type storage is big_map (nat, item_metadata)

type return is list (operation) * storage

function add (var item: item_metadata; var store: storage): return is
    block {
        store := Big_map.add(item.item_id, item, store)
    } with ((nil: list (operation)), store)

function update (const item: item_metadata; var store: storage): return is
    block {
        store := Big_map.update(item.item_id, Some(item), store)
    } with ((nil: list (operation)), store)

function main (const action : parameter; const store : storage): return is
    case action of
        Add_item (i) -> add(i, store)
    |   Update_item (i) -> update(i, store)
    end

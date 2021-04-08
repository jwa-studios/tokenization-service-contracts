// Errors

// ILLEGAL_SENDER_ORIGINATOR: Only the originator may invoke this entrypoint
// ILLEGAL_SENDER_OWNER: Only the owner may invoke this entrypoint
// INVENTORY_LOCKED: Only when the inventory is in possession of the originator can it be altered, otherwise it's locked
// ITEM_ID_DOESNT_EXIST: No item exists at this ID, please assign an item first

type item_data is record [
    data: map (string, string);
]

type storage is record [
    owner: address;
    originator: address;
    inventory: big_map (nat, item_data);
]

type parameter is
    Assign_item of nat
|   Unassign_item of nat
|   Update_item of nat * item_data
|   Change_owner of address
|   Reclaim of unit

type return is list (operation) * storage;

const empty_item_data: item_data = record [
    data = (map []: map (string, string));
];

function assign (const id: nat; var storage: storage): return is
    block {
        if storage.originator =/= storage.owner then failwith("INVENTORY_LOCKED") else skip;
        if storage.originator =/= Tezos.sender then failwith("ILLEGAL_SENDER_ORIGINATOR") else skip;

        const found_item: option(item_data) = storage.inventory [id];

        case found_item of
            None -> storage.inventory := Big_map.add(id, empty_item_data, storage.inventory)
        |   Some (i) -> skip
        end;
    } with ((nil: list (operation)), storage)

// Update requires a new copy of the whole data field for simplicity.
// Fields not present in the new copy will simply be removed
function update (const item: nat * item_data; var storage: storage): return is
    block {
        if storage.originator =/= storage.owner then failwith("INVENTORY_LOCKED") else skip;
        if storage.originator =/= Tezos.sender then failwith("ILLEGAL_SENDER_ORIGINATOR") else skip;

        const found_item: option(item_data) = storage.inventory [item.0];

        case found_item of
            None -> failwith("ITEM_ID_DOESNT_EXIST")
        |   Some (i) -> storage.inventory := Big_map.update(item.0, Some(item.1), storage.inventory)
        end;
    } with ((nil: list (operation)), storage)

function unassign (const id: nat; var storage: storage): return is
    block {
        if storage.originator =/= storage.owner then failwith("INVENTORY_LOCKED") else skip;
        if storage.originator =/= Tezos.sender then failwith("ILLEGAL_SENDER_ORIGINATOR") else skip;

        const found_item: option(item_data) = storage.inventory [id];

        case found_item of
            None -> skip
        |   Some (i) -> remove id from map storage.inventory
        end;
    } with ((nil: list (operation)), storage)

function change_owner (const owner: address; var storage: storage): return is
    block {
        if storage.owner =/= Tezos.sender then failwith("ILLEGAL_SENDER_OWNER") else skip;

        storage.owner := owner;
    } with ((nil: list (operation)), storage)

function reclaim (const u: unit; var storage: storage): return is
    block {
        if storage.originator =/= Tezos.sender then failwith("ILLEGAL_SENDER_ORIGINATOR") else skip;

        storage.owner := storage.originator;
    } with ((nil: list (operation)), storage);

function main (const action : parameter; const storage : storage): return is case action of
        Assign_item (i) -> assign(i, storage)
    |   Update_item (i) -> update(i, storage)
    |   Unassign_item (i) -> unassign(i, storage)
    |   Change_owner (o) -> change_owner(o, storage)
    |   Reclaim (u) -> reclaim(u, storage)
    end
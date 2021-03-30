// Errors

// ILLEGAL_SENDER_ORIGINATOR: Only the originator may invoke this entrypoint
// ILLEGAL_SENDER_OWNER: Only the owner may invoke this entrypoint
// INVENTORY_LOCKED: Only when the inventory is in possession of the originator can it be altered, otherwise it's locked
// ITEM_ID_DOESNT_EXIST: No item exists at this ID, please assign an item first

type item_data is record [
    data: map (string, string);
]

type instance is record [
    item : map(nat, item_data)
]

type storage is record [
    owner: address;
    originator: address;
    inventory: big_map (nat, instance);
]

type parameter is
    Assign_item of nat

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

function main (const action : parameter; const storage : storage): return is case action of
        Assign_item (i) -> assign(i, storage)
    end
type token_metadata is record [
    token_id : nat;
    symbol : string;
    name : string;
    decimals: nat;
    extras: map (string, string)
]

type registry is big_map (nat, token_metadata)

type parameter is
    Add_token of token_metadata
|   Update_token of token_metadata

type storage is record [
    last_token_id : nat;
    registry: registry;
]

type return is list (operation) * storage

function add (var token: token_metadata; var store: storage): return is
    block {
        store.last_token_id := store.last_token_id + 1n;
        token.token_id := store.last_token_id;

        store.registry := Big_map.add (token.token_id, token, store.registry);
    } with ((nil: list (operation)), store)

function update (const token: token_metadata; var store: storage): return is
    block {
        store.registry := Big_map.update (token.token_id, Some(token), store.registry)
    } with ((nil: list (operation)), store)

function main (const action : parameter; const store : storage): return is
    case action of
        Add_token (t) -> add(t, store)
    |   Update_token (t) -> update(t, store)
    end
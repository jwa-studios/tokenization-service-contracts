type item_data is record [
    data: map (string, string);
]

type item_instances is map(nat, item_data)

type storage is record [
    inventory: big_map (nat, item_instances);
]

type parameter is record [
    data: item_data;
    instance_number: nat;
    item_id: nat
]

type action is 
    Assign_item of parameter
|   Update_item of parameter

[@inline] const ignore_item_data = [%Michelson ({| {DROP;UNIT} |} : item_data -> unit)]

type return is list (operation) * storage;

function assign_item (const params: parameter; var storage: storage): return is
    block {
        const instances_map: option (item_instances) = storage.inventory[params.item_id];

        case instances_map of
            None -> block {
                const new_instances_map : item_instances = map [params.instance_number -> params.data];

                storage.inventory := Big_map.add (params.item_id, new_instances_map, storage.inventory)
            }
            | Some (im) -> block {
                const updated_im = Map.add (params.instance_number, params.data, im);

                storage.inventory := Big_map.add (params.item_id, updated_im, storage.inventory)
            }
        end;
    } with ((nil: list (operation)), storage)

function update_item (const params: parameter; var storage: storage): return is
    block {
        const instances_map: option (item_instances) = storage.inventory[params.item_id];

        case instances_map of
            None -> failwith ("NO_SUCH_ITEM_IN_INVENTORY")
            | Some (im) -> block {
                const instance: option (item_data) = im [params.instance_number];

                case instance of
                    None -> failwith("NO_SUCH_INSTANCE_NUMBER")
                |   Some (i) -> block {
                    ignore_item_data (i);
                    const updated_im : item_instances = Map.update (params.instance_number, Some (params.data), im);
                    storage.inventory [params.item_id] := updated_im
                }
                end;
            }
        end;
    } with ((nil: list (operation)), storage)

function main (const action: action; const storage: storage): return is
    case action of
        Assign_item (i) -> assign_item (i, storage)
    |   Update_item (i) -> update_item (i, storage)
    end

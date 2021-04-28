const Warehouse = artifacts.require("Warehouse");
const Inventory = artifacts.require("Inventory");
const { MichelsonMap } = require("@taquito/taquito");

const { warehouseItemToObject, getInventoryItemtAt } = require("./utils");

contract("Given Warehouse and Inventory are deployed", () => {
    let warehouseInstance;
    let inventoryInstance;

    before(async () => {
        warehouseInstance = await Warehouse.deployed();
        inventoryInstance = await Inventory.deployed();

        console.log(`Warehouse is deployed at ${warehouseInstance.address}`);
        console.log(`Inventory is deployed at ${inventoryInstance.address}`);
    });

    describe("When I add a new item with a quantity of 1", () => {
        before(async () => {
            await warehouseInstance.add_item(
                1,
                MichelsonMap.fromLiteral({
                    XP: "97"
                }),
                9,
                "Karim Benzema",
                undefined,
                1
            );
        });

        describe("And I assign it to an inventory", () => {
            let inventoryStorage;
            let warehouseStorage;

            before(async () => {
                await warehouseInstance.assign_item_proxy(
                    inventoryInstance.address,
                    9,
                    1
                );

                inventoryStorage = await inventoryInstance.storage();
                warehouseStorage = await warehouseInstance.storage();
            });

            it("Then assigns the item to the inventory", async () => {
                const obj = await getInventoryItemtAt(inventoryStorage, 9, 1);

                expect(obj).to.deep.eql({
                    data: {
                        XP: "97"
                    }
                });
            });

            it("Then decrements the available quantity for the item", async () => {
                const item = await warehouseStorage.warehouse.get("9");

                const obj = warehouseItemToObject(item);

                expect(obj).to.eql({
                    available_quantity: 0,
                    data: {
                        XP: "97"
                    },
                    item_id: 9,
                    name: "Karim Benzema",
                    no_update_after: undefined,
                    total_quantity: 1
                });
            });

            describe("When I assign the item again", () => {
                it("Then fails since there are no available items anymore", async () => {
                    try {
                        await warehouseInstance.assign_item_proxy(
                            inventoryInstance.address,
                            9,
                            1
                        );

                        console.error(
                            "Will fail: Assign_item_proxy should throw an error since the available_quantity is 0n"
                        );
                        expect.fail(
                            "Assign_item_proxy should throw an error if the available_quantity is 0n"
                        );
                    } catch (err) {
                        expect(err.message).to.equal("NO_AVAILABLE_ITEM");
                    }
                });
            });
        });

        describe("When I assign an item to an inventory that doesn't exist", () => {
            before(async () => {
                await warehouseInstance.add_item(
                    1,
                    MichelsonMap.fromLiteral({
                        XP: "0"
                    }),
                    20,
                    "An Item",
                    undefined,
                    1
                );
            });

            it("Then fails with an explicit error", async () => {
                try {
                    await warehouseInstance.assign_item_proxy(
                        "KT1CKvaBW4kzvxChQpbG9GQPTiwtVX6kj1WY",
                        20,
                        1
                    );

                    console.error(
                        "Will fail: Assign_item_proxy should throw an error since the inventory contract doesn't exist"
                    );
                    expect.fail(
                        "Assign_item_proxy should throw an error if the contract doesn't exist"
                    );
                } catch (err) {
                    expect(err.message).to.equal("CONTRACT_NOT_FOUND");
                }
            });
        });
    });
});

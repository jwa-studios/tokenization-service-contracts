const Inventory = artifacts.require("Inventory");
const { MichelsonMap } = require("@taquito/taquito");

contract("Given Inventory is deployed", () => {
    let inventoryInstance;
    let storage;

    before(async () => {
        inventoryInstance = await Inventory.deployed();
    });

    describe("When assigning a new item", () => {
        before(async () => {
            await inventoryInstance.assign_item(
                MichelsonMap.fromLiteral({
                    XP: "97"
                }),
                12,
                2
            );

            storage = await inventoryInstance.storage();
        });

        it("Then assigns the item to the inventory", async () => {
            const obj = await getObjectAt(storage, 2, 12);

            expect(obj).to.deep.eql({
                data: {
                    XP: "97"
                }
            });
        });

        describe("When updating the item", () => {
            before(async () => {
                await inventoryInstance.update_item(
                    MichelsonMap.fromLiteral({
                        XP: "98"
                    }),
                    12,
                    2
                );

                storage = await inventoryInstance.storage();
            });

            it("Then updates the assigned item", async () => {
                const obj = await getObjectAt(storage, 2, 12);

                expect(obj).to.deep.eql({
                    data: {
                        XP: "98"
                    }
                });
            });
        });

        it("Then fails When updating an unassigned item", async () => {
            try {
                await inventoryInstance.update_item(
                    MichelsonMap.fromLiteral({
                        XP: "98"
                    }),
                    12,
                    3
                );

                console.error(
                    "Will fail: Assign_Item should throw an Error if the item isn't assign to this inventory"
                );
                expect.fail(
                    "Assign_Item should throw an Error if the item isn't assigned to this inventory"
                );
            } catch (err) {
                expect(err.message).to.equal("NO_SUCH_ITEM_IN_INVENTORY");
            }
        });

        it("Then fails When updating an unassigned item instance", async () => {
            try {
                await inventoryInstance.update_item(
                    MichelsonMap.fromLiteral({
                        XP: "98"
                    }),
                    13,
                    2
                );

                console.error(
                    "Will fail: Assign_Item should throw an Error if the item instance isn't assign to this inventory"
                );
                expect.fail(
                    "Assign_Item should throw an Error if the item instance isn't assigned to this inventory"
                );
            } catch (err) {
                expect(err.message).to.equal("NO_SUCH_INSTANCE_NUMBER");
            }
        });
    });
});

async function getObjectAt(storage, itemId, instanceNumber) {
    const instance_map = await storage.get(String(itemId));
    const entries = Object.fromEntries(instance_map.entries());
    return itemToObject(entries[String(instanceNumber)]);
}

function itemToObject(itemData) {
    return {
        data: Object.fromEntries(itemData.entries())
    };
}

const Inventory = artifacts.require("Inventory");
const { MichelsonMap } = require("@taquito/taquito");

contract("Given Inventory is deployed", () => {
    let inventoryInstance;
    let storage;

    before(async () => {
        inventoryInstance = await Inventory.deployed();

        storage = await inventoryInstance.storage();
    });

    it("And the owner field is set to originator", () => {
        expect(storage.owner).to.equal("tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb");
    });

    it("And the originator field is set to originator", () => {
        expect(storage.originator).to.equal("tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb");
    });

    describe("When assigning a new item", () => {
        before(async () => { 
            await inventoryInstance.assign_item(1);

            storage = await inventoryInstance.storage();
        });

        it("Then adds the item to the inventory", async () => {
            const item = await storage.inventory.get("1");
            const obj = itemToObject(item);

            expect(obj).to.deep.eql({
                data: {}
            });
        });

        describe("When adding an item with the same item ID", () => {
            before(async () => { 
                await inventoryInstance.assign_item(1);
    
                storage = await inventoryInstance.storage();
            });

            it("Then doesn\'t fail and returns the item", async () => {
                const item = await storage.inventory.get("1");
                const obj = itemToObject(item);
    
                expect(obj).to.deep.eql({
                    data: {}
                });
            });
        });

        describe("When updating the item", () => {
            before(async () => {
                await inventoryInstance.update_item(1, MichelsonMap.fromLiteral({
                        "XP": "97"
                    }));
    
                storage = await inventoryInstance.storage();
            });

            it("Then updates the item in the inventory", async () => {
                const item = await storage.inventory.get("1");
                const obj = itemToObject(item);

                expect(obj).to.eql({
                    data: {
                        XP: "97"
                    },
                });
            });
        });

        describe("When updating an item that doesn't exist", () => {
            it("Then fails with an explicit error", async () => {
                try {
                    await inventoryInstance.update_item(0, MichelsonMap.fromLiteral({
                            XP: "97"
                        })
                    );

                    console.error(
                        "Will fail: Update_item should throw an Error if Inventory doesn't possess an item with this ID"
                    );

                    expect.fail(
                        "Add Item should throw an Error if Inventory doesn't possess an item with this ID"
                    );
                } catch (err) {
                    expect(err.message).to.equal("ITEM_ID_DOESNT_EXIST");
                }
            });
        });

        describe("When unassigning the item", () => {
            before(async () => { 
                await inventoryInstance.unassign_item(1);
    
                storage = await inventoryInstance.storage();
            });

            it("Then removes it from the inventory", async () => {
                const item = await storage.inventory.get("1");
    
                expect(item).to.be.undefined;
            });
        });

        describe("When unassigning and item not in the inventory", () => {
            it("Then doesn\'t fail", async () => {
                await inventoryInstance.unassign_item(0);
            });
        });
    });

    describe("When changing the owner", () => {
        before(async () => { 
            await inventoryInstance.change_owner("tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6");

            storage = await inventoryInstance.storage();
        });

        it("Then set the new owner in the storage", () => {
            expect(storage.owner).to.equal("tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6");
        });

        it("Then the inventory is locked for mutation and new items can't be assigned", async () => {
            try {
                await inventoryInstance.assign_item(1);

                console.error(
                    "Will fail: Assign_item can't be called on a locked contract"
                );

                expect.fail(
                    "Assign Item should throw an Error if called on a locked contract"
                );
            } catch (err) {
                expect(err.message).to.equal("INVENTORY_LOCKED");
            }
        });

        it("Then the inventory is locked for mutation and items can't be updated", async () => {
            try {
                await inventoryInstance.update_item(1, MichelsonMap.fromLiteral({
                    XP: "97"
                }));

                console.error(
                    "Will fail: Update_item can't be called on a locked contract"
                );

                expect.fail(
                    "Update Item should throw an Error if called on a locked contract"
                );
            } catch (err) {
                expect(err.message).to.equal("INVENTORY_LOCKED");
            }
        });

        it("Then the inventory is locked for mutation and new items can't be unassigned", async () => {
            try {
                await inventoryInstance.unassign_item(1);

                console.error(
                    "Will fail: Unassign_item can't be called on a locked contract"
                );

                expect.fail(
                    "Unassign Item should throw an Error if called on a locked contract"
                );
            } catch (err) {
                expect(err.message).to.equal("INVENTORY_LOCKED");
            }
        });

        describe("When reclaiming the contract", () => {
            before(async () => {
                await inventoryInstance.reclaim(['unit']);

                storage = await inventoryInstance.storage();
            });

            it('Then sets the owner field back to originator', () => {
                expect(storage.owner).to.equal("tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb");
            });
        });
    });

    describe("And an unauthorized user", () => {
        describe("When calling the assign entrypoint", () => {
            it("Then the inventory throws a permission error", async () => {
                try {
                    await inventoryInstance.assign_item(1, {
                        from: "tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6"
                    });
    
                    console.error(
                        "Will fail: Assign_item can only be called by the owner"
                    );
    
                    expect.fail(
                        "Assign Item should throw an Error if not called by the owner"
                    );
                } catch (err) {
                    expect(err.message).to.equal("ILLEGAL_SENDER_OWNER");
                }
            });
        });
    });
});

function itemToObject(itemData) {
    return {
        data: Object.fromEntries(itemData.entries())
    };
}
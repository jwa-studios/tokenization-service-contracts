const Inventory = artifacts.require("Inventory");
const { MichelsonMap } = require("@taquito/taquito");

contract("Given Inventory is deployed", () => {
    let inventoryInstance;
    let storage;

    before(async () => {
        inventoryInstance = await Inventory.deployed();
        storage = await inventoryInstance.storage();
    });

    describe("When adding a new item", () => {
        before(async () => {
            await inventoryInstance.assign_item(
                2,
                12,
                MichelsonMap.fromLiteral({
                    XP: "97"
                })
            );
        });

        it("Then adds the item to the warehouse", async () => {
            const item = await storage.warehouse.get("0");
            const obj = itemToObject(item);

            expect(obj).to.deep.eql({
                data: {
                    XP: "97"
                }
            });
        });






    /*
    describe("When assigning a new item", () => {
        before(async () => { 
            await inventoryInstance.assign(1);

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
    });*/
});

function itemToObject(itemData) {
    return {
        data: Object.fromEntries(itemData.entries())
    };
}
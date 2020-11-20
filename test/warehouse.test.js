const Warehouse = artifacts.require("Warehouse");
const { MichelsonMap } = require("@taquito/taquito");

contract("Given Warehouse is deployed", () => {
    let warehouseInstance;

    before(async () => {
        warehouseInstance = await Warehouse.deployed()
    });

    describe("When adding a new item", () => {
        let storage;

        before(async () => {
            await warehouseInstance.add_item(
                MichelsonMap.fromLiteral({
                    XP: "97"
                }),
                0,
                10
            )

            storage = await warehouseInstance.storage();
        });

        it("Then adds the item to the warehouse", async () => {
            const item = await storage.get("0");
            const obj = itemToObject(item);

            expect(obj).to.deep.eql({
                data: {
                    XP: "97"
                },
                item_id: 0,
                quantity: 10
            })
        });

        describe("When updating the item", () => {
            before(async () => {
                await warehouseInstance.update_item(
                    MichelsonMap.fromLiteral({
                        XP: "98",
                        CLUB: "JUVE"
                    }),
                    0,
                    100
                )
            });

            it("Then updates the item in the warehouse", async () => {
                const item = await storage.get("0");
                const obj = itemToObject(item);

                expect(obj).to.eql({
                    data: {
                        XP: "98",
                        CLUB: "JUVE"
                    },
                    item_id: 0,
                    quantity: 100
                });
            });
        })
    });
})

function itemToObject(item) {
    return {
        item_id: item.item_id.toNumber(),
        quantity: item.quantity.toNumber(),
        data: Object.fromEntries(item.data.entries())
    };
}
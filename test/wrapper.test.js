const Wrapper = artifacts.require("Wrapper");
const Warehouse = artifacts.require("Warehouse");
const { MichelsonMap } = require("@taquito/taquito");

contract("Given Wrapper is deployed", () => {
    let wrapperInstance;
    let warehouseInstance;

    before(async () => {
        wrapperInstance = await Wrapper.deployed();
        warehouseInstance = await Warehouse.deployed();
    });

    describe("When adding a new item", () => {
        let storage;

        before(async () => {
            await wrapperInstance.add_item_proxy(
                10,
                MichelsonMap.fromLiteral({
                    XP: "97"
                }),
                10,
                "Christiano Ronaldo",
                undefined,
                10
            );

            storage = await warehouseInstance.storage();
        });

        it("Then adds the item to the warehouse", async () => {
            const item = await storage.warehouse.get("10");
            const obj = itemToObject(item);

            expect(obj).to.deep.eql({
                available_quantity: 10,
                data: {
                    XP: "97"
                },
                item_id: 10,
                name: "Christiano Ronaldo",
                no_update_after: undefined,
                total_quantity: 10
            });
        });
    });
});

function itemToObject(item) {
    return {
        no_update_after: item.no_update_after
            ? getISODateNoMs(new Date(item.no_update_after))
            : undefined,
        item_id: item.item_id.toNumber(),
        name: item.name,
        total_quantity: item.total_quantity.toNumber(),
        available_quantity: item.available_quantity.toNumber(),
        data: Object.fromEntries(item.data.entries())
    };
}

function getISODateNoMs(date = new Date()) {
    date.setMilliseconds(0);
    return date.toISOString();
}

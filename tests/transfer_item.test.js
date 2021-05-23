const { TezosToolkit, MichelsonMap } = require("@taquito/taquito");
const { InMemorySigner } = require("@taquito/signer");

const inventoryContract = require("../build/contracts/inventory.json");
const warehouseContract = require("../build/contracts/warehouse.json");

const {
    getInventoryItemAt,
    hasInventoryItemAt,
    originateContract
} = require("./utils");

describe("Given Warehouse and Inventory are deployed", () => {
    let warehouseInstance;
    let oldInventoryInstance;
    let newInventoryInstance;
    let tezos;

    beforeAll(async () => {
        tezos = new TezosToolkit("http://localhost:20000");

        tezos.setProvider({
            signer: new InMemorySigner(
                "edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq"
            )
        });

        warehouseInstance = await originateContract(tezos, warehouseContract, {
            owner: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb",
            version: "1",
            warehouse: MichelsonMap.fromLiteral({})
        });

        oldInventoryInstance = await originateContract(
            tezos,
            inventoryContract,
            MichelsonMap.fromLiteral({})
        );

        newInventoryInstance = await originateContract(
            tezos,
            inventoryContract,
            MichelsonMap.fromLiteral({})
        );
    });

    describe("When I add a new item with a quantity of 1", () => {
        beforeAll(async () => {
            const operation = await warehouseInstance.methods
                .add_item(
                    1,
                    MichelsonMap.fromLiteral({
                        XP: "97"
                    }),
                    9,
                    "Karim Benzema",
                    undefined,
                    1
                )
                .send();

            await operation.confirmation(1);
        });

        describe("And I assign it to an inventory", () => {
            let oldInventoryStorage;
            let newInventoryStorage;

            beforeAll(async () => {
                const operation = await warehouseInstance.methods
                    .assign_item_proxy(oldInventoryInstance.address, 9, 1)
                    .send();

                await operation.confirmation(1);

                oldInventoryStorage = await oldInventoryInstance.storage();
                newInventoryStorage = await newInventoryInstance.storage();
            });

            describe("When I transfer an item to an inventory that doesn't exist", () => {
                it("Then fails with an explicit error", async () => {
                    try {
                        const operation = await oldInventoryInstance.methods
                            .transfer_item(
                                1,
                                9,
                                "KT1XhQyjgyDKfMvqznw36aUFaLG8gerPpqaQ"
                            )
                            .send();

                        await operation.confirmation(1);

                        console.error(
                            "Will fail: transfer_item should throw an error since the inventory contract doesn't exist"
                        );
                    } catch (err) {
                        expect(err.message).toEqual("CONTRACT_NOT_FOUND");
                    }
                });
                it("Then checks that the item is still in the old inventory", async () => {
                    const obj = await getInventoryItemAt(
                        oldInventoryStorage,
                        9,
                        1
                    );

                    expect(obj).toEqual({
                        data: {}
                    });
                });
            });

            describe("And I transfer it to another inventory", () => {
                beforeAll(async () => {
                    const operation = await oldInventoryInstance.methods
                        .transfer_item(1, 9, newInventoryInstance.address)
                        .send();

                    await operation.confirmation(1);
                });

                it("Then assigns the item to new the inventory", async () => {
                    const obj = await getInventoryItemAt(
                        newInventoryStorage,
                        9,
                        1
                    );

                    expect(obj).toEqual({
                        data: {}
                    });
                });

                it("Then removes the item from the old inventory", async () => {
                    const bool = await hasInventoryItemAt(
                        oldInventoryStorage,
                        9,
                        1
                    );

                    expect(bool).toEqual(false);
                });
            });
        });
    });
});

const Warehouse = artifacts.require("Warehouse");
const { MichelsonMap } = require("@taquito/taquito");

contract("Given Warehouse is deployed", () => {
    let warehouseInstance;

    before(async () => {
        warehouseInstance = await Warehouse.deployed();
    });

    describe('When getting the storage', () => {
        let storage;

        before(async () => {
            storage = await warehouseInstance.storage();
        });

        it("Then returns the current version", () => {
            expect(storage.version).to.equal("1");
        });

        it("Then returns the owner", () => {
            expect(storage.owner).to.equal("tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb");
        });
    })

    describe("When adding a new item", () => {
        let storage;

        before(async () => {
            await warehouseInstance.add_item(
                MichelsonMap.fromLiteral({
                    XP: "97"
                }),
                0,
                undefined,
                10
            );

            storage = await warehouseInstance.storage();
        });

        it("Then adds the item to the warehouse", async () => {
            const item = await storage.warehouse.get("0");
            const obj = itemToObject(item);

            expect(obj).to.deep.eql({
                data: {
                    XP: "97"
                },
                item_id: 0,
                no_update_after: undefined,
                quantity: 10
            });
        });

        describe("When adding an item with the same item ID", () => {
            it("Then fails with an explicit error", async () => {
                try {
                    await warehouseInstance.add_item(
                        MichelsonMap.fromLiteral({
                            XP: "97"
                        }),
                        0,
                        undefined,
                        10
                    );

                    console.error("Will fail: Add_Item should throw an Error if Warehouse already possesses an item with the same ID");
                    expect.fail("Add Item should throw an Error if Warehouse already possesses an item with the same ID");
                } catch (err) {
                    expect(err.message).to.equal("ITEM_ID_ALREADY_EXISTS");
                }
            });
        });

        describe("When updating the item", () => {
            before(async () => {
                await warehouseInstance.update_item(
                    MichelsonMap.fromLiteral({
                        XP: "98",
                        CLUB: "JUVE"
                    }),
                    0,
                    undefined,
                    100
                );
            });

            it("Then updates the item in the warehouse", async () => {
                const item = await storage.warehouse.get("0");
                const obj = itemToObject(item);

                expect(obj).to.eql({
                    data: {
                        XP: "98",
                        CLUB: "JUVE"
                    },
                    item_id: 0,
                    no_update_after: undefined,
                    quantity: 100
                });
            });
        });

        describe("When updating an item that doesn't exist", () => {
            it("Then fails with an explicit error", async () => {
                try {
                    await warehouseInstance.update_item(
                        MichelsonMap.fromLiteral({
                            XP: "97"
                        }),
                        1234,
                        undefined,
                        10
                    );

                    console.error("Will fail: Update_Item should throw an Error if Warehouse doesn't possess an item with this ID");
                    expect.fail("Add Item should throw an Error if Warehouse doesn't possess an item with this ID");
                } catch (err) {
                    expect(err.message).to.equal("ITEM_ID_DOESNT_EXIST");
                }
            });
        });
    });

    describe("When adding a new item without time left for modifications", () => {
        let storage;
        let noUpdateAfter;

        before(async () => {
            const pastDate = new Date()
            pastDate.setHours(pastDate.getHours() - 1);
            noUpdateAfter = getISODateNoMs(pastDate);

            await warehouseInstance.add_item(
                MichelsonMap.fromLiteral({
                    XP: "97"
                }),
                100,
                noUpdateAfter,
                10
            );

            storage = await warehouseInstance.storage();
        });

        it("Then has a matching `no_update_after` timestamp", async () => {
            const item = await storage.warehouse.get("100");
            const obj = itemToObject(item);

            expect(obj).to.eql({
                data: {
                    XP: "97"
                },
                item_id: 100,
                no_update_after: noUpdateAfter,
                quantity: 10
            });
        });

        it("Then may not be modified anymore", async () => {
            try {
                await warehouseInstance.update_item(
                    MichelsonMap.fromLiteral({
                        XP: "98"
                    }),
                    100,
                    undefined,
                    10
                )

                console.error("Will fail: Update_Item should throw an Error if the items `no_update_after` timestamp is in the past");
                expect.fail("Update_Item should throw an Error if the items `no_update_after` timestamp is in the past");
            } catch (err) {
                expect(err.message).to.equal("ITEM_IS_FROZEN");
            }
        });
    });

    describe("When adding a new item with time left for modifications", () => {
        let storage;
        let noUpdateAfter;

        before(async () => {
            const futureDate = new Date()
            futureDate.setHours(futureDate.getHours() + 1)
            noUpdateAfter = getISODateNoMs(futureDate)

            await warehouseInstance.add_item(
                MichelsonMap.fromLiteral({
                    XP: "97"
                }),
                200,
                noUpdateAfter,
                10
            )

            storage = await warehouseInstance.storage();
        });

        it("Then has a matching `no_update_after` timestamp", async () => {
            const item = await storage.warehouse.get("200");
            const obj = itemToObject(item);

            expect(obj).to.eql({
                data: {
                    XP: "97"
                },
                item_id: 200,
                no_update_after: noUpdateAfter,
                quantity: 10
            });
        });

        describe("And when I modify it again", () => {
            before(async () => {
                await warehouseInstance.update_item(
                    MichelsonMap.fromLiteral({
                        XP: "98"
                    }),
                    200,
                    noUpdateAfter,
                    10
                )

                storage = await warehouseInstance.storage();
            });

            it("Then allows me to update it", async () => {
                const item = await storage.warehouse.get("200");
                const obj = itemToObject(item);
    
                expect(obj).to.eql({
                    data: {
                        XP: "98"
                    },
                    item_id: 200,
                    no_update_after: noUpdateAfter,
                    quantity: 10
                });
            });
        });

        describe("And when I freeze it", () => {
            before(async () => {
                await warehouseInstance.freeze_item(200)
            });

            it("Then doesn't allow me to update it anymore", async () => {
                try {
                    await warehouseInstance.update_item(
                        MichelsonMap.fromLiteral({
                            XP: "99"
                        }),
                        200,
                        undefined,
                        10
                    )
    
                    console.error("Will fail: Update_Item should throw an Error if the items `no_update_after` timestamp is in the past");
                    expect.fail("Update_Item should throw an Error if the items `no_update_after` timestamp is in the past")
                } catch (err) {
                    expect(err.message).to.equal("ITEM_IS_FROZEN")
                }
            });

            describe("When freezing an item that is already frozen", () => {
                it("Then fails with an explicit error", async () => {
                    try {
                        await warehouseInstance.freeze_item(200)
    
                        console.error("Will fail: Freeze_Item should throw an Error if item is already frozen as it should be immutable");
                        expect.fail("Freeze Item should throw an Error if item is already frozen as it should be immutable")
                    } catch (err) {
                        expect(err.message).to.equal("ITEM_IS_FROZEN")
                    }
                });
            });
        });
    });
})

function itemToObject(item) {
    return {
        no_update_after: item.no_update_after ? getISODateNoMs(new Date(item.no_update_after)) : undefined,
        item_id: item.item_id.toNumber(),
        quantity: item.quantity.toNumber(),
        data: Object.fromEntries(item.data.entries())
    };
}

function getISODateNoMs(date = new Date()) {
    date.setMilliseconds(0);
    return date.toISOString();
}
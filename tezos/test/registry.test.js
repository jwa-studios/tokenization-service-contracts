const Registry = artifacts.require("Registry");
const { MichelsonMap } = require("@taquito/taquito");

contract("Given Registry is deployed", () => {
    let registryInstance;

    before(async() => {
        registryInstance = await Registry.deployed()
    });

    describe("When adding a new token", () => {
        let storage;

        before(async() => {
            await registryInstance.add_token(
                0,
                MichelsonMap.fromLiteral({
                    "XP": "97"
                }),
                "CR7",
                "JWA-FOOT",
                0
            )

            storage = await registryInstance.storage();
        });

        it("Then adds the token to the registry", async () => {
            const token = await storage.registry.get("1");
            const obj = tokenToObject(token);

            expect(obj).to.eql({
                decimals: 0,
                name: "CR7",
                symbol: "JWA-FOOT",
                token_id: 1,
                extras: {
                    "XP": "97"
                }
            });
        });

        describe("When updating the token", () => {
            before(async () => {
                await registryInstance.update_token(
                    0,
                    MichelsonMap.fromLiteral({
                        "XP": "98",
                        "CLUB": "JUVE"
                    }),
                    "CR7",
                    "JWA-FOOT",
                    1
                )
            });

            it("Then then updates the token in the registry", async () => {
                const token = await storage.registry.get("1");
                const obj = tokenToObject(token);
    
                expect(obj).to.eql({
                    decimals: 0,
                    name: "CR7",
                    symbol: "JWA-FOOT",
                    token_id: 1,
                    extras: {
                        "XP": "98",
                        "CLUB": "JUVE"
                    }
                });
            });
        })
    });
})

function tokenToObject(token) {
    return {
        ...token,
        token_id: token.token_id.toNumber(),
        decimals: token.decimals.toNumber(),
        extras: strMapToObj(token.extras.valueMap)
    };
}

function strMapToObj(strMap) {
    let obj = {};

    for (let [k, v] of strMap) {
        // for some reason, k comes back with two many quotes on each side, so stripping a few
        obj[k.slice(1, -1)] = v;
    }

    return obj;
}

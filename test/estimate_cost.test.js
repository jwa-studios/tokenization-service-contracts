const { TezosToolkit, MichelsonMap } = require("@taquito/taquito");
const { InMemorySigner, importKey } = require('@taquito/signer');

const Tezos = new TezosToolkit('http://localhost:20000');
Tezos.setProvider({ signer: new InMemorySigner('edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq') });

(async function run() {
    try {
        const balanceBefore = await Tezos.tz.getBalance('tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb');

        // const warehouseInstance = await Warehouse.deployed();
    
        const warehouseContract = await Tezos.contract.at('KT1BMoD1d3m3FcScf7Cm7AEv6jw54FD4R5Dv');
    
        // console.log(warehouseInstance.address)
    
        const mintNewItemOperation = await warehouseContract.methods.add_item(
            10000000,
            MichelsonMap.fromLiteral({
                XP: "97",
                CLUB: "Juventus Turin",
                poste: "CF"
            }),
            1,
            "Christiano Ronaldo",
            null,
            10000000
        ).send();
    
        await mintNewItemOperation.confirmation(3);
    
        const balanceAfter = await Tezos.tz.getBalance('tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb');
    
        console.log((balanceBefore.toNumber() - balanceAfter.toNumber()) / 1000000)
    } catch (err) {
        console.log(err)
    }

})();
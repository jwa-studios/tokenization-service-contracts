const { alice } = require("./scripts/sandbox/accounts");

module.exports = {
    // see <http://truffleframework.com/docs/advanced/configuration>
    // for more details on how to specify configuration options!
    networks: {
        development: {
            host: "http://localhost",
            port: 8732,
            network_id: "*",
            secretKey: alice.sk,
            type: "tezos"
        },
        minilab: {
            host: "http://localhost",
            port: 20000,
            network_id: "*",
            secretKey: alice.sk,
            type: "tezos"
        },
        florencenet: {
            host: "https://florencenet.smartpy.io",
            port: 443,
            network_id: "*",
            secretKey: alice.sk,
            type: "tezos"
        }
    }
};

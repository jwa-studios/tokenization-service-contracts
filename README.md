# Tokenization Service Contracts

The Tokenization Service's Smart Contracts. This is our custom implementation of a Tezos [FA2] contract.

## Requirements

1. A Custodian is the owner of a parent [FA2] contract listing all [FA2] tokens in their custody
1. An [FA2] token can be transferred to another custodian, it will result in a burn operation at the origin and a mint at the destination
1. Upon request, an [FA2] token can be extracted into its own contract with its own address for cold storage

## Implementation

Our implementation will be based on the TQ [FA2 implementation] with our added flavor

## Project Structure

The top level project sets up the Tezos Truffle Box.
The Tezos contracts are written in the `./tezos` folder.

## Getting Started

1. Start by cloning this repository
1. run `npm install` in this folder
1. run `npm install` in the `./tezos` folder

[FA2]:https://gitlab.com/tzip/tzip/-/blob/master/proposals/tzip-12/tzip-12.md
[FA2 implementation]:https://github.com/tqtezos/smart-contracts

### Test the contracts

Start the sandbox first:

```
cd tezos
npm run start-sandbox
```

Then run the tests:

```
truffle test
```
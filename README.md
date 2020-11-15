# Tokenization Service Contracts

The Tokenization Service's Smart Contracts. 
There are mostly 2 contracts:

1. The Catalog, which contains all tokenized items, including their full description and quantities.
2. The Ledger, which retraces important historical information of a given item and their owners.

## Requirements

1. Items created in the Catalog are truly immutable, their characteristics may never be altered. Just like a manufactured product once manufactured can't be altered. If a faulty item is minted, it must be discarded or sold as-is, or minted again.
2. Items in the Catalog don't belong to anyone and can't be transferred. Items in the Catalog are not owned, only linked to an originator.
3. Items in the Catalog are semi-fungible. If an item is created with a quantity of 1000, all 1000 items have the same value and can be exchanged without destruction of value.
4. When an item in the Catalog is purchased, its new owner is recorded in the Ledge. The Catalog item remains unaltered, its total quantity remains unaltered, but there's one fewer item left to be purchased. The Ledger records the new owner but has a unique reference to the Catalog item so the Catalog item isn't duplicated. Since the Catalog item is truly immutable and is globally uniquely identified, there's no need to duplicate it.
5. When an item owner alters an item they have purchased, the changes is recorded in the Ledger. Only the delta between the purchased token and the original one in the Catalog is recorded in the Ledger.
6. An item can be transferred between compatible ledgers. An item may be partially or completely transferred from one ledger to another.

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
npx truffle test
```

### Deploy to specified network:

```
npx truffle migrate --network development
```
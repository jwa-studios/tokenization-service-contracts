# Tokenization Service Contracts

The Tokenization Service's Smart Contracts.
There are mostly 2 contracts:

1. The Warehouse, which contains all tokenized items, including their full description and quantities.
2. The Ledger, which retraces important historical information of a given item and their owners.

## Requirements

1. Items created in the Warehouse are truly immutable, their characteristics may never be altered. Just like a manufactured product once manufactured can't be altered. If a faulty item is minted, it must be discarded or sold as-is, or minted again.
2. Items in the Warehouse don't belong to anyone and can't be transferred. Items in the Warehouse are not owned, only linked to an originator.
3. Items in the Warehouse are semi-fungible. If an item is created with a quantity of 1000, all 1000 items have the same value and can be exchanged without destruction of value.
4. When an item in the Warehouse is purchased, its new owner is recorded in the Ledge. The Warehouse item remains unaltered, its total quantity remains unaltered, but there's one fewer item left to be purchased. The Ledger records the new owner but has a unique reference to the Warehouse item so the Warehouse item isn't duplicated. Since the Warehouse item is truly immutable and is globally uniquely identified, there's no need to duplicate it.
5. When an item owner alters an item they have purchased, the changes are recorded in the Ledger. Only the delta between the purchased token and the original one in the Warehouse is recorded in the Ledger.
6. An item can be transferred between compatible ledgers. An item may be partially or completely transferred from one ledger to another.
7. Actually it's not true, an item in the Warehouse can be modified until the `no_update_after` timestamp is in the past. We call it an expiration date as it prevents items from being modified after that date. We say that when the item can't be modified anymore, it's frozen. An item can be frozen quickly by calling the appropriate entrypoint. Until the expiration date is reached, the date can be removed or pushed further in the future.

## Project Structure

The Tezos contracts are written in the `./contracts` folder.

## Getting Started

Ensure you have truffle@tezos

1. Start by cloning this repository
1. run `npm install` in this folder

### Test the contracts

Start the sandbox first:

```
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

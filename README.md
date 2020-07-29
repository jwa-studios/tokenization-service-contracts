# Tokenization Service Contracts

The Tokenization Service's Smart Contracts. This is our custom implementation of a Tezos [FA2] contract.

## Requirements

1. A Custodian is the owner of a parent [FA2] contract listing all [FA2] tokens in their custody
1. An [FA2] token can be transferred to another custodian, it will result in a burn operation at the origin and a mint at the destination
1. Upon request, an [FA2] token can be extracted into its own contract with its own address for cold storage


[FA2]:https://gitlab.com/tzip/tzip/-/blob/master/proposals/tzip-12/tzip-12.md
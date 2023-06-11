# Resolv3er

# What it is

We're extending the capabilities of ENS records beyond Ethereum Mainnet. For that we're leveraging ERC-3668 CCPI Read to store Ens records on blockchain resolvers. Enabling ENS users to store their data in their favorite ecosystems.

DISCLAIMER

We're forking the corpus/dm3 because our first idea was to build on top of their project. However we pivotet away from that idea but still using the forked repo from dm3 to host our code. 

# How is it build

We're having 3 Key components

## OffchainResolver

The Offchain Resolver is a contract deployed on L1. This contract implements the ERC-3668 Flow and resolves read request for a given record of a given name.
Every supported L2 can deploy an instance of that contract to add their chain to the network. For the scope of the hackathon contracts supporting Gnosis Chain, Mantle Network, and Optimism are deployed on their corresponding testnet.

You can find the contract at
`packages/Gateway/contracts`

## L2 Public Resolver

The Public Resolver is a fork of the ENS Public Resolver. We modified authorization to a permissionless approach so no centralized registry is needed anymore.
That enables us to let users set records for their profile without access to the L2 registry.
This works because when the read request contains the owner of the domain

To give you an example. Preting the owner of vitalik.eth is the address 0x1
Everyone could set records for the domain vitalik.eth but their address is always included in that namespace. So if the owner of the address 0x2 set an record on l2 this entry will never be found by the lookup because the hash(0x1,vitalik.eth) hash(0x2,vitalik.eth) is different.

## Gateway

The Gateway establishes the link between L1 and L2. It is a Node.js Server resolving request. It queries the target L2 and fetches the request information.
To ensure the integrity of the response the Gateways signs the response. The address of that private key is set in the OffchainResolver contract so the receiver can verify the data integrity.

The gateway we've provided brings multichain capabilities and can be easily extended.

You can find the contract at
`packages/Gateway/src`

## ENS Frontend

To demo our solution we've forked the ENS-dapp https://github.com/ensdomains/ens-app-v3.
We've extended the Receiver section to let users deploy one of our Offchain resolver contracts.

# How to add a new network ?

Due to time constraints, we were just able to add Gnosis Chain, Mantle and Optimism. but adding the network of your choice is fairly simple

1. Deploy an instance of the OffchainResolver contract to Goerli. Modify the URL param so it correspondences to your gateway
2. Deploy an L2 Public Resolver contract to your desired L2 network
3. Implement the IChain interface and add a handler so the gatewy knows how the data can be retrieved from your network

# Deployments

## Gnosis

L1 OffchainResolver 0xB4A824f381e77b40346EBa86CC34eE7252e041F2

L2 PublicResolver 0xB4A824f381e77b40346EBa86CC34eE7252e041F2

Gateway 'https://gnosis-resolver.herokuapp.com/10200/{sender}/{data}/',

## Mantle

L1 OffchainResolver 0x79B99730d677118800C7d87413A86f136C15eA56

L2 Public Resolver 0x19412b03f08A6AD2904D2C9df3E28bC27fc9c92a

Gateway 'https://mantle-resolver.herokuapp.com/5001/{sender}/{data}/',

## Optimism

L1 OffchainResolver 0x5d8Ed5730736EF5a955AdDB7f81eDbb8e25C9AE2

L2 Public Resolver 0x19412b03f08A6AD2904D2C9df3E28bC27fc9c92a

Gateway 'https://mantle-resolver.herokuapp.com/5001/{sender}/{data}/',

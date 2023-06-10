// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import '@ensdomains/ens-contracts/contracts/registry/ENS.sol';

contract OwnedENSNode {
    ENS public ensRegistry;

    constructor(ENS _ensRegistry) {
        ensRegistry = _ensRegistry;
    }

    function getOwnedENSNode(
        bytes32 node,
        address owner
    ) internal pure returns (bytes32) {
        return keccak256(abi.encode(node, owner));
    }

    function getOwnerNode(bytes32 node) internal view returns (bytes32) {
        address nodeOwner = ensRegistry.owner(node);
        return getOwnedENSNode(node, nodeOwner);
    }

    function replaceNodeWithOwnedNode(
        bytes calldata data
    ) public view returns (bytes memory) {
        bytes4 selector = bytes4(data[:4]);
        bytes32 node = bytes32(data[4:36]);
        bytes memory additionalData = data[36:];

        return bytes.concat(selector, getOwnerNode(node), additionalData);
    }
}

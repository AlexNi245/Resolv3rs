import { ethers } from 'ethers';

export function getResolverInterface() {
    return new ethers.utils.Interface([
        'function resolve(bytes calldata name, bytes calldata data) external view returns(bytes)',
        'function text(bytes32 node, string calldata key) external view returns (string memory)',
        // eslint-disable-next-line max-len
        'function resolveWithProof(bytes calldata response, bytes calldata extraData) external view returns (bytes memory)',
        'function addr(bytes32 node) external view returns (address)',
    ]);
}

export function decodeAddr(ensName: string, data: ethers.utils.Result) {
    const ownedNode = data.node;
    return { ownedNode };
}
export function decodeText(ensName: string, data: ethers.utils.Result) {
    const [ownedNode, record] = data;

    return { ownedNode, record };
}

export function decodeCcipRequest(calldata: string) {
    try {
        const textResolver = getResolverInterface();

        //Parse the calldata returned by a contra
        const [ensName, data] = textResolver.parseTransaction({
            data: calldata,
        }).args;

        const { signature, args } = textResolver.parseTransaction({
            data,
        });

        switch (signature) {
            case 'text(bytes32,string)':
                return { signature, request: decodeText(ensName, args) };
            case 'addr(bytes32)': {
                return { signature, request: decodeAddr(ensName, args) };
            }

            default:
                return { signature, request: null };
        }
    } catch (err: any) {
        console.log("[Decode Calldata] Can't decode calldata ");
        console.log(err);
        throw err;
    }
}

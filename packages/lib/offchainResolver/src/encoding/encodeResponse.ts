import { ethers, Signer } from 'ethers';
import { getResolverInterface } from './getResolverInterface';

export async function encodeResponse(
    signer: Signer,
    resolverAddr: string,
    response: any,
    request: string,
    functionSelector: string,
    ttl: number = 300,
): Promise<string> {
    const textResolver = getResolverInterface();
    const validUntil = Math.floor(Date.now() / 1000 + ttl);

    const result = textResolver.encodeFunctionResult(functionSelector, [
        response,
    ]);

    const messageHash = ethers.utils.solidityKeccak256(
        ['bytes', 'address', 'uint64', 'bytes32', 'bytes32'],
        [
            '0x1900',
            resolverAddr,
            validUntil,
            ethers.utils.keccak256(request),
            ethers.utils.keccak256(result),
        ],
    );

    const msgHashDigest = ethers.utils.arrayify(messageHash);
    /**
     * The signature is used to verify onchain if this response object was indeed signed by a valid signer
     */
    const sig = await signer.signMessage(msgHashDigest);

    return ethers.utils.defaultAbiCoder.encode(
        ['bytes', 'uint64', 'bytes'],
        [result, validUntil, sig],
    );
}

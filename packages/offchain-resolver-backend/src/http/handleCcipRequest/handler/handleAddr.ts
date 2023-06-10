import { ethers } from 'ethers';

export async function handleAddr(chain: IChain, request: any) {
    const { ownedNode } = request;
    console.log('CHIAN GET ADDR', ownedNode);
    return await chain.getAddr(ownedNode);
}

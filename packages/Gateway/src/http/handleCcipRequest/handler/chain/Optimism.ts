import { ethers } from 'ethers';
import { L2ResolverAbi } from './L2ResolverIFace';

const Optimism_CHAIN_ID = 420;
export const Optimism = async (): Promise<IChain> => {
    const OptimismRpc = process.env.Optimism_RPC;
    const resolver = process.env.Optimism_RESOLVER_ADDR;
    if (!OptimismRpc) {
        throw Error('API_KEY_Optimism is not set');
    }

    if (!resolver) {
        throw Error('Optimism_RESOLVER_ADDR is not set');
    }

    const rpc = new ethers.providers.StaticJsonRpcProvider(OptimismRpc, {
        chainId: Optimism_CHAIN_ID,
        name: 'optimism',
    });

    const contract = new ethers.Contract(resolver, L2ResolverAbi, rpc);

    return {
        isChain: (chainId) => {
            return chainId === Optimism_CHAIN_ID;
        },
        getAddr: async (name: string) => {
            return await contract.connect(rpc)['addr(bytes32)'](name);
        },
        getText: async (name, record: string) => {
            const res = await contract.connect(rpc).text(name, record);
            return res;
        },
    };
};

import { ethers } from 'ethers';
import { L2ResolverAbi } from './L2ResolverIFace';

const MANTLE_CHAIN_ID = 5001;
export const Mantle = async (): Promise<IChain> => {
    const mantleRpc = process.env.MANTLE_RPC;
    const resolver = process.env.MANTLE_RESOLVER_ADDR;
    if (!mantleRpc) {
        throw Error('API_KEY_MANTLE is not set');
    }

    if (!resolver) {
        throw Error('MANTLE_RESOLVER_ADDR is not set');
    }

    const rpc = new ethers.providers.StaticJsonRpcProvider(mantleRpc, {
        chainId: MANTLE_CHAIN_ID,
        name: 'matle',
    });

    const contract = new ethers.Contract(resolver, L2ResolverAbi, rpc);

    return {
        isChain: (chainId) => {
            return chainId === MANTLE_CHAIN_ID;
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

import { ethers } from 'ethers';
import { L2ResolverAbi } from './L2ResolverIFace';

const GNOSIS_CHAIN_ID = 10200;
export const Gnosis = async (): Promise<IChain> => {
    const gnosisRpc = process.env.GNOSIS_RPC;
    const resolver = process.env.GNOSIS_RESOLVER_ADDR;
    if (!gnosisRpc) {
        throw Error('API_KEY_GNOSIS is not set');
    }

    if (!resolver) {
        throw Error('GNOSIS_RESOLVER_ADDR is not set');
    }

    const rpc = new ethers.providers.StaticJsonRpcProvider(gnosisRpc, {
        chainId: GNOSIS_CHAIN_ID,
        name: 'gnosis',
    });

    const contract = new ethers.Contract(resolver, L2ResolverAbi, rpc);

    return {
        isChain: (chainId) => {
            return chainId === GNOSIS_CHAIN_ID;
        },
        getAddr: async (name: string) => {
            return await contract.connect(rpc)['addr(bytes32)'](name);
        },
        getText: async (name, record: string) => {
            const res = await contract.connect(rpc).text(name, record);
            console.log('res', res);
            return res;
        },
    };
};

import { ethers } from 'hardhat';
import { L2PublicResolver__factory } from '../../../../../typechain';
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

    const rpc = new ethers.providers.StaticJsonRpcProvider(gnosisRpc);

    const contractFactory = (await ethers.getContractFactory(
        'L2PublicResolver',
    )) as L2PublicResolver__factory;
    return {
        isChain: (chainId) => {
            return chainId === GNOSIS_CHAIN_ID;
        },
        getAddr: async (name: string) => {
            return await contractFactory
                .attach(resolver)
                .connect(rpc)
                ['addr(bytes32)'](name);
        },
        getText: async (name, record: string) => {
            const res = await contractFactory
                .attach(resolver)
                .connect(rpc)
                .text(name, record);

            return res;
        },
    };
};

import { Gnosis } from './Gnosis';
import { Mantle } from './Mantle';
import { Optimism } from './Optimism';

export const getChain = async (chainId: number) => {
    const supportedChains = await Promise.all([Gnosis(), Mantle(), Optimism()]);

    const chain = supportedChains.find((chain) => chain.isChain(chainId));

    if (!chain) {
        throw Error('Chain not supported');
    }
    return chain;
};

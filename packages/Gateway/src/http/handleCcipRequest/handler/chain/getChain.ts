import { Gnosis } from './Gnosis';
import { Mantle } from './Mantle';

export const getChain = async (chainId: number) => {
    const supportedChains = await Promise.all([Gnosis(), Mantle()]);

    const chain = supportedChains.find((chain) => chain.isChain(chainId));

    if (!chain) {
        throw Error('Chain not supported');
    }
    return chain;
};

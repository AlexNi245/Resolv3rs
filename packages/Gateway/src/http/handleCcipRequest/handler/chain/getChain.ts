import { Gnosis } from './Gnosis';

export const getChain = async (chainId: number) => {
    const supportedChains = await Promise.all([Gnosis()]);

    const chain = supportedChains.find((chain) => chain.isChain(chainId));

    if (!chain) {
        throw Error('Chain not supported');
    }
    return chain;
};

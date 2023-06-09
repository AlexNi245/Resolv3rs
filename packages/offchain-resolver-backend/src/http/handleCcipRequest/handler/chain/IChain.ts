interface IChain {
    isChain(chainId: number): boolean;
    getAddr(name: string, blockNumber?: number): Promise<string>;
    getText(name: string): Promise<string>;
}

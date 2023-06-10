interface IChain {
    isChain(chainId: number): boolean;
    getAddr(name: string): Promise<string>;
    getText(name: string, key: string): Promise<string>;
}

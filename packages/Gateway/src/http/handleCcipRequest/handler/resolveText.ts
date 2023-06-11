
export async function handleText(chain: IChain, request: any) {
    const { record, ownedNode } = request;

    //Todo fetch Profile from Gnosis
    const value = await chain.getText(ownedNode, record);

    return value ?? null;
}

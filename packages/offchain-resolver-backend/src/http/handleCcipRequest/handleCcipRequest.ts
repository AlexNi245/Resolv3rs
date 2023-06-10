import { logInfo } from 'dm3-lib-shared';
import { handleAddr } from './handler/handleAddr';
import { handleText } from './handler/resolveText';
export async function handleCcipRequest(
    chain: IChain,
    signature: string,
    request: any,
) {
    switch (signature) {
        case 'text(bytes32,string)':
            logInfo('Reading text(bytes32,string)');
            return await handleText(chain, request);
        case 'addr(bytes32)':
            logInfo('Reading addr(bytes32))');
            return await handleAddr(chain, request);
        case 'addr(bytes32,uint256)':
            logInfo('Reading addr(bytes32,uint256))');
            return await handleAddr(chain, request);

        default:
            return null;
    }
}

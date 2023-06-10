import { encodeResponse } from 'dm3-lib-offchain-resolver/dist.backend';
import { logError } from 'dm3-lib-shared/dist.backend';
import { Signer, ethers } from 'ethers';
import express from 'express';
import { handleCcipRequest } from './handleCcipRequest/handleCcipRequest';
import { WithLocals } from './types';
import { getChain } from './handleCcipRequest/handler/chain/getChain';
import { decodeCcipRequest } from './encoding/decodeCcipRequest';

export function getResolverInterface() {
    return new ethers.utils.Interface([
        'function resolve(bytes calldata name, bytes calldata data) external view returns(bytes)',
        'function text(bytes32 node, string calldata key) external view returns (string memory)',
        // eslint-disable-next-line max-len
        'function resolveWithProof(bytes calldata response, bytes calldata extraData) external view returns (bytes memory)',
        'function addr(bytes32 node) external view returns (address)',
    ]);
}
export function ccipGateway(signer: Signer) {
    const router = express.Router();

    router.get(
        '/:chainId/:resolverAddr/:calldata',
        //@ts-ignore
        async (
            req: express.Request & { app: WithLocals },
            res: express.Response,
        ) => {
            const { resolverAddr, chainId, calldata } = req.params;

            req.app.locals.logger.info(`GET ${resolverAddr}`);

            try {
                const { request, signature } = decodeCcipRequest(calldata);

                console.log('REQ', request);
                const chain: IChain = await getChain(Number.parseInt(chainId));
                console.log('CHAIN', chain);
                //Adjust
                const response = await handleCcipRequest(
                    chain,
                    signature,
                    request,
                );

                if (!response) {
                    logError('Record not found');
                    res.status(404).send({ message: 'Record not found' });
                } else {
                    const data = await encodeResponse(
                        signer,
                        resolverAddr,
                        response,
                        calldata,
                        signature,
                    );

                    res.send({ data });
                }
            } catch (e) {
                req.app.locals.logger.warn((e as Error).message);
                res.status(400).send({ message: 'Unknown error' });
            }
        },
    );
    return router;
}

/* eslint no-console: 0 */

import { ethers } from 'hardhat';
import { L2PublicResolver__factory } from '../../typechain';
import { log, logInfo } from 'dm3-lib-shared';

const RECORD_KEY = 'MY_NEW_TEXT_RECORD';
const RECORD_VALUE = 'Welcome to the future!';
async function main() {
    const accounts = await (ethers as any).getSigners();
    console.log('Deployment account: ' + accounts[0].address);
    const L2PublicResolver = (await ethers.getContractFactory(
        'L2PublicResolver',
        accounts[0],
    )) as L2PublicResolver__factory;

    if (!process.env.GNOSIS_RESOLVER_ADDR) {
        throw Error('GNOSIS_RESOLVER_ADDR is not set');
    }
    if (!process.env.GNOSIS_RPC) {
        throw Error('GNOSIS_RPC is not set');
    }
    const tx = await L2PublicResolver.attach(
        process.env.GNOSIS_RESOLVER_ADDR,
    ).setText(ethers.utils.namehash('foooo.eth'), RECORD_KEY, RECORD_VALUE, {
        gasPrice: ethers.utils.parseUnits('300', 'gwei'),
    });

    const rec = await tx.wait();

    logInfo(
        `See Tx at https://blockscout.com/gnosis/chiado/tx/${rec.transactionHash}`,
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

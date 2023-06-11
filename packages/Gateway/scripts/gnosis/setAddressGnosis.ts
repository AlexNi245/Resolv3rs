/* eslint-disable no-console */
const GNOSIS_DEPLOYER = '0xb1D396c618E962B8f0492525586D79B1E2e5Aa76';

import { ethers } from 'hardhat';
import { L2PublicResolver__factory } from '../../typechain';
import { log, logInfo } from 'dm3-lib-shared';

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

    await L2PublicResolver.attach(process.env.GNOSIS_RESOLVER_ADDR)[
        'setAddr(bytes32,address)'
    ](ethers.utils.namehash('alice.eth'), GNOSIS_DEPLOYER, {
        gasPrice: ethers.utils.parseUnits('300', 'gwei'),
    });

    logInfo(`Set ADDRESS`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

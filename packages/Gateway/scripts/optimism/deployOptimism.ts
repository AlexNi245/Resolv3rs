/* eslint no-console: 0 */

import { ethers } from 'hardhat';

async function main() {
    const accounts = await (ethers as any).getSigners();
    console.log('Deployment account: ' + accounts[0].address);
    const L2PublicResolver = await ethers.getContractFactory(
        'L2PublicResolver',
    );

    const l2PublicResolver = await L2PublicResolver.deploy({
        gasPrice: 8000000,
    });
    const rec = await l2PublicResolver.deployed();

    console.log(`Deployed to ${l2PublicResolver.address}`);
    console.log(rec.deployTransaction.hash);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

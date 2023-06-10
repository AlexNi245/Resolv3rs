import { ethers } from 'ethers';
import { ethers as hreEthers } from 'hardhat';
const { expect } = require('chai');
import { FakeContract, smock } from '@defi-wonderland/smock';
import { ENS } from '../typechain';

const GNOSIS_DEPLOYER = '0xb1D396c618E962B8f0492525586D79B1E2e5Aa76';
describe.only('GnosisIntegration', () => {
    let offchainResolver: hreEthers.Contract;
    let ensRegistry: FakeContract<ENS>;

    beforeEach(async () => {
        const OffchainResolver = await hreEthers.getContractFactory(
            'OffchainResolver',
        );
        ensRegistry = await smock.fake('ENS');
        offchainResolver = await OffchainResolver.deploy(
            ensRegistry.address,
            'http://localhost:8081/10200/{sender}/{data}/',
            GNOSIS_DEPLOYER,
            [GNOSIS_DEPLOYER],
        );
        ensRegistry.owner.returns(GNOSIS_DEPLOYER);
    });
    it('should resolve text', async () => {
        const provider: ethers.providers.StaticJsonRpcProvider = {
            ...hreEthers.provider,
            getResolver: () => {
                return new ethers.providers.Resolver(
                    hreEthers.provider,
                    offchainResolver.address,
                    'alice.eth',
                );
            },
        };

        const resolver = await provider.getResolver('alice.eth');

        const text = await resolver!.getText('FOO');

        expect(text).to.equal('BAR');
    });
    it('should resolve addr', async () => {
        const provider: ethers.providers.StaticJsonRpcProvider = {
            ...hreEthers.provider,
            getResolver: () => {
                return new ethers.providers.Resolver(
                    hreEthers.provider,
                    offchainResolver.address,
                    'alice.eth',
                );
            },
        };

        const resolver = await provider.getResolver('alice.eth');

        const address = await resolver!.getAddress();

        expect(address).to.equal(GNOSIS_DEPLOYER);
    });
});

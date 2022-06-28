import { ethers } from 'ethers';
import {
    StorageEnvelopContainer,
    StorageLocation,
    SyncProcessState,
    UserDB,
} from '../storage/Storage';

import { Connection, ConnectionState } from '../web3-provider/Web3Provider';
import {
    addContact,
    checkProfileHash,
    checkProfileRegistryEntry,
    checkStringSignature,
    createHashUrlParam,
    extractPublicKeys,
    getAccountDisplayName,
    getBrowserStorageKey,
    getContacts,
    getProfileRegistryEntry,
    ProfileRegistryEntry,
    publishProfileOnchain,
} from './Account';

const connection: Connection = {
    connectionState: ConnectionState.SignedIn,
    storageLocation: StorageLocation.File,
    account: {
        address: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
    },
    provider: {} as any,
};

test('get correct account display name', async () => {
    const ensNames = new Map();
    ensNames.set('0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855', 'test1');
    expect(
        getAccountDisplayName(
            '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
            ensNames,
        ),
    ).toStrictEqual('test1');

    expect(
        getAccountDisplayName(
            '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            ensNames,
        ),
    ).toStrictEqual('0x25...8292');
});

test('get correct account display name if account is undefined', async () => {
    const ensNames = new Map();
    ensNames.set('0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855', 'test1');
    expect(getAccountDisplayName(undefined, ensNames)).toStrictEqual('');
});

test('createHashUrlParam should create the correct hash', async () => {
    const signedProfile = {
        profileRegistryEntry: {
            publicKeys: {
                publicKey: '1',
                publicMessagingKey: '2',
                publicSigningKey: '3',
            },
        },
        signature:
            '0x146a7db30fb512a5c0164ae90b9495cb7309832c40525f29c52ad56c86e3cb32' +
            '48f9193dc67bf6038d802d143c22db43ce3e62971b20d3ddee93805d493bdb491c',
    };

    expect(createHashUrlParam(signedProfile)).toStrictEqual(
        'ensmailHash=0x4b25d985691c2004e8a516a20e922c44237aa647009824be0d937a4b10dd01b3',
    );
});

test('checkProfileHash should accept a correct hash ', async () => {
    const profileRegistryEntry: ProfileRegistryEntry = {
        publicKeys: {
            publicKey: '1',
            publicMessagingKey: '2',
            publicSigningKey: '3',
        },
    };

    const wallet = ethers.Wallet.createRandom();
    const signature = await wallet.signMessage(
        JSON.stringify(profileRegistryEntry),
    );
    const signedProfile = {
        profileRegistryEntry,
        signature,
    };

    const uri =
        'http://test/test?ensmailHash=' +
        ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes(JSON.stringify(signedProfile)),
        );

    expect(checkProfileHash(signedProfile, uri)).toStrictEqual(true);
});

test('checkProfileHash should reject  an invalid hash ', async () => {
    const profileRegistryEntry: ProfileRegistryEntry = {
        publicKeys: {
            publicKey: '1',
            publicMessagingKey: '2',
            publicSigningKey: '3',
        },
    };

    const wallet = ethers.Wallet.createRandom();
    const signature = await wallet.signMessage(
        JSON.stringify(profileRegistryEntry),
    );
    const signedProfile = {
        profileRegistryEntry,
        signature,
    };

    const uri = 'http://test/test?ensmailHash=123456';
    expect(checkProfileHash(signedProfile, uri)).toStrictEqual(false);
});

test('checkProfileHash should reject an URI without hash', async () => {
    const profileRegistryEntry: ProfileRegistryEntry = {
        publicKeys: {
            publicKey: '1',
            publicMessagingKey: '2',
            publicSigningKey: '3',
        },
    };

    const wallet = ethers.Wallet.createRandom();
    const signature = await wallet.signMessage(
        JSON.stringify(profileRegistryEntry),
    );
    const signedProfile = {
        profileRegistryEntry,
        signature,
    };

    const uri = 'http://test/test';
    expect(checkProfileHash(signedProfile, uri)).toStrictEqual(false);
});

test('checkProfileRegistryEntry should accept a correct signature ', async () => {
    const profileRegistryEntry: ProfileRegistryEntry = {
        publicKeys: {
            publicKey: '1',
            publicMessagingKey: '2',
            publicSigningKey: '3',
        },
    };

    const wallet = ethers.Wallet.createRandom();
    const signature = await wallet.signMessage(
        JSON.stringify(profileRegistryEntry),
    );

    expect(
        checkProfileRegistryEntry(
            {
                profileRegistryEntry,
                signature,
            },
            wallet.address,
        ),
    ).toStrictEqual(true);
});

test('checkProfileRegistryEntry should reject an invalid signature ', async () => {
    const profileRegistryEntry: ProfileRegistryEntry = {
        publicKeys: {
            publicKey: '1',
            publicMessagingKey: '2',
            publicSigningKey: '3',
        },
    };

    const wallet = ethers.Wallet.createRandom();
    const signature = await wallet.signMessage(
        JSON.stringify({
            publicKeys: { ...profileRegistryEntry.publicKeys, publicKey: '4' },
        }),
    );

    expect(
        checkProfileRegistryEntry(
            { profileRegistryEntry, signature },
            wallet.address,
        ),
    ).toStrictEqual(false);
});

test('getContacts ', async () => {
    const userDb: UserDB = {
        conversations: new Map<string, StorageEnvelopContainer[]>(),
        conversationsCount: 0,
        deliveryServiceToken: '',
        keys: {
            publicKey: 'a',
            publicMessagingKey: 'b',
            publicSigningKey: 'c',
            privateMessagingKey: '1',
            privateSigningKey: '2',
            storageEncryptionKey: '3',
        },
        lastChangeTimestamp: 0,
        syncProcessState: SyncProcessState.Idle,
        synced: true,
    };

    userDb.conversations.set(
        '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292,0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
        [],
    );

    expect(
        await getContacts(
            connection,
            async () => undefined,
            async () => [],
            async () => '',
            userDb,
            () => {},
        ),
    ).toStrictEqual([
        {
            address: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            publicKeys: undefined,
        },
    ]);
});

test('getContacts should throw if provider is undefined', async () => {
    expect.assertions(1);
    await expect(
        getContacts(
            { ...connection, provider: undefined },
            async () => undefined,
            async () => [],
            async () => '',
            {} as any,
            () => {},
        ),
    ).rejects.toEqual(Error('No provider'));
});

test('Should create an empty conversation for a new contact ', (done) => {
    const userDb: UserDB = {
        conversations: new Map<string, StorageEnvelopContainer[]>(),
        conversationsCount: 0,
        deliveryServiceToken: '',
        keys: {
            publicKey: 'a',
            publicMessagingKey: 'b',
            publicSigningKey: 'c',
            privateMessagingKey: '1',
            privateSigningKey: '2',
            storageEncryptionKey: '3',
        },
        lastChangeTimestamp: 0,
        syncProcessState: SyncProcessState.Idle,
        synced: true,
    };

    addContact(
        connection,
        '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
        async () => null,
        userDb,
        (id: string) => {
            expect(id).toStrictEqual(
                '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292,0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
            );
            done();
        },
    );
});

test('Should reject to add a contact if the contact was already added', async () => {
    const userDb: UserDB = {
        conversations: new Map<string, StorageEnvelopContainer[]>(),
        conversationsCount: 0,
        deliveryServiceToken: '',
        keys: {
            publicKey: 'a',
            publicMessagingKey: 'b',
            publicSigningKey: 'c',
            privateMessagingKey: '1',
            privateSigningKey: '2',
            storageEncryptionKey: '3',
        },
        lastChangeTimestamp: 0,
        syncProcessState: SyncProcessState.Idle,
        synced: true,
    };

    userDb.conversations.set(
        '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292,0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
        [],
    );
    userDb.conversationsCount = 1;

    expect.assertions(1);
    await expect(
        addContact(
            connection,
            '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            async () => null,
            userDb,
            () => false,
        ),
    ).rejects.toEqual(Error('Contact exists already.'));
});

test('extractPublicKeys', async () => {
    expect(
        extractPublicKeys({
            publicKey: 'a',
            publicMessagingKey: 'b',
            publicSigningKey: 'c',
            privateMessagingKey: '1',
            privateSigningKey: '2',
            storageEncryptionKey: '3',
        }),
    ).toStrictEqual({
        publicKey: 'a',
        publicMessagingKey: 'b',
        publicSigningKey: 'c',
    });
});

test('getBrowserStorageKey', async () => {
    expect(
        getBrowserStorageKey('0x25A643B6e52864d0eD816F1E43c0CF49C83B8292'),
    ).toStrictEqual(
        'userStorageSnapshot0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
    );
});

test('Should accept a valid signature of a string', async () => {
    const wallet = ethers.Wallet.createRandom();
    const sig = await wallet.signMessage('test');

    expect(checkStringSignature('test', sig, wallet.address)).toStrictEqual(
        true,
    );
});

test('Should reject an invalid signature of a string', async () => {
    const wallet = ethers.Wallet.createRandom();
    const sig = await wallet.signMessage('test');

    expect(checkStringSignature('test1', sig, wallet.address)).toStrictEqual(
        false,
    );
});

test('Should accept a valid profile signature', async () => {
    const profileRegistryEntry = {
        publicKeys: {
            publicKey: 'RXqfW5bqr44s26iDgAgf0SCDzLIsLko4vSwiAxm5W30=',
            publicMessagingKey: 'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
            publicSigningKey: '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
        },
    };
    expect(
        checkProfileRegistryEntry(
            {
                profileRegistryEntry,
                signature:
                    '0xaa927647cf7c73363d9c157f113f1c1754307aae79d886dc4cfa7bcb77b4dfc16cb' +
                    '50e808708085009ee782046891d8b85966a1a7482c5c0c42f73c7210cf7da1c',
            },
            '0x8101b0729eb9708a344c820fce80f12a90a7c1fa',
        ),
    ).toStrictEqual(true);
});

test('Should reject an invalid profile signature', async () => {
    const profileRegistryEntry = {
        publicKeys: {
            publicKey: 'RXqfW5bqr44s26iDgAgf0SCDzLIsLko4vSwiAxm5W30=',
            publicMessagingKey: 'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
            publicSigningKey: '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
        },
    };
    expect(
        checkProfileRegistryEntry(
            {
                profileRegistryEntry,
                signature:
                    '0xaa927647cf7c73363d9c157f113f1c1754307aae79d886dc4cfa7bcb77b4dfc1' +
                    '6cb50e808708085009ee782046891d8b85966a1a7482c5c0c42f73c7210cf7da1b',
            },
            '0x8101b0729eb9708a344c820fce80f12a90a7c1fa',
        ),
    ).toStrictEqual(false);
});

test('Should get profile registry entry from chain', async () => {
    const signedProfileRegistryEntry = {
        profileRegistryEntry: {
            publicKeys: {
                publicKey: 'RXqfW5bqr44s26iDgAgf0SCDzLIsLko4vSwiAxm5W30=',
                publicMessagingKey:
                    'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
                publicSigningKey:
                    '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
            },
        },
        signature:
            '0xaa927647cf7c73363d9c157f113f1c1754307aae79d886dc4cfa7bcb77b4dfc1' +
            '6cb50e808708085009ee782046891d8b85966a1a7482c5c0c42f73c7210cf7da1b',
    };

    expect.assertions(1);
    await expect(
        getProfileRegistryEntry(
            { provider: {} } as any,
            '0x8101b0729eb9708a344c820fce80f12a90a7c1fa',
            async () => undefined,
            async () =>
                'http://123?' + createHashUrlParam(signedProfileRegistryEntry),

            async (uri) =>
                uri ===
                'http://123?' + createHashUrlParam(signedProfileRegistryEntry)
                    ? signedProfileRegistryEntry
                    : undefined,
        ),
    ).resolves.toStrictEqual(signedProfileRegistryEntry);
});

test('Should get profile registry entry from backend', async () => {
    const signedProfileRegistryEntry = {
        profileRegistryEntry: {
            publicKeys: {
                publicKey: 'RXqfW5bqr44s26iDgAgf0SCDzLIsLko4vSwiAxm5W30=',
                publicMessagingKey:
                    'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
                publicSigningKey:
                    '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
            },
        },
        signature:
            '0xaa927647cf7c73363d9c157f113f1c1754307aae79d886dc4cfa7bcb77b4dfc1' +
            '6cb50e808708085009ee782046891d8b85966a1a7482c5c0c42f73c7210cf7da1b',
    };

    expect.assertions(1);
    await expect(
        getProfileRegistryEntry(
            { provider: {} } as any,
            '0x8101b0729eb9708a344c820fce80f12a90a7c1fa',
            async () => signedProfileRegistryEntry,
            async () => undefined,

            async () => undefined,
        ),
    ).resolves.toStrictEqual(signedProfileRegistryEntry);
});

test('Should prioritize onchain over offchain ', async () => {
    const signedProfileRegistryEntry = {
        profileRegistryEntry: {
            publicKeys: {
                publicKey: 'RXqfW5bqr44s26iDgAgf0SCDzLIsLko4vSwiAxm5W30=',
                publicMessagingKey:
                    'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
                publicSigningKey:
                    '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
            },
        },
        signature:
            '0xaa927647cf7c73363d9c157f113f1c1754307aae79d886dc4cfa7bcb77b4dfc1' +
            '6cb50e808708085009ee782046891d8b85966a1a7482c5c0c42f73c7210cf7da1b',
    };

    const signedProfileRegistryEntry2 = {
        ...signedProfileRegistryEntry,
        signature: '1',
    };

    expect.assertions(1);
    await expect(
        getProfileRegistryEntry(
            { provider: {} } as any,
            '0x8101b0729eb9708a344c820fce80f12a90a7c1fa',
            async () => signedProfileRegistryEntry2,
            async () =>
                'http://123?' + createHashUrlParam(signedProfileRegistryEntry),

            async (uri) =>
                uri ===
                'http://123?' + createHashUrlParam(signedProfileRegistryEntry)
                    ? signedProfileRegistryEntry
                    : undefined,
        ),
    ).resolves.toStrictEqual(signedProfileRegistryEntry);
});

test('publishProfileOnchain', async () => {
    expect.assertions(2);

    const tx = await publishProfileOnchain(
        {
            ...connection,
            account: { address: '0x8101b0729eb9708a344c820fce80f12a90a7c1fa' },
        },
        'http://bla',
        async () => '0x1',
        () => {
            return { address: '0x2' } as any;
        },
        () => {
            return { setText: () => 'success' } as any;
        },
        async () => {
            return {
                profileRegistryEntry: {
                    publicKeys: {
                        publicKey:
                            'RXqfW5bqr44s26iDgAgf0SCDzLIsLko4vSwiAxm5W30=',
                        publicMessagingKey:
                            'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
                        publicSigningKey:
                            '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
                    },
                },
                signature:
                    '0xaa927647cf7c73363d9c157f113f1c1754307aae79d886dc4cfa7bcb77b4dfc16cb' +
                    '50e808708085009ee782046891d8b85966a1a7482c5c0c42f73c7210cf7da1c',
            };
        },
    );

    expect(tx?.args).toStrictEqual([
        '0xca7a0eadca1ba3745db7065063294b717422bd1c70995cba8f5adcd094fdae1d',
        'eth.mail',
        'http://bla?ensmailHash=0x74c674bc920d6da183e9fd0ad59ba2cdb27685f821c7dfcb04de62b34aaf022b',
    ]);

    expect(tx?.method()).toStrictEqual('success');
});

test('publishProfileOnchain should throw', async () => {
    expect.assertions(1);

    await expect(
        publishProfileOnchain(
            { ...connection, provider: undefined },
            'http://bla',
            async () => '0x1',
            () => {
                return { address: '0x2' } as any;
            },
            () => {
                return { setText: () => 'success' } as any;
            },
            async () => {
                return undefined;
            },
        ),
    ).rejects.toEqual(Error('No provider'));
});

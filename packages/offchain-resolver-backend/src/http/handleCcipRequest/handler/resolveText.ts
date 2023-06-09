import { PROFILE_RECORD_NAME } from 'dm3-lib-profile/dist.backend';
import { stringify } from 'dm3-lib-shared/dist.backend';

export async function handleText(chain: IChain, request: any) {
    const { record, name } = request;

    if (record !== PROFILE_RECORD_NAME) {
        throw Error(`${record} Record is not supported by this resolver`);
    }

    //Todo fetch Profile from Gnosis
    const userProfile = await chain.getText(name);

    return userProfile
        ? 'data:application/json,' + stringify(userProfile)
        : null;
}

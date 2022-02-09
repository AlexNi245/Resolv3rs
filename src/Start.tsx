import AddPubKey from './AddPubKey';
import Icon from './Icon';
import { ApiConnection } from './lib/Web3Provider';

interface StartProps {
    contacts: string[] | undefined;
    apiConnection: ApiConnection;
    changeApiConnection: (apiConnection: Partial<ApiConnection>) => void;
}

function Start(props: StartProps) {
    return (
        <div
            className={`w-100${
                props.contacts && props.contacts.length > 0
                    ? ' start-space'
                    : ''
            }`}
        >
            <Icon iconClass="fas fa-arrow-left" />{' '}
            <strong>
                {props.contacts !== undefined && props.contacts.length > 0
                    ? 'Select a contact to start messaging'
                    : 'Add a contact to start'}
            </strong>
            {!props.apiConnection.encryptionPublicKey && (
                <AddPubKey changeApiConnection={props.changeApiConnection} />
            )}
        </div>
    );
}

export default Start;
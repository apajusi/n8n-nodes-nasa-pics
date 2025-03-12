import {
	IAuthenticateGeneric,
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestHelper,
	INodeProperties,
} from 'n8n-workflow';

export class ExampleCredentialsApi implements ICredentialType {
	name = 'exampleCredentialsApi';
	displayName = 'OpenGov PLC API';
	icon = 'file:wand.svg';
	documentationUrl = 'https://api.plce.opengov.com/docs';

	properties: INodeProperties[] = [
		{
			displayName: 'Session Token',
			name: 'sessionToken',
			type: 'hidden',
			typeOptions: {
				expirable: true,
				password: true,
			},
			default: '',
		},
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
		},
		{
			displayName: 'Auth0 Domain',
			name: 'domain',
			type: 'hidden', // ✅ Hidden from the user
			default: 'accounts.viewpointcloud.com',
		},
		{
			displayName: 'Audience',
			name: 'audience',
			type: 'hidden', // ✅ Hidden from the user
			default: 'viewpointcloud.com/api/production',
		},
	];

	/**
	 * Fetches the OAuth2 token before authentication
	 */
	async preAuthentication(this: IHttpRequestHelper, credentials: ICredentialDataDecryptedObject) {
		const { access_token } = (await this.helpers.httpRequest({
			method: 'POST',
			url: `https://${credentials.domain}/oauth/token`,
			body: {
				client_id: credentials.clientId,
				client_secret: credentials.clientSecret,
				audience: credentials.audience, // ✅ Sends audience automatically
				grant_type: 'client_credentials',
			},
			headers: {
				'Content-Type': 'application/json',
			},
		})) as { access_token: string };

		return { sessionToken: access_token };
	}

	/**
	 * Uses the token retrieved from `preAuthentication()` to authenticate requests
	 */
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.sessionToken}}',
			},
		},
	};

	/**
	 * Test function to verify that authentication works
	 */
	test: ICredentialTestRequest = {
		request: {
			method: 'GET',
			url: 'https://api.plce.opengov.com/plce/v1/presentation-alex/records/31783',
		},
	};
}
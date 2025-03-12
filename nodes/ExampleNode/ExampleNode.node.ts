import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	IHttpRequestOptions,
} from 'n8n-workflow';

export class ExampleNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'OpenGov PLC',
		name: 'opengovplc',
		icon: 'file:wand.svg',
		group: ['transform'],
		version: 1,
		description: 'Interact with the OpenGov PLC API',
		defaults: {
			name: 'OpenGov PLC',
		},
		credentials: [
			{
				name: 'exampleCredentialsApi',
				required: true,
			},
		],
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				options: [
					{ name: 'Find Record', value: 'findRecord' },
					{ name: 'Find Contacts', value: 'findContacts' },
					{ name: 'Find Locations', value: 'findLocations' },
					{ name: 'Find Form', value: 'findForm' },
					{ name: 'Find Workflow', value: 'findWorkflow' },
					{ name: 'Find Step', value: 'findStep' },
					{ name: 'Find Comments', value: 'findComments' },
					{ name: 'Post Comment', value: 'postComment' },
					{ name: 'Update Step', value: 'updateStep' },
				],
				default: 'findRecord',
				description: 'Select an API operation to perform',
			},
			{
				displayName: 'Community',
				name: 'community',
				type: 'string',
				default: '',
				required: true,
				description: 'The Permitting & Licensing subdomain.',
			},
			{
				displayName: 'Record ID',
				name: 'recordId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['findRecord', 'findContacts', 'findLocations', 'findForm', 'findWorkflow', 'findStep', 'findComments', 'postComment', 'updateStep'],
					},
				},
				required: true,
			},
			{
				displayName: 'Step ID',
				name: 'stepId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['findStep', 'findComments', 'postComment', 'updateStep'],
					},
				},
				required: true,
			},
			{
				displayName: 'Comment Text',
				name: 'commentText',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['postComment'],
					},
				},
				required: true,
			},
			{
				displayName: 'Comment Type',
				name: 'commentType',
				type: 'options',
				options: [
					{ name: 'Public Comment', value: 'COMMENT' },
					{ name: 'Internal Note', value: 'INTERNAL_NOTE' },
				],
				default: 'COMMENT',
				displayOptions: {
					show: {
						operation: ['postComment'],
					},
				},
				required: true,
			},
			{
				displayName: 'Step Status',
				name: 'stepStatus',
				type: 'options',
				options: [
					{ name: 'Rejected', value: 'REJECTED' },
					{ name: 'Inactivated', value: 'INACTIVATED' },
					{ name: 'Activated', value: 'ACTIVATED' },
					{ name: 'Completed', value: 'COMPLETED' },
					{ name: 'Skipped', value: 'SKIPPED' },
					{ name: 'On Hold', value: 'ON_HOLD' },
				],
				default: 'ACTIVATED',
				displayOptions: {
					show: {
						operation: ['updateStep'],
					},
				},
				required: true,
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const operation = this.getNodeParameter('operation', 0) as string;
		const credentialsName = 'exampleCredentialsApi';

		for (let i = 0; i < items.length; i++) {
			try {
				const community = this.getNodeParameter('community', i) as string;
				const baseUrl = `https://api.plce.opengov.com/plce/v1/${community}`;

				let requestOptions: IHttpRequestOptions = {
					url: '',
					method: 'GET',
					json: true,
				};

				switch (operation) {
					case 'findRecord': {
						const recordId = this.getNodeParameter('recordId', i) as string;
						requestOptions.url = `${baseUrl}/records/${recordId}`;
						break;
					}
					case 'findContacts': {
						const recordId = this.getNodeParameter('recordId', i) as string;
						requestOptions.url = `${baseUrl}/records/${recordId}/contacts`;
						break;
					}
					case 'findLocations': {
						const recordId = this.getNodeParameter('recordId', i) as string;
						requestOptions.url = `${baseUrl}/records/${recordId}/locations`;
						break;
					}
					case 'findForm': {
						const recordId = this.getNodeParameter('recordId', i) as string;
						requestOptions.url = `${baseUrl}/records/${recordId}/details`;
						break;
					}
					case 'findWorkflow': {
						const recordId = this.getNodeParameter('recordId', i) as string;
						requestOptions.url = `${baseUrl}/records/${recordId}/workflow-steps`;
						break;
					}
					case 'findStep': {
						const recordId = this.getNodeParameter('recordId', i) as string;
						const stepId = this.getNodeParameter('stepId', i) as string;
						requestOptions.url = `${baseUrl}/records/${recordId}/workflow-steps/${stepId}`;
						break;
					}
					case 'findComments': {
						const recordId = this.getNodeParameter('recordId', i) as string;
						const stepId = this.getNodeParameter('stepId', i) as string;
						requestOptions.url = `${baseUrl}/records/${recordId}/workflow-steps/${stepId}/comments`;
						break;
					}
					case 'postComment': {
						const recordId = this.getNodeParameter('recordId', i) as string;
						const stepId = this.getNodeParameter('stepId', i) as string;
						requestOptions = {
							...requestOptions,
							url: `${baseUrl}/records/${recordId}/workflow-steps/${stepId}/comments`,
							method: 'POST',
							body: {
								data: {
									type: 'record_step_comment',
									attributes: {
										type: this.getNodeParameter('commentType', i),
										comment: this.getNodeParameter('commentText', i),
									},
								},
							},
						};
						break;
					}
					case 'updateStep': {
						const recordId = this.getNodeParameter('recordId', i) as string;
						const stepId = this.getNodeParameter('stepId', i) as string;
						requestOptions = {
							...requestOptions,
							url: `${baseUrl}/records/${recordId}/workflow-steps/${stepId}/state`,
							method: 'PUT',
							body: {
								data: {
									id: stepId,
									type: 'record_step_state',
									attributes: {
										state: this.getNodeParameter('stepStatus', i),
									},
								},
							},
						};
						break;
					}
					default:
						throw new NodeOperationError(this.getNode(), `Operation '${operation}' is not supported`);
				}

				console.log('Making API Request:', JSON.stringify(requestOptions, null, 2));
				const responseData = await this.helpers.requestWithAuthentication.call(this, credentialsName, requestOptions);
				returnData.push({ json: responseData });
			} catch (error) {
				console.error('API Error:', error.response?.data || error.message);
				throw new NodeOperationError(this.getNode(), error, { itemIndex: i });
			}
		}

		return this.prepareOutputData(returnData);
	}
}
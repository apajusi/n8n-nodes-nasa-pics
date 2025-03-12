import {
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	NodeOperationError,
} from 'n8n-workflow';

export class ExampleNodeTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'OpenGov PLC Trigger',
		name: 'opengovplcTrigger',
		icon: 'file:wand.svg',
		group: ['trigger'],
		version: 1,
		description: 'Starts the workflow when PLC events occur',
		defaults: {
			name: 'OpenGov PLC Trigger',
		},
		credentials: [
			{
				name: 'exampleCredentialsApi',
				required: true,
			},
		],
		inputs: [],
		outputs: ['main'],
		webhooks: [
			{
				name: 'stepStatusUpdated',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhooks',
			},
		],
		properties: [
			{
				displayName: 'Event',
				default: 'stepstatusupdated',
				name: 'type',
				options: [
					{
						name: 'Step Status Updated',
						value: 'stepstatusupdated',
						description: "Triggers when a record step changes status",
					},
				],
				required: true,
				type: 'options',
			},
		],
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		try {
			// Retrieve webhook request data
			const body = this.getBodyData() as {
				id?: string;
				type?: string;
				occurred_at?: string;
				community?: string;
				record?: {
					id?: string;
					type_id?: string;
					url?: string;
				};
				details?: {
					object?: {
						object_type?: string;
						object_id?: number;
						object_url?: string;
						type?: string;
						template_id?: number;
						status?: string;
					};
					previous?: {
						status?: string;
					};
				};
			};

			console.log('Received Webhook Event:', body);

			// Extract relevant fields
			const stepData = {
				webhookId: body.id || 'Unknown',
				eventType: body.type || 'Unknown',
				occurredAt: body.occurred_at || new Date().toISOString(),
				community: body.community || 'Unknown',
				recordId: body.record?.id || 'Unknown',
				recordTypeId: body.record?.type_id || 'Unknown',
				recordUrl: body.record?.url || '',
				stepId: body.details?.object?.object_id || 'Unknown',
				stepType: body.details?.object?.type || '',
				stepStatus: body.details?.object?.status || '',
				stepObjectType: body.details?.object?.object_type || '',
				stepObjectUrl: body.details?.object?.object_url || '',
				templateId: body.details?.object?.template_id || 0,
				previousStatus: body.details?.previous?.status || '',
			};

			// Return parsed event data to n8n workflow
			return {
				workflowData: [[{ json: stepData }]],
			};
		} catch (error) {
			throw new NodeOperationError(this.getNode(), `Webhook processing failed: ${error.message}`);
		}
	}
}
import { defineEndpoint } from '@directus/extensions-sdk';

export default defineEndpoint({
	id: 'datahub-proxy',
	handler: (router, { env }) => {
		router.post('/', async (req, res) => {
			try {
				const { query, variables } = req.body;
				const datahubUrl = env.DATAHUB_GMS_URL || 'http://datahub-gms:8080';
				const datahubToken = env.DATAHUB_GMS_TOKEN;

				console.log('[DataHub Proxy] Request:', {
					url: `${datahubUrl}/api/graphql`,
					hasToken: !!datahubToken,
					tokenPrefix: datahubToken ? datahubToken.substring(0, 20) + '...' : 'none'
				});

				const headers: Record<string, string> = {
					'Content-Type': 'application/json',
				};

				if (datahubToken) {
					headers['Authorization'] = `Bearer ${datahubToken}`;
				}

				const response = await fetch(`${datahubUrl}/api/graphql`, {
					method: 'POST',
					headers,
					body: JSON.stringify({ query, variables }),
				});

				console.log('[DataHub Proxy] Response:', {
					status: response.status,
					ok: response.ok
				});

				const data = await response.json();

				if (!response.ok) {
					return res.status(response.status).json(data);
				}

				res.json(data);
			} catch (error: any) {
				res.status(500).json({
					error: error.message || 'Failed to proxy request to DataHub',
				});
			}
		});
	},
});

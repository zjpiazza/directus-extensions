import { defineEndpoint } from '@directus/extensions-sdk';

export default defineEndpoint((router, { services, getSchema }) => {
	const { ItemsService } = services;

	router.post('/', async (req, res) => {
		console.log('Webhook received:', JSON.stringify(req.body, null, 2));

		const { involvedObject, metadata, severity, reason } = req.body;

		if (!metadata || !involvedObject) {
			return res.status(400).send({ message: 'Invalid Flux webhook payload' });
		}

		const revisionKey = Object.keys(metadata).find(k => k.endsWith('/revision') || k === 'revision');
		if (!revisionKey) {
			return res.status(400).send({ message: 'Revision not found in metadata' });
		}

		const revision = metadata[revisionKey];
		let commitSha: string | undefined;

		if (revision.includes('@sha1:')) {
			commitSha = revision.split(':').pop();
		} else if (revision.includes('/')) {
			commitSha = revision.split('/').pop();
		}

		if (!commitSha) {
			return res.status(400).send({ message: 'Commit SHA not found in revision' });
		}

		try {
			const schema = await getSchema();
			const itemsService = new ItemsService('tenants', { schema });
			const tenants = await itemsService.readByQuery({
				filter: {
					last_commit_sha: { _eq: commitSha },
				},
			});

			if (tenants && tenants.length > 0) {
				const tenant = tenants[0];
				if (!tenant) {
					// Should not happen based on the check above but satisfies typescript
					return res.status(404).send({ message: `No tenant found for commit SHA: ${commitSha}` });
				}
				let newStatus = tenant.status;

				if (severity === 'error') {
					newStatus = 'failed';
				} else if (reason === 'ReconciliationSucceeded') {
					newStatus = 'ready';
				}

				if (newStatus !== tenant.status) {
					await itemsService.updateOne(tenant.id, { status: newStatus });
					console.log(`Tenant ${tenant.tenant_name} status updated to ${newStatus}`);
				}

				return res.status(200).send({ message: `Tenant ${tenant.tenant_name} status updated to ${newStatus}` });
			} else {
				console.log(`No tenant found for commit SHA: ${commitSha}`);
				return res.status(404).send({ message: `No tenant found for commit SHA: ${commitSha}` });
			}
		} catch (error) {
			console.error('Error processing webhook:', error);
			return res.status(500).send({ message: 'Internal Server Error' });
		}
	});
}) as any; 
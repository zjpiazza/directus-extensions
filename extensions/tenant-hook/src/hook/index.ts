import { defineHook } from '@directus/extensions-sdk';
import { loadAndHydrateTemplates } from '../common/templateHandlers.js';
import { getFileContent, upsertFiles } from '../common/github.js';
import process from 'node:process';
import dotenv from 'dotenv';
import { parse as parseYaml } from 'yaml';
import { HookConfig } from '@directus/extensions';

dotenv.config();

console.log('Tenant hook loaded')

interface Tenant {
    id: number;
    tenant_name: string;
    environment: string;
    admin_email: string;
    hostname: string;
    team_label: string;
    cpu_limit: string;
    cpu_request: string;
    memory_limit: string;
    memory_request: string;
    storage_size: string;
}

function createTemplateContext(tenant: Record<string, any>): Record<string, any> {
	const context: Record<string, any> = {};
	for (const key in tenant) {
		if (Object.prototype.hasOwnProperty.call(tenant, key)) {
			const upperCaseKey = key.toUpperCase();
			let value = tenant[key];

			if (typeof value === 'number') {
				if (upperCaseKey === 'CPU_LIMIT' || upperCaseKey === 'CPU_REQUEST') {
					value = `${value}m`;
				} else if (upperCaseKey === 'MEMORY_LIMIT' || upperCaseKey === 'MEMORY_REQUEST') {
					value = `${value}Mi`;
				} else if (upperCaseKey === 'STORAGE_SIZE') {
					value = `${value}Gi`;
				}
			}
			
			context[upperCaseKey] = value;
		}
	}
	return context;
}

async function upsertTenant(tenant: Tenant, itemsService: any) {
	const templateContext = createTemplateContext(tenant);
	const result = await loadAndHydrateTemplates(templateContext);

	const outputs = result.map(({ file, data }: { file: string, data: unknown }) => ({
		path: `tenants/${tenant.tenant_name}/${file}`,
		data,
	}));

	const owner = process.env.GITHUB_OWNER;
	const repo = process.env.GITHUB_REPO;
	const token = process.env.GITHUB_TOKEN;

	const kustomizationPath = 'tenants/kustomization.yaml';
	const kustomizationContent = await getFileContent({
		owner: owner!,
		repo: repo!,
		token: token!,
		path: kustomizationPath,
		ref: 'main'
	})

	let kustomizationData: any;
	if (kustomizationContent) {
		kustomizationData = parseYaml(kustomizationContent);
	} else {
		kustomizationData = {
			apiVersion: 'kustomize.config.k8s.io/v1beta1',
			kind: 'Kustomization',
			resources: [],
		}
	}

	if (!kustomizationData.resources) {
		kustomizationData.resources = [];
	}

	if (!kustomizationData.resources.includes(tenant.tenant_name)) {
		kustomizationData.resources.push(tenant.tenant_name);
		kustomizationData.resources.sort();
	}
	
	outputs.push({
		path: kustomizationPath,
		data: kustomizationData,
	});

	const commitSha = await upsertFiles({
		owner: owner!,
		repo: repo!,
		token: token!,
		branch: 'main',
		commitMessage: `Update tenant: ${tenant.tenant_name}`,
		outputs,
	});

	await itemsService.updateOne(tenant.id, {
		last_commit_sha: commitSha,
		status: 'reconciling',
	});
}

export default defineHook(({ action }, { services, getSchema }) => {
	const { ItemsService } = services;
	// Commit tenant properties to git using template
	// Force flux reconciliation

	action('items.update', async({ collection, payload, keys }) => {
		if (collection !== 'tenants') return;

		// Guard against recursive updates from this hook
		const payloadKeys = Object.keys(payload);
		if (payloadKeys.length <= 2 && (payloadKeys.includes('last_commit_sha') || payloadKeys.includes('status'))) {
			console.log('Skipping recursive hook trigger');
			return;
		}

		const itemsService = new ItemsService('tenants', { schema: await getSchema() });
		const tenant = await itemsService.readOne(keys[0]);

		console.log('Full tenant on update:', tenant);
		await upsertTenant(tenant as Tenant, itemsService);
	});

	action('items.delete', async({ collection, payload, keys }) => {
		if (collection !== 'tenants') return;
		console.log('Tenant deleted:', payload, keys);
	});

	// DEBUG: Listen for any item creation in any collection
	action('items.create', async({ collection, payload, key }) => {
		if (collection !== 'tenants') return;
		console.log('Tenant created:', payload, key);
		const itemsService = new ItemsService('tenants', { schema: await getSchema() });
		const tenant = await itemsService.readOne(key);
		await upsertTenant(tenant as Tenant, itemsService);
	});
}) as HookConfig;

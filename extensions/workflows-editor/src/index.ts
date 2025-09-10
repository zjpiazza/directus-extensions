import { defineEditor } from '@directus/extensions-sdk';
import EditorComponent from './WorkflowsEditor.vue';

export default defineEditor({
	id: 'workflow',
	name: 'Workflow',
	icon: 'box',
	component: EditorComponent,
});

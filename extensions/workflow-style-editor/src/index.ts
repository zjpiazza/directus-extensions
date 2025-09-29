import { defineEditor } from '@directus/extensions-sdk';
import EditorComponent from './editor.vue';

export default defineEditor({
	id: 'workflow-style',
	name: 'Workflow Style',
	icon: 'palette',
	component: EditorComponent,
});

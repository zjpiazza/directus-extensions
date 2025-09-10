import { defineEditor } from '@directus/extensions-sdk';
import EditorComponent from './editor.vue';

export default defineEditor({
	id: 'process-map',
	name: 'Process Map',
	icon: 'box',
	component: EditorComponent,
});

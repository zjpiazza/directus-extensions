declare module '*.vue' {
	import { DefineComponent } from 'vue';
	const component: DefineComponent<{}, {}, any>;
	export default component;
}

interface JQuery {
	boldReportViewer(options?: any): JQuery;
	data(key: string): any;
}

interface JQueryStatic {
	(selector: string | Document | Element): JQuery;
	ajax(settings: any): any;
}

declare const $: JQueryStatic;
declare const jQuery: JQueryStatic;

interface Window {
	$: JQueryStatic;
	jQuery: JQueryStatic;
	BoldReportViewerComponent?: any;
}

interface BoldReportItem {
	Id: string;
	Name: string;
	Description?: string;
	CategoryName?: string;
	ItemType?: number;
	CreatedDate?: string;
	ModifiedDate?: string;
}

interface BoldReportCategory {
	CategoryId: string;
	Name: string;
	Reports: BoldReportItem[];
}

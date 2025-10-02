export const DEFAULT_SEPARATOR_TEXT = 'SIGNED SERVICE PLAN';
export const DEFAULT_PHASE_COLOR = 'var(--theme--primary, #7c3aed)';

export interface PhaseConfig {
	id: string;
	title: string;
	color: string;
}

export const DEFAULT_PHASES: PhaseConfig[] = [
	{
		id: 'request_service',
		title: 'REQUEST SERVICE/REPORT',
		color: DEFAULT_PHASE_COLOR,
	},
	{
		id: 'evaluate_service',
		title: 'EVALUATE SERVICE',
		color: DEFAULT_PHASE_COLOR,
	},
	{
		id: 'provide_services',
		title: 'PROVIDE SERVICES AND REEVALUATE SERVICES',
		color: DEFAULT_PHASE_COLOR,
	},
	{
		id: 'end_of_service',
		title: 'END OF SERVICES',
		color: DEFAULT_PHASE_COLOR,
	},
];

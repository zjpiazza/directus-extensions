export function normalizeProgramKey(id: string | number | null | undefined): string {
	return id !== null && id !== undefined && id !== '' ? String(id) : 'default';
}

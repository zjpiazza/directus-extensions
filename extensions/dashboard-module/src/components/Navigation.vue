<template>
	<v-list nav>
		<v-list-item
			v-for="navItem in navItems"
			:key="navItem.to"
			:to="navItem.to"
		>
			<v-list-item-icon>
				<v-icon :name="navItem.icon" />
			</v-list-item-icon>
			<v-list-item-content>
				<v-text-overflow :text="navItem.label" />
			</v-list-item-content>
		</v-list-item>
	</v-list>
</template>

<script setup lang="ts">
interface NavigationItem {
	label: string;
	to: string;
	icon: string;
}

const navItems: NavigationItem[] = [
	{
		label: 'Cases',
		to: '/content/cases',
		icon: 'folder',
	},
	{
		label: 'Notes',
		to: '/content/notes',
		icon: 'note',
	},
	{
		label: 'Appointments',
		to: '/content/appointments',
		icon: 'event',
	},
];
</script>

<style scoped>
.v-list {
	padding: 12px;
}
</style>

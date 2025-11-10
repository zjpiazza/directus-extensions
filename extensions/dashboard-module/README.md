# Dashboard Module

A comprehensive dashboard module for Directus that provides an overview of case management activities.

## Features

### Stats Cards
- **Total Cases**: Displays total number of cases with month-over-month comparison
- **Active Cases**: Shows currently active cases with percentage of total
- **Completed This Week**: Highlights cases completed in the last 7 days

### Recent Cases
- Lists the 5 most recently updated cases
- Shows case number, name, status, category, and priority
- Displays time since last update
- Quick "View" button to navigate to each case
- "View All" button to see complete case list

### Quick Actions
- **Design Workflow**: Navigate to workflows management
- **Create Form**: Create new forms
- **Configure Framework**: Access system settings
- **Generate Report**: Open report viewer

## Components

### `StatsCard.vue`
Reusable card component for displaying statistics with optional icon and variant styling.

**Props:**
- `label` (string): Card title
- `value` (string | number): Main value to display
- `subtitle` (string): Supporting text
- `icon` (string, optional): Material icon name
- `variant` ('default' | 'success' | 'warning' | 'danger'): Color scheme

### `RecentCases.vue`
Fetches and displays recent case activity from the `cases` collection.

**API Calls:**
- `GET /items/cases` - Fetches 5 most recent cases sorted by `date_updated`

**Fields Used:**
- `id`, `case_number`, `name`, `status`, `category`, `priority`, `assigned_to`, `date_updated`

### `QuickActions.vue`
Grid of action buttons for common tasks and navigation.

**Actions:**
- Design Workflow → `/#/content/workflows`
- Create Form → `/#/content/forms`
- Configure Framework → `/#/settings`
- Generate Report → `/#/report-viewer`

## Installation

The module is automatically loaded by Directus when built.

```bash
cd extensions/dashboard-module
pnpm install
pnpm build
```

## Development

```bash
cd extensions/dashboard-module
pnpm dev
```

This will watch for changes and rebuild automatically.

## Dependencies

- `@directus/extensions-sdk` - Directus extension development kit
- `date-fns` - Date formatting and manipulation
- `vue` - Vue 3 framework
- `typescript` - TypeScript support

## Data Requirements

The dashboard expects a `cases` collection with the following fields:

### Required Fields
- `id` (UUID/String): Primary key
- `case_number` (String): Case identifier
- `name` (String): Case name/title
- `status` (String): Case status (e.g., 'active', 'closed')
- `date_created` (DateTime): When case was created
- `date_updated` (DateTime): Last update timestamp

### Optional Fields
- `category` (String): Case category (e.g., 'CPS', 'ICWA', 'CWS')
- `priority` (String): Priority level ('High', 'Medium', 'Low')
- `assigned_to` (String): Assigned user/worker name

## Customization

### Modifying Stats Calculations
Edit the `fetchStats()` function in `module.vue` to adjust how statistics are calculated.

### Changing Quick Actions
Modify the `actions` array in `QuickActions.vue` to add/remove/change action buttons.

### Adjusting Recent Cases Limit
Change the `limit` parameter in the API call within `RecentCases.vue`:

```typescript
params: {
  sort: '-date_updated',
  limit: 5, // Change this number
  ...
}
```

## Styling

The dashboard uses Directus CSS variables for theming:
- `--theme--background` - Main background
- `--theme--foreground` - Text color
- `--theme--primary` - Primary accent color
- `--theme--success` - Success/positive color
- `--theme--warning` - Warning color
- `--theme--danger` - Error/danger color

All components automatically adapt to the current Directus theme (light/dark mode).

## Navigation

The module is accessible via:
- Direct URL: `/#/dashboard`
- Module menu in Directus admin interface

## Troubleshooting

### Stats not loading
- Verify the `cases` collection exists
- Check browser console for API errors
- Ensure proper permissions for reading case data

### Components not displaying
- Run `pnpm build` to rebuild the extension
- Check Docker logs: `docker compose logs directus`
- Verify extension is loaded in Directus extensions panel

### Date formatting issues
- Ensure `date-fns` is installed: `pnpm install`
- Check that date fields contain valid ISO 8601 timestamps

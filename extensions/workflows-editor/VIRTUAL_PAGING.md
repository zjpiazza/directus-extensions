# Virtual Paging Feature

The Virtual Paging feature allows users to organize complex workflows into logical pages or sections, making it easier to navigate and manage large workflows.

## How It Works

### 1. Page Nodes
- A new node type called "Page" is available in the node palette
- Page nodes represent different sections or pages within your workflow
- Each page node has a name, description, and color
- Page nodes show the count of nodes contained within them

### 2. Page Navigation
- **In Edit Mode**: Page nodes can be created, edited, and connected like other nodes
- **In View Mode**: Clicking on a page node will "zoom into" that page, showing only the nodes that belong to that page
- A breadcrumb navigation bar appears at the top when viewing pages

### 3. Page Structure
- **Root Page**: The main workflow page (default view)
- **Sub-pages**: Created by adding Page nodes to the workflow
- **Page Hierarchy**: Pages can contain other pages, creating a nested structure

## Using Virtual Paging

### Creating a Page
1. Switch to Edit Mode
2. Drag a "Page" node from the node palette onto the canvas
3. Configure the page name, description, and color in the details sidebar
4. Connect the page node to other workflow elements as needed

### Adding Content to a Page
1. In Edit Mode, drag any node onto the canvas
2. Nodes are automatically assigned to the current page you're viewing
3. Use the page navigation to switch between pages while editing

### Navigating Pages
1. Switch to View Mode to enable page navigation
2. Click on any Page node to enter that page
3. Use the breadcrumb navigation at the top to go back to parent pages
4. The "Main" breadcrumb always returns you to the root page

### Page Management
- **Page Colors**: Each page can have a custom color for visual organization
- **Node Counts**: Page nodes automatically display how many nodes they contain
- **Nested Pages**: You can create pages within pages for complex workflows

## Benefits

1. **Organization**: Break large workflows into logical sections
2. **Focus**: View only relevant parts of the workflow at a time
3. **Navigation**: Easy movement between different workflow sections
4. **Scalability**: Handle complex workflows without visual clutter
5. **Hierarchy**: Create nested page structures for complex processes

## Data Structure

The virtual paging system extends the workflow data with:
- `pages`: Array of page definitions
- `currentPageId`: The currently active page
- Node `pageId`: Each node belongs to a specific page (defaults to 'root')

This feature is fully backward compatible - existing workflows will continue to work normally, with all nodes on the root page.
---
description: AI rules derived by SpecStory from the project AI interaction history
globs: *
---

## HEADERS

## PROJECT RULES

## CODING STANDARDS

## WORKFLOW & RELEASE RULES

## TECH STACK

## PROJECT DOCUMENTATION & CONTEXT SYSTEM

## DEBUGGING

When debugging Directus extensions, remember that `console.log` output appears in the server's stdout (terminal where Directus runs), not the Directus UI. Ensure the hook extension is loaded and enabled, the correct collection is being modified, and the Directus server is restarted after extension changes.

If a startup log (`console.log('Tenant hook loaded')`) is visible but specific item create/update/delete events are not triggering, double-check:

1. **Extension Registration:** Ensure the extension is in the correct folder (`extensions/hooks/tenant-hook` or similar) and named properly (`index.js`/`index.ts`).
2. **Check for Typos:** Ensure the collection name in the event listener is exactly correct (e.g., `tenants`), including case-sensitivity.
3. **Test a Global Event:** Temporarily add a handler for a more general event (like `action('items.create', ...`) to see if *any* item creation triggers a log. This helps determine if the issue is with the specific event name or the general event handling.

## REFERENCES

## BEST PRACTICES

### Event Handling

When needing to trigger an action only when an item is added, updated, or deleted from a specific collection (e.g., "tenants"), listen for the following Directus events:

- `items.create.[collection_name]` (e.g., `items.create.tenants`)
- `items.update.[collection_name]` (e.g., `items.update.tenants`)
- `items.delete.[collection_name]` (e.g., `items.delete.tenants`)

Use the `action` function to register handlers for these events in `index.ts`.

**Note:** In some Directus versions or extension SDKs, the `items.create.[collection_name]` event pattern may not work. Similarly, `items.update.[collection_name]` and `items.delete.[collection_name]` may also not work. In such cases, use the global event (e.g., `action('items.create', ...`) and check the `collection` parameter inside your handler:

```js
action('items.create', async ({ key, collection, payload }, { schema }) => {
  if (collection !== 'tenants') return;
  // Your logic for tenants collection
});
```

This pattern should also be used for update and delete events if the specific collection events are not triggering.

For `items.update` events, the `payload` only contains the fields that were changed, not the full item. To get the complete item, you need to fetch it manually using the `ItemsService` inside your hook.

For `items.update` and `items.delete` events, the `key` property is named `keys` (plural) and is an array of primary keys.
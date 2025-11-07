# Debug Rendering Issues Prompt

You are debugging rendering or display issues in a Directus extension Vue component. Use this systematic approach to identify and fix the problem.

## Debugging Steps

1. **Identify the Problem**
   - Describe what is appearing vs what should appear
   - Is it a CSS/styling issue, layout issue, or missing content?
   - Is it specific to certain conditions or always present?
   - Browser console errors? Network tab issues?

2. **Reproduce Systematically**
   - Verify the issue consistently
   - Test in different scenarios
   - Check if it's environment-specific (Docker, browser, etc.)
   - Narrow down to minimal reproduction case

3. **Check Common Issues**
   - CSS not loading or conflicting with Directus styles
   - Vue reactivity - is data being updated properly?
   - Conditional rendering - check v-if/v-show logic
   - Component mounting - is lifecycle correct?
   - Parent-child communication - are props/events correct?

4. **Browser DevTools**
   - Open browser console: Look for JavaScript errors
   - Check Elements tab: Is HTML structure correct?
   - Check Styles tab: Are CSS rules being applied?
   - Check Vue DevTools: Component state correct?
   - Network tab: Check for failed requests

5. **Build & File Issues**
   - Did you run `pnpm build` after changes?
   - Are files in the correct location?
   - Check dist/ folder has updated bundles
   - Clear browser cache (Ctrl+Shift+Delete)
   - Hard refresh page (Ctrl+Shift+R)

6. **Vue-Specific Issues**
   - Check component props are passed correctly
   - Verify reactive data is updated before rendering
   - Look for scope issues (this vs arrow functions)
   - Check computed properties are updating
   - Verify watchers are triggering correctly

7. **External Library Issues** (Vue Flow, etc.)
   - Check library version compatibility
   - Verify required CSS/dependencies are imported
   - Check documentation for specific requirements
   - Look for known issues in library repository

## Verification

After applying fix:
- Clear cache and hard refresh browser
- Verify rendering in different scenarios
- Check console for new errors
- Run build and tests to ensure no regressions
- Test in Docker environment if applicable

## Common Fixes

- Add missing CSS import or Directus style compatibility
- Fix v-if/v-show conditions
- Ensure reactive data triggers properly
- Update parent component state correctly
- Add missing props or slots
- Fix event handler binding

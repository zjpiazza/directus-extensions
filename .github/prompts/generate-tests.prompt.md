# Generate Test Cases Prompt

You are generating test cases for a Directus extension. Create comprehensive test coverage that validates functionality and edge cases.

## Test Case Requirements

1. **Test Structure**
   - Use Vitest test framework (the standard for this monorepo)
   - Follow existing test patterns in the project
   - Use descriptive test names that explain what is being tested
   - Group related tests in describe blocks

2. **Coverage Areas**
   - Happy path (normal expected behavior)
   - Edge cases (boundary conditions, empty values, etc.)
   - Error cases (invalid input, API failures, etc.)
   - Integration points (component → hook, interface → database, etc.)

3. **Test Types**

   **Unit Tests** - Test individual functions/components in isolation
   - Mock external dependencies
   - Verify return values and side effects
   - Test error handling

   **Integration Tests** - Test components working together
   - Verify data flow between components
   - Test hook filters with actual data
   - Validate interface → hook → database flow

   **Snapshot Tests** (if applicable) - Capture component output
   - Use for Vue component rendering
   - Update snapshots when intentional changes are made

4. **Mock Data**
   - Create realistic test data matching your field type
   - Include valid, invalid, and edge case examples
   - Mock external APIs and services

5. **Assertions**
   - Verify expected behavior
   - Check error messages and codes
   - Validate state changes
   - Confirm side effects

## Example Test Structure

```typescript
describe('Extension Name', () => {
  describe('specific function', () => {
    it('should handle normal input correctly', () => {
      // Test happy path
    });

    it('should handle edge cases', () => {
      // Test boundary conditions
    });

    it('should throw error for invalid input', () => {
      // Test error handling
    });
  });
});
```

Generate tests that are:
- Clear and maintainable
- Comprehensive but not redundant
- Fast to execute
- Independent and isolated

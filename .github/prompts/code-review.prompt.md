# Code Review Prompt

You are performing a code review of changes to a Directus extension. Evaluate the code for:

## Review Checklist

1. **Code Quality**
   - [ ] Code follows established patterns in the codebase
   - [ ] Naming is clear and consistent
   - [ ] Functions have single responsibility
   - [ ] No unnecessary complexity

2. **Architecture**
   - [ ] Changes align with extension architecture
   - [ ] Proper separation of concerns (interface vs hook)
   - [ ] Consistent with existing components
   - [ ] No circular dependencies or tight coupling

3. **Security**
   - [ ] No secrets or API keys exposed
   - [ ] Input validation where needed
   - [ ] No SQL injection vulnerabilities
   - [ ] Proper error handling without exposing internals

4. **Testing**
   - [ ] Unit tests for new logic
   - [ ] Tests verify expected behavior
   - [ ] Edge cases covered
   - [ ] Tests are maintainable and clear

5. **Documentation**
   - [ ] Changes are documented
   - [ ] Comments explain non-obvious logic
   - [ ] README/docs updated if needed
   - [ ] JSDoc comments for public APIs

6. **Performance**
   - [ ] No unnecessary re-renders (Vue components)
   - [ ] Efficient algorithms
   - [ ] No performance regressions
   - [ ] Appropriate caching where applicable

7. **Compliance**
   - [ ] No console.log debug statements left
   - [ ] Passes linting and type checking
   - [ ] No warnings in build output
   - [ ] Dependencies are necessary and up to date

## Provide Feedback

For each issue found:
- Explain what the issue is
- Reference the specific line(s) of code
- Suggest how to fix it
- Explain why this matters

Highlight positive aspects of the code as well.

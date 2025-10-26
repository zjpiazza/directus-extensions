# AGENTS.md - Tenant Hook Extension

## Quick Reference

**Type**: Hook extension
**Purpose**: Tenant management and isolation
**Technology**: Node.js hook

**For user-facing documentation, see**: [README.md](README.md)

## Development Guidelines

### Code Changes
- Always test changes locally before committing
- Use `pnpm build` after every change
- Remove debug console.log statements after confirming changes work
- Keep only essential logging (errors, critical state changes)

### Testing
- Test tenant isolation with multiple tenants
- Test data segregation between tenants
- Test access control enforcement
- Test with various collection types
- Monitor API logs for tenant operations
- Run tests with `pnpm test`

### File Structure
```
tenant-hook/
├── src/
│   └── index.ts              # Hook implementation
├── package.json
└── tsconfig.json
```

## Key Implementation Details

### Tenant Isolation
- Intercepts data operations to enforce tenant boundaries
- Filters data based on tenant context
- Prevents cross-tenant data access
- Maintains tenant metadata

### Access Control
- Validates tenant permissions
- Enforces tenant-based filtering
- Handles tenant context propagation
- Manages tenant-specific configurations

### Data Segregation
- Ensures data is properly isolated by tenant
- Prevents data leakage between tenants
- Maintains referential integrity within tenant boundaries
- Handles tenant-specific relationships

## Security Considerations

### Tenant Isolation
- **Critical**: Ensure complete tenant isolation
- Validate tenant context on every operation
- Prevent privilege escalation between tenants
- Audit tenant access patterns
- Test for data leakage vulnerabilities

## Important Rules

### Code Quality
- **NEVER** commit changes unless explicitly prompted
- Always test changes locally before any commits
- Use `pnpm build` after every change
- **ALWAYS remove debug console.log statements after user confirms changes work**

### Security
- Always validate tenant context
- Never trust client-provided tenant information
- Implement comprehensive audit logging
- Test for security vulnerabilities regularly

### Documentation & Research
- Always consult technical documentation when unsure
- Reference Directus hook documentation for event patterns
- Check existing hook extensions for implementation patterns

## Resources

- [Directus Extension Development Guide](https://docs.directus.io/extensions/)
- [Directus Hook Documentation](https://docs.directus.io/extensions/hooks/)


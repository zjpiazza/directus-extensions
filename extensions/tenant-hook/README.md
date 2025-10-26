# Tenant Hook Extension for Directus

A Directus hook extension that provides tenant management and isolation for multi-tenant applications.

## Features

- **Tenant isolation**: Enforces complete data isolation between tenants
- **Access control**: Manages tenant-based access permissions
- **Data segregation**: Ensures data is properly isolated by tenant
- **Tenant context**: Propagates tenant context through operations
- **Audit logging**: Tracks tenant-specific operations
- **Security-focused**: Designed with multi-tenant security in mind

## Installation

To install the extension, follow the [Official Directus Guide](https://docs.directus.io/extensions/installing-extensions.html).

### Quick Start

1. Copy the extension to your Directus extensions directory
2. Run `pnpm build` to build the extension
3. Restart Directus
4. The extension will be automatically loaded

## Usage

The tenant-hook extension automatically manages tenant isolation and access control. No additional configuration is required for basic functionality.

### Tenant Context

The hook automatically:
- Detects the current tenant from the request context
- Filters data based on tenant boundaries
- Prevents cross-tenant data access
- Maintains tenant metadata

### Data Isolation

- Each tenant's data is completely isolated
- Queries are automatically filtered by tenant
- Cross-tenant access is prevented
- Referential integrity is maintained within tenant boundaries

## Configuration

The extension works out of the box with no additional configuration required. Tenant isolation is automatically applied to all collections.

### Advanced Configuration

For custom tenant identification or filtering:
1. Review the extension's AGENTS.md for development guidelines
2. Modify the hook implementation as needed
3. Rebuild the extension with `pnpm build`

## Development

### Building

```bash
cd extensions/tenant-hook
pnpm build
```

### Testing

```bash
cd extensions/tenant-hook
pnpm test
```

### File Structure

```
tenant-hook/
├── src/
│   └── index.ts              # Hook implementation
├── package.json
└── tsconfig.json
```

## How It Works

### Tenant Isolation

The hook provides:
- Tenant context detection from request
- Automatic data filtering by tenant
- Prevention of cross-tenant access
- Tenant metadata management

### Access Control

- Validates tenant permissions on operations
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

### Best Practices

1. **Validate context**: Always validate tenant context
2. **Never trust client**: Don't trust client-provided tenant information
3. **Audit logging**: Implement comprehensive audit logging
4. **Regular testing**: Test for security vulnerabilities regularly
5. **Access control**: Implement strict access control policies

## Monitoring

### Checking Tenant Operations

1. Check Directus API logs for tenant operations
2. Monitor for cross-tenant access attempts
3. Review audit logs for suspicious activity
4. Monitor system performance

### Debugging

Enable debug logging to see tenant operations:
1. Check the extension's AGENTS.md for debugging guidelines
2. Review API logs for tenant context details
3. Check for any isolation violations
4. Monitor performance impact

## Troubleshooting

### Tenant isolation not working

1. Verify the extension is loaded: Check Directus logs
2. Check that `pnpm build` completed successfully
3. Restart Directus
4. Review API logs for errors

### Data leakage between tenants

1. Check tenant context detection
2. Verify filtering is applied correctly
3. Review hook implementation
4. Check for any bypass vulnerabilities

### Performance issues

1. Check the number of tenants
2. Review filtering performance
3. Monitor system resources
4. Consider optimizing queries

## Technical Details

- **Type**: Hook extension
- **Technology**: Node.js
- **Directus Version**: Compatible with Directus 9.0+
- **License**: See LICENSE file

## Support

For issues or questions:
1. Check the [Directus Documentation](https://docs.directus.io/)
2. Review the extension's AGENTS.md for development guidelines
3. Check the API logs for error messages


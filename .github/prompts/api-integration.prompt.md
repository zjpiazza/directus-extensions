# API Integration Prompt

You are implementing or debugging API integration in a Directus extension. Use this guide to ensure proper communication between client-side extension code and external APIs or Directus endpoints.

## API Integration Checklist

1. **Planning Integration**
   - [ ] Identify if it's external API or Directus endpoint
   - [ ] Understand authentication requirements
   - [ ] Plan error handling strategy
   - [ ] Consider rate limiting and timeouts
   - [ ] Plan for offline scenarios if applicable

2. **Authentication & Authorization**
   - [ ] Use appropriate auth method (API key, token, OAuth, etc.)
   - [ ] Never expose secrets in frontend code
   - [ ] Store sensitive data in hooks/backend
   - [ ] Validate user permissions if needed
   - [ ] Handle token refresh/expiration

3. **Request Configuration**
   - [ ] Set correct HTTP method (GET, POST, etc.)
   - [ ] Configure headers properly (Content-Type, Authorization, etc.)
   - [ ] Format request body correctly
   - [ ] Include necessary query parameters
   - [ ] Set appropriate timeout values

4. **Error Handling**
   - [ ] Catch network errors
   - [ ] Handle HTTP error codes (4xx, 5xx)
   - [ ] Provide meaningful error messages to users
   - [ ] Log errors for debugging
   - [ ] Implement retry logic if appropriate

5. **Response Handling**
   - [ ] Validate response structure
   - [ ] Parse JSON correctly
   - [ ] Handle empty/null responses
   - [ ] Update component state appropriately
   - [ ] Provide loading/success/error states

6. **Performance**
   - [ ] Use debouncing for frequent requests
   - [ ] Cache results when appropriate
   - [ ] Cancel pending requests when component unmounts
   - [ ] Avoid unnecessary API calls
   - [ ] Monitor for excessive requests

7. **Testing**
   - [ ] Mock API responses in tests
   - [ ] Test success paths
   - [ ] Test error scenarios
   - [ ] Test timeout handling
   - [ ] Test rate limiting behavior

## Common Patterns

**Fetch Pattern:**
```typescript
async function fetchData(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}
```

**Hook Integration:**
- Use backend hooks for API calls requiring secrets
- Validate data in hooks before database operations
- Return modified data to hook pipeline

**Interface Integration:**
- Show loading state during requests
- Handle errors gracefully in UI
- Disable buttons/inputs during loading
- Display user-friendly error messages

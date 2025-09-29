# Address Completion Interface for Directus (Smarty Edition)

A Directus interface that integrates Smarty's US Autocomplete API for accurate address autocompletion.

![](https://raw.githubusercontent.com/directus-labs/extensions/main/packages/address-completion-interface/docs/interface.png)

## Features
- Smarty US Autocomplete Pro API integration with embedded key authentication
- Real-time address suggestions as you type
- Support for multi-unit addresses (apartments, suites)
- Customizable filtering by states, cities, or ZIP codes
- High accuracy address validation
- GeoJSON output format with coordinates via geocoding
- Secure authentication using embedded keys (no environment variables needed)

## Prerequisites
- A Directus installation
- Smarty account with embedded key credentials
- US Autocomplete Pro subscription

## Migration from Google Places

This extension has been migrated from Google Places API to Smarty's US Autocomplete API for better accuracy and reliability. If you're upgrading from the previous Google version:

1. **Remove Google-specific configuration**: The Google Maps API key field has been replaced with Smarty embedded key
2. **Update CSP directives**: Remove Google-specific CSP directives and add Smarty endpoints if needed
3. **No more map display**: The map functionality has been removed to focus on core address completion

## Installation
To install the extension, take a look at the [Official Guide](https://docs.directus.io/extensions/installing-extensions.html).

## Configuration

### Ready to Use
This extension comes with a pre-configured Smarty embedded key that works out of the box. No additional API setup is required.

### About the Embedded Key
The extension uses Smarty's **embedded key authentication**, which is:
- **Frontend-safe**: Designed specifically for client-side applications
- **Domain-restricted**: Configured to work with common development and production domains
- **Rate-limited**: Includes automatic protection against API abuse
- **Secure**: Safe to include in source code and version control

## Interface Configuration

When setting up the interface in Directus, configure these options:

### Optional Settings
- **Max Results**: Maximum number of suggestions to display (1-10, default: 10)
- **Include Only States**: Limit results to specific states (e.g., "CA;NY;TX")
- **Include Only Cities**: Limit results to specific cities and states (e.g., "DENVER,AURORA,CO;OMAHA,NE")
- **Icon Left/Right**: Icons to display on the input field

### Example Configuration

To restrict results to California addresses only:
- **Include Only States**: `CA`

To restrict results to specific cities:
- **Include Only Cities**: `LOS ANGELES,SANTA MONICA,CA;NEW YORK,NY`

## API Features

### Address Filtering
The extension supports Smarty's powerful filtering capabilities:

- **State filtering**: Limit results to specific states
- **City filtering**: Limit results to specific cities within states
- **Geographic preferences**: Automatically prefer addresses near the user's location

### Multi-Unit Support
The extension handles addresses with multiple units (apartments, suites) by:
1. Showing the base address with entry count (e.g., "123 Main St Apt (15 entries)")
2. Allowing users to select and expand to see individual unit numbers
3. Supporting further filtering by typing additional characters

### Performance Optimizations
- **Debounced requests**: API calls are debounced to reduce request volume
- **Minimum character requirement**: Requires at least 3 characters before making requests
- **Error handling**: Comprehensive error handling with user-friendly messages

## Data Format

The extension outputs data in GeoJSON format for compatibility:

```json
{
  "geometry": {
    "coordinates": [-118.2437, 34.0522],
    "type": "Point"
  },
  "properties": {
    "displayName": "123 Main St, Los Angeles, CA 90210",
    "country": "US",
    "administrativeArea": "CA",
    "postalCode": "90210",
    "formated": "123 Main St, Los Angeles, CA 90210",
    "streetLine": "123 Main St",
    "secondary": "",
    "city": "Los Angeles",
    "state": "CA"
  },
  "type": "Feature"
}
```

**Note**: Coordinates are automatically geocoded using OpenStreetMap's Nominatim service, providing accurate latitude/longitude data for spatial operations.

## Limitations

1. **US addresses only**: Smarty's US Autocomplete API only supports United States addresses
2. **Geocoding accuracy**: Uses OpenStreetMap Nominatim for geocoding which provides good accuracy but may vary by location
3. **Internet dependency**: Both Smarty API and OpenStreetMap services require active internet connection
4. **No map display**: This extension focuses on address completion only and does not include map visualization

## Troubleshooting

### Common Issues

1. **No suggestions appearing**:
   - Check that you have an active internet connection
   - Ensure you have at least 3 characters typed in the address field
   - Check browser console for API errors
   - Verify Smarty service status

2. **Authentication errors (401)**:
   - This should not occur with the pre-configured embedded key
   - Check browser console for specific error messages
   - Verify you're accessing from a supported domain

3. **Rate limiting (429)**:
   - The embedded key includes rate limiting protection
   - If you encounter frequent rate limits, consider spacing out requests
   - Check usage patterns and consider implementing additional debouncing

3. **Payment required errors (402)**:
   - Check your Smarty subscription status
   - Verify you have the US Autocomplete Pro license
   - Monitor your API usage limits in the Smarty dashboard

4. **Filtering not working**:
   - Check the format of your filter strings (refer to Smarty documentation)
   - Ensure state abbreviations are uppercase (e.g., "CA" not "ca")

5. **Geocoding failures**:
   - The extension will fallback to center of US coordinates if geocoding fails
   - Check that the address format is recognizable by OpenStreetMap
   - Verify internet connection to nominatim.openstreetmap.org

### Rate Limits
Embedded keys include automatic rate limiting protection. Monitor your usage through the Smarty dashboard to avoid unexpected charges.

## Development

To build the extension:

```bash
npm run build
```

To develop with hot reloading:

```bash
npm run dev
```

### Security Best Practices

- ✅ **Embedded keys are safe** for frontend applications like this Directus interface
- ✅ **Rate limiting included** with automatic protection against API abuse  
- ✅ **Domain-restricted** for additional security
- ✅ **No secrets exposed** - embedded keys are designed for client-side use

## Resources

- [Smarty Documentation](https://www.smarty.com/docs)
- [US Autocomplete Pro API Reference](https://www.smarty.com/docs/cloud/us-autocomplete-pro-api)
- [Smarty Authentication Guide](https://www.smarty.com/docs/cloud/authentication)
- [Directus Extension Development Guide](https://docs.directus.io/extensions/)

## Support

- **Smarty Support**: support@smarty.com or 801-877-5778
- **Extension Issues**: Use the GitHub issues section of this repository

## License

MIT License - see LICENSE file for details.

## Attribution

Address data and autocomplete powered by [Smarty](https://www.smarty.com/).  
Geocoding data © [OpenStreetMap](https://www.openstreetmap.org/) contributors.
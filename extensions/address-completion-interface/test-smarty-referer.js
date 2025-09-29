// Updated test script with proper Referer header for embedded key authentication
const embeddedKey = '245269834312558164';
const baseUrl = 'https://us-autocomplete-pro.api.smarty.com/lookup';

async function testSmartyAPIWithReferer(searchTerm) {
    console.log(`\n🧪 Testing Smarty API with search term: "${searchTerm}"`);
    
    const params = new URLSearchParams({
        key: embeddedKey,
        search: searchTerm,
        max_results: '5'
    });
    
    const url = `${baseUrl}?${params.toString()}`;
    console.log(`🔗 Request URL: ${url}`);
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Referer': 'http://localhost',  // Required for embedded keys
                'Origin': 'http://localhost'    // Additional header that might help
            },
        });
        
        console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ API Error: ${errorText}`);
            
            if (response.status === 401) {
                console.log(`\n💡 Troubleshooting 401 Error:`);
                console.log(`- Embedded key might not be configured for 'localhost' domain`);
                console.log(`- Key might be restricted to specific hostnames`);
                console.log(`- Key might need to be activated in Smarty account`);
                console.log(`- Current environment might be detected as cloud/VPN`);
            }
            
            return null;
        }
        
        const data = await response.json();
        console.log(`✅ Success! Found ${data.suggestions?.length || 0} suggestions`);
        
        if (data.suggestions && data.suggestions.length > 0) {
            console.log('\n📍 Address Suggestions:');
            data.suggestions.forEach((suggestion, index) => {
                const fullAddress = `${suggestion.street_line}${suggestion.secondary ? ' ' + suggestion.secondary : ''} ${suggestion.city}, ${suggestion.state} ${suggestion.zipcode}`;
                console.log(`  ${index + 1}. ${fullAddress}${suggestion.entries > 1 ? ` (${suggestion.entries} entries)` : ''}`);
            });
        }
        
        return data;
    } catch (error) {
        console.error(`❌ Network Error: ${error.message}`);
        return null;
    }
}

async function runTestsWithReferer() {
    console.log('🚀 Starting Smarty API Integration Tests with Referer Header');
    console.log(`🔑 Using Embedded Key: ${embeddedKey}`);
    console.log(`🌐 Setting Referer: http://localhost`);
    
    // Test one address to see if referer helps
    const result = await testSmartyAPIWithReferer('1600 Amphitheatre');
    
    if (result) {
        console.log('\n🎉 Authentication successful! Testing more addresses...');
        
        const additionalTests = [
            '123 Main St',
            '350 5th Ave New',
            'Times Square'
        ];
        
        for (const testCase of additionalTests) {
            await testSmartyAPIWithReferer(testCase);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
        }
    } else {
        console.log('\n🔧 Next steps to resolve 401 error:');
        console.log('1. Log into your Smarty account at https://www.smarty.com/account/keys');
        console.log('2. Find your embedded key and click to edit it');
        console.log('3. Add "localhost" as an authorized hostname/host');
        console.log('4. Alternatively, add your current IP address as an authorized host');
        console.log('5. If testing from a cloud environment, you may need to whitelist the IP');
        console.log('6. Verify the key is active and has available quota');
    }
    
    console.log('\n🎉 Test completed!');
}

// Run the tests with proper headers
runTestsWithReferer().catch(console.error);
// Test script to verify Smarty API integration with embedded key
const embeddedKey = '245269836787802929';
const baseUrl = 'https://us-autocomplete-pro.api.smarty.com/lookup';

async function testSmartyAPI(searchTerm) {
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
            },
        });
        
        console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ API Error: ${errorText}`);
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

async function runTests() {
    console.log('🚀 Starting Smarty API Integration Tests');
    console.log(`🔑 Using Embedded Key: ${embeddedKey}`);
    
    // Test various search scenarios
    const testCases = [
        '1600 Amphitheatre',  // Famous address
        '123 Main St',        // Common street name
        '350 5th Ave New',    // Partial address
        'Times Square'        // Landmark
    ];
    
    for (const testCase of testCases) {
        await testSmartyAPI(testCase);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
    }
    
    console.log('\n🎉 Test completed!');
}

// Run the tests
runTests().catch(console.error);
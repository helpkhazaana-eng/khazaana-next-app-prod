import https from 'https';

const SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;

if (!SCRIPT_URL) {
  console.error('❌ No NEXT_PUBLIC_GOOGLE_SCRIPT_URL found in environment.');
  process.exit(1);
}

console.log(`Testing Connection to: ${SCRIPT_URL}`);

const data = JSON.stringify({ action: 'getDashboardData' });

async function test() {
  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: data,
      headers: { 'Content-Type': 'application/json' },
      redirect: 'follow'
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    const text = await response.text();
    if (response.ok) {
        try {
            const json = JSON.parse(text);
            if (json.success) {
                console.log('✅ Connection Successful!');
                console.log('Stats:', json.stats);
            } else {
                console.log('⚠️ Connected, but script returned error:', json.error);
            }
        } catch (e) {
            console.log('❌ Response is not JSON. Likely HTML error page.');
            console.log('First 200 chars:', text.substring(0, 200));
        }
    } else {
        console.log('❌ HTTP Error');
        console.log(text.substring(0, 500));
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

test();

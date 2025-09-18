const axios = require('axios');

const testTallyConnection = async () => {
  try {
    const response = await axios.post('http://localhost:9000', `
      <ENVELOPE>
        <HEADER>
          <TALLYREQUEST>Export Data</TALLYREQUEST>
        </HEADER>
        <BODY>
          <EXPORTDATA>
            <REQUESTDESC>
              <REPORTNAME>Company Info</REPORTNAME>
            </REQUESTDESC>
          </EXPORTDATA>
        </BODY>
      </ENVELOPE>`, {
      headers: { 'Content-Type': 'application/xml' },
      timeout: 5000
    });
    
    console.log('✅ Tally connection successful!');
    console.log('Response status:', response.status);
  } catch (error) {
    console.log('❌ Tally connection failed:', error.message);
    console.log('Make sure Tally Prime is running with API enabled on port 9000');
  }
};

testTallyConnection();
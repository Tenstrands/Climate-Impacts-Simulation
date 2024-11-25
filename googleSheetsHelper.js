const { google } = require('googleapis');
const path = require('path');

// Function to fetch data from Google Sheets - all rows for range not just cell 
async function fetchSheetData(range) {
    const auth = new google.auth.GoogleAuth({
        keyFile: path.join(__dirname, 'secrets.json'), 
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    const client = await auth.getClient();
    const googleSheets = google.sheets({ version: "v4", auth: client });
    const spreadsheetId =  "1EJdVtnFB-dDWRqzHt2jjtOfaY-tSlZDu61I1OStb71s"
    
    //"1-rvi3PNMDuWcmdiqJNDjwkDTFlTU5tSKG5Q4_g1ngcI";

    try {
        const response = await googleSheets.spreadsheets.values.get({
            auth,
            spreadsheetId,
            range,
        });
        return response.data.values;
    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
        throw error;
    }
}

// Helper function to extract data for a specific county or condition
const getDataForCounty = (rows, county, resultColumnIndex) => {
    let result = null;
    for (const row of rows) {
      if (row[0] === county) {  // Assuming county is in the first column (A)
        result = row[resultColumnIndex];  // Get the value from the specified column
        break;
      }
    }
    return result;
  };

// Export the function to use it in other files
module.exports = {
    fetchSheetData,
    getDataForCounty
};

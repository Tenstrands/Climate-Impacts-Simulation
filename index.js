const express = require('express');
const path = require('path');
const { fetchSheetData, getDataForCounty } = require('./googleSheetsHelper');
const app = express();
const port = 3000;

// Setup EJS as the templating engine
app.set('view engine', 'ejs');

// Serve static files (like CSS) from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));  // To parse form data from POST requests


// Route for Home Page, api call to get list of counties 
app.get('/', async (req, res) => {
    try {
      const county_list_range = "CIS Data and Tracker!A:A"
      const county_list_rows = await fetchSheetData(county_list_range);
  
      // Extract the dropdown options from the first column
      const counties = county_list_rows ? county_list_rows.map(row => row[0]) : [];
  
      // Render the home page and pass the counties data to the template
      res.render('index', { counties });
    } catch (error) {
      console.error("Error fetching data from Google Sheets", error);
      res.status(500).send("Error fetching data from Google Sheets");
    }
  });

//POST for selecting a county 
app.post('/set-county', (req, res) => {
    const selectedCounty = req.body.county;  // Get the selected county from the form  
    res.redirect(`/fetch-county?county=${encodeURIComponent(selectedCounty)}`);
  });

//redirect to high_heat path 
app.get('/fetch-county', async (req, res) => {
    const selectedCounty = req.query.county;  // Get the selected county from query parameter
    // const range = "COUNTY High Heat!A:T";  // Change this range as necessary
    const range = "CIS Data and Tracker!A:B";  // Change this range as necessary

    try {
        const rows = await fetchSheetData(range);
        let result = getDataForCounty(rows, selectedCounty, 1);

        // Redirect the user to the "high_heat" page with the result
        res.redirect(`/county_description?county=${selectedCounty}&result=${encodeURIComponent(result || "No result found")}`);

    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
        res.redirect(`/county_description?county=${selectedCounty}&result=${encodeURIComponent("Error fetching data")}`);
    }
});

//route for county description 
app.get('/county_description', (req, res) => {
    const county = req.query.county; // Get county from query parameter
    const result = req.query.result; // Get result from query parameter

    res.render('county_description', { county, result });
});

//get info for high heat route
app.get('/fetch-high-heat', async (req, res) => {
    const selectedCounty = req.query.county;  // Get the selected county from query parameter
    const range = "COUNTY High Heat!A:T";  // Change this range as necessary

    try {
        const rows = await fetchSheetData(range);
        let result = getDataForCounty(rows, selectedCounty, 16);

        // Redirect the user to the "high_heat" page with the result
        res.redirect(`/high_heat?county=${selectedCounty}&result=${encodeURIComponent(result || "No result found")}`);

    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
        res.redirect(`/high_heat?county=${selectedCounty}&result=${encodeURIComponent("Error fetching data")}`);
    }
});

// Route for High Heat Page
app.get('/high_heat', (req, res) => {
    const county = req.query.county; // Get county from query parameter
    const result = req.query.result; // Get result from query parameter

    res.render('high_heat', { county, result });
});


//get info for sea level rise route
app.get('/fetch-sea-level-rise', async (req, res) => {
    const selectedCounty = req.query.county;  // Get the selected county from query parameter
    const range = "COUNTY Sea Level Rise!A:L";  // Change this range as necessary

    try {
        const rows = await fetchSheetData(range);
        let result = getDataForCounty(rows, selectedCounty, 8);

        // Redirect the user to the "high_heat" page with the result
        res.redirect(`/sea_level_rise?county=${selectedCounty}&result=${encodeURIComponent(result || "No result found")}`);

    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
        res.redirect(`/sea_level_rise?county=${selectedCounty}&result=${encodeURIComponent("Error fetching data")}`);
    }
});

// Route for sea level rise 
app.get('/sea_level_rise', (req, res) => {
    const county = req.query.county; // Get county from query parameter
    const result = req.query.result; // Get result from query parameter

    res.render('sea_level_rise', { county, result });
});


//get info for precipitation_and_storms route
app.get('/fetch-precipitation-and-storms', async (req, res) => {
    const selectedCounty = req.query.county;  // Get the selected county from query parameter
    const range = "COUNTY Precipitation and Storms!A:AF";  // Change this range as necessary

    try {
        const rows = await fetchSheetData(range);
        let result = getDataForCounty(rows, selectedCounty, 28);

        // Redirect the user to the "high_heat" page with the result
        res.redirect(`/precipitation_and_storms?county=${selectedCounty}&result=${encodeURIComponent(result || "No result found")}`);

    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
        res.redirect(`/precipitation_and_storms?county=${selectedCounty}&result=${encodeURIComponent("Error fetching data")}`);
    }
});

// Route for precipitation_and_storms
app.get('/precipitation_and_storms', (req, res) => {
    const county = req.query.county; // Get county from query parameter
    const result = req.query.result; // Get result from query parameter

    res.render('precipitation_and_storms', { county, result });
});

//get info for wildfires route
app.get('/fetch-wildfires', async (req, res) => {
    const selectedCounty = req.query.county;  // Get the selected county from query parameter
    const range = "COUNTY Wildfires!A:U";  // Change this range as necessary

    try {
        const rows = await fetchSheetData(range);
        let result = getDataForCounty(rows, selectedCounty, 17);

        // Redirect the user to the "high_heat" page with the result
        res.redirect(`/wildfires?county=${selectedCounty}&result=${encodeURIComponent(result || "No result found")}`);

    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
        res.redirect(`/wildfires?county=${selectedCounty}&result=${encodeURIComponent("Error fetching data")}`);
    }
});

// Route for wildfires
app.get('/wildfires', (req, res) => {
    const county = req.query.county; // Get county from query parameter
    const result = req.query.result; // Get result from query parameter

    res.render('wildfires', { county, result });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

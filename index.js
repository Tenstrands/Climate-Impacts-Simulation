const express = require('express');
const path = require('path');
const { fetchSheetData, getDataForCounty, getNarrative } = require('./googleSheetsHelper');
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
      const county_list_range = "CIS Data and Tracker!A2:A"
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
    const selectedYear = req.body.year;
    const selectedBiome = req.body.biome;
    res.redirect(`/global-narrative?county=${encodeURIComponent(selectedCounty)}&biome=${encodeURIComponent(selectedBiome)}&year=${encodeURIComponent(selectedYear)}`);
  });

app.get('/global-narrative', async (req, res) => {
    const selectedCounty = req.query.county;  
    const selectedYear = req.query.year;
    const selectedBiome = req.query.biome;
    switch(selectedYear) {
        case "2025":
            res.render('2025_global_narrative', { selectedCounty, selectedBiome, selectedYear });
            break;
        case "2035":
            res.render('2035_global_narrative', { selectedCounty, selectedBiome, selectedYear });
            break;
        case "2045":
            res.render('2045_global_narrative', { selectedCounty, selectedBiome, selectedYear });
            break;
        case "2055":
            res.render('2055_global_narrative', { selectedCounty, selectedBiome, selectedYear });
            break;
        default:
            throw new Error(`Invalid year selected: ${selectedYear}`);
    }   
  });

//get data for county description 
app.get('/fetch-county', async (req, res) => {
    const selectedCounty = req.query.county;  // Get the selected county from query parameter
    const selectedYear = req.query.year;
    const selectedBiome = req.query.biome;
    const range = "CIS Data and Tracker!A2:B";  // Change this range as necessary

    try {
        const rows = await fetchSheetData(range);
        let result = getDataForCounty(rows, selectedCounty, 1);

        // Redirect the user to the "high_heat" page with the result
        res.redirect(`/county_description?county=${selectedCounty}&biome=${encodeURIComponent(selectedBiome)}&year=${encodeURIComponent(selectedYear)}&result=${encodeURIComponent(result || "No result found")}`);

    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
        res.redirect(`/county_description?county=${selectedCounty}&year=${encodeURIComponent(selectedYear)}&result=${encodeURIComponent("Error fetching data")}`);
    }
});

//route for county description 
app.get('/county_description', (req, res) => {
    const county = req.query.county; // Get county from query parameter
    const result = req.query.result; // Get result from query parameter
    const selectedBiome = req.query.biome
    const selectedYear = req.query.year;
    res.render('county_description', { county, selectedYear, selectedBiome, result });
});

//get info for high heat route
app.get('/fetch-high-heat', async (req, res) => {
    const selectedCounty = req.query.county;  // Get the selected county from query parameter
    const selectedYear = req.query.year;
    const selectedBiome = req.query.biome;
    const impactType = "High Heat"
    let range = "COUNTY High Heat!A2:U";  // Change this range as necessary
    try {
        // console.log('Selected County:', selectedCounty);
        // console.log('Selected Year:', selectedYear);
        // console.log('Selected Biome:', selectedBiome);
        // console.log('Selected Impact:', impactType);

        let rows = await fetchSheetData(range);
        let impactLevel = getDataForCounty(rows, selectedCounty, 20)
        let high_heat_threshold = getDataForCounty(rows, selectedCounty, 3)
        console.log('High Heat Level:', high_heat_threshold);

        let result;
        switch(selectedYear) {
            case "2025":
                range = "Narratives 2025!A2:D";
                rows = await fetchSheetData(range);
                result = getNarrative(rows, selectedBiome, impactLevel, impactType);
                break;
            case "2035":
                range = "Narratives 2025!A2:D";
                rows = await fetchSheetData(range);
                result = getNarrative(rows, selectedBiome, impactLevel, impactType);
                break;
            case "2045":
                range = "Narratives 2025!A2:D";
                rows = await fetchSheetData(range);
                result = getNarrative(rows, selectedBiome, impactLevel, impactType);
                break;
            case "2055":
                range = "Narratives 2025!A2:D";
                rows = await fetchSheetData(range);
                result = getNarrative(rows, selectedBiome, impactLevel, impactType);
                break;
            default:
                throw new Error(`Invalid year selected: ${selectedYear}`);
        }   

        // Redirect the user to the "high_heat" page with the result
        res.redirect(`/high_heat?county=${selectedCounty}&year=${encodeURIComponent(selectedYear)}&biome=${encodeURIComponent(selectedBiome)}&high_heat_threshold=${encodeURIComponent(high_heat_threshold)}&result=${encodeURIComponent(result || "No result found")}`);

    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
        res.redirect(`/high_heat?county=${selectedCounty}&year=${encodeURIComponent(selectedYear)}&biome=${encodeURIComponent(selectedBiome)}&result=${encodeURIComponent("Error fetching data")}`);
    }
});

// Route for High Heat Page
app.get('/high_heat', (req, res) => {
    const county = req.query.county; // Get county from query parameter
    const result = req.query.result; // Get result from query parameter
    const selectedYear = req.query.year;
    const selectedBiome = req.query.biome;
    const high_heat_threshold = req.query.high_heat_threshold;
    console.log('High Heat Level:', high_heat_threshold);
    res.render('high_heat', { county, selectedYear, result, selectedBiome, high_heat_threshold });
});


//get info for sea level rise route
app.get('/fetch-sea-level-rise', async (req, res) => {
    const selectedCounty = req.query.county;  // Get the selected county from query parameter
    const selectedYear = req.query.year;
    const selectedBiome = req.query.biome;
    const impactType = "Sea Level Rise"
    let range = "COUNTY Sea Level Rise!A2:H";  // Change this range as necessary
    try {
        console.log('Selected County:', selectedCounty);
        console.log('Selected Year:', selectedYear);
        console.log('Selected Biome:', selectedBiome);
        console.log('Selected Impact:', impactType);

        let rows = await fetchSheetData(range);
        let impactLevel = getDataForCounty(rows, selectedCounty, 7)
        console.log('Impact Level:', impactLevel);

        let result;
        switch(selectedYear) {
            case "2025":
                range = "Narratives 2025!A2:D";
                rows = await fetchSheetData(range);
                result = getNarrative(rows, selectedBiome, impactLevel, impactType);
                break;
            case "2035":
                range = "Narratives 2025!A2:D";
                rows = await fetchSheetData(range);
                result = getNarrative(rows, selectedBiome, impactLevel, impactType);
                break;
            case "2045":
                range = "Narratives 2025!A2:D";
                rows = await fetchSheetData(range);
                result = getNarrative(rows, selectedBiome, impactLevel, impactType);
                break;
            case "2055":
                range = "Narratives 2025!A2:D";
                rows = await fetchSheetData(range);
                result = getNarrative(rows, selectedBiome, impactLevel, impactType);
                break;
            default:
                throw new Error(`Invalid year selected: ${selectedYear}`);
        }   

        // Redirect the user to the "high_heat" page with the result
        res.redirect(`/sea_level_rise?county=${selectedCounty}&year=${encodeURIComponent(selectedYear)}&biome=${encodeURIComponent(selectedBiome)}&result=${encodeURIComponent(result || "No result found")}`);

    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
        res.redirect(`/sea_level_rise?county=${selectedCounty}&year=${encodeURIComponent(selectedYear)}&biome=${encodeURIComponent(selectedBiome)}&result=${encodeURIComponent("Error fetching data")}`);
    }
});

// Route for sea level rise 
app.get('/sea_level_rise', (req, res) => {
    const county = req.query.county; // Get county from query parameter
    const result = req.query.result; // Get result from query parameter
    const selectedYear = req.query.year;
    const selectedBiome = req.query.biome;


    res.render('sea_level_rise', { county, result, selectedYear, selectedBiome });
});


//get info for precipitation_and_storms route
app.get('/fetch-precipitation-and-storms', async (req, res) => {
    const selectedCounty = req.query.county;  // Get the selected county from query parameter
    const selectedYear = req.query.year;
    const selectedBiome = req.query.biome;
    const impactType = "Precipitation and Rainstorms"
    let range = "COUNTY Precipitation and Storms!A2:AC";  // Change this range as necessary
    try {
        console.log('Selected County:', selectedCounty);
        console.log('Selected Year:', selectedYear);
        console.log('Selected Biome:', selectedBiome);
        console.log('Selected Impact:', impactType);

        let rows = await fetchSheetData(range);
        let impactLevel = getDataForCounty(rows, selectedCounty, 28)
        console.log('Impact Level:', impactLevel);

        let result;
        switch(selectedYear) {
            case "2025":
                range = "Narratives 2025!A2:D";
                rows = await fetchSheetData(range);
                result = getNarrative(rows, selectedBiome, impactLevel, impactType);
                break;
            case "2035":
                range = "Narratives 2025!A2:D";
                rows = await fetchSheetData(range);
                result = getNarrative(rows, selectedBiome, impactLevel, impactType);
                break;
            case "2045":
                range = "Narratives 2025!A2:D";
                rows = await fetchSheetData(range);
                result = getNarrative(rows, selectedBiome, impactLevel, impactType);
                break;
            case "2055":
                range = "Narratives 2025!A2:D";
                rows = await fetchSheetData(range);
                result = getNarrative(rows, selectedBiome, impactLevel, impactType);
                break;
            default:
                throw new Error(`Invalid year selected: ${selectedYear}`);
        }   

        // Redirect the user to the "high_heat" page with the result
        res.redirect(`/precipitation_and_storms?county=${selectedCounty}&year=${encodeURIComponent(selectedYear)}&biome=${encodeURIComponent(selectedBiome)}&result=${encodeURIComponent(result || "No result found")}`);

    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
        res.redirect(`/precipitation_and_storms?county=${selectedCounty}&year=${encodeURIComponent(selectedYear)}&biome=${encodeURIComponent(selectedBiome)}&result=${encodeURIComponent("Error fetching data")}`);
    }
});

// Route for precipitation_and_storms
app.get('/precipitation_and_storms', (req, res) => {
    const county = req.query.county; // Get county from query parameter
    const result = req.query.result; // Get result from query parameter
    const selectedYear = req.query.year;
    const selectedBiome = req.query.biome;

    res.render('precipitation_and_storms', { county, result, selectedYear, selectedBiome });
});

//get info for wildfires route
app.get('/fetch-wildfires', async (req, res) => {
    const selectedCounty = req.query.county;  // Get the selected county from query parameter
    const selectedYear = req.query.year;
    const selectedBiome = req.query.biome;
    const impactType = "Wildfire"
    let range = "COUNTY Wildfires!A2:R";  // Change this range as necessary
    try {
        console.log('Selected County:', selectedCounty);
        console.log('Selected Year:', selectedYear);
        console.log('Selected Biome:', selectedBiome);
        console.log('Selected Impact:', impactType);

        let rows = await fetchSheetData(range);
        let impactLevel = getDataForCounty(rows, selectedCounty, 17)
        console.log('Impact Level:', impactLevel);

        let result;
        switch(selectedYear) {
            case "2025":
                range = "Narratives 2025!A2:D";
                rows = await fetchSheetData(range);
                result = getNarrative(rows, selectedBiome, impactLevel, impactType);
                break;
            case "2035":
                range = "Narratives 2025!A2:D";
                rows = await fetchSheetData(range);
                result = getNarrative(rows, selectedBiome, impactLevel, impactType);
                break;
            case "2045":
                range = "Narratives 2025!A2:D";
                rows = await fetchSheetData(range);
                result = getNarrative(rows, selectedBiome, impactLevel, impactType);
                break;
            case "2055":
                range = "Narratives 2025!A2:D";
                rows = await fetchSheetData(range);
                result = getNarrative(rows, selectedBiome, impactLevel, impactType);
                break;
            default:
                throw new Error(`Invalid year selected: ${selectedYear}`);
        }   

        // Redirect the user to the "high_heat" page with the result
        res.redirect(`/wildfires?county=${selectedCounty}&year=${encodeURIComponent(selectedYear)}&biome=${encodeURIComponent(selectedBiome)}&result=${encodeURIComponent(result || "No result found")}`);

    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
        res.redirect(`/wildfires?county=${selectedCounty}&year=${encodeURIComponent(selectedYear)}&biome=${encodeURIComponent(selectedBiome)}&result=${encodeURIComponent("Error fetching data")}`);
    }
});

// Route for wildfires
app.get('/wildfires', (req, res) => {
    const county = req.query.county; // Get county from query parameter
    const result = req.query.result; // Get result from query parameter
    const selectedYear = req.query.year;
    const selectedBiome = req.query.biome;

    res.render('wildfires', { county, result, selectedYear, selectedBiome });
});

// Route for reflection
app.get('/reflection', (req, res) => {
    const county = req.query.county; // Get county from query parameter
    const selectedYear = req.query.year;
    const selectedBiome = req.query.biome;
    res.render('reflection', { county, selectedYear, selectedBiome });
});


// Route to display ranking page
app.get('/rank-concerns', (req, res) => {
    res.render('rank_concerns');
});

// Route to handle ranked concerns
app.post('/rank-concerns', (req, res) => {
    const rankedConcerns = JSON.parse(req.body.rankedConcerns || '[]');
    
    if (rankedConcerns.length > 0) {
        const highestConcern = rankedConcerns[0]; // Get the top-ranked concern
        // Redirect based on the highest concern
        switch (highestConcern) {
            case 'high_heat':
                res.redirect('/dashboard');
                break;
            case 'precipitation_and_rainfall':
                res.redirect('/dashboard');
                break;
            case 'wildfires':
                res.redirect('/dashboard');
                break;
            case 'sea_level_rise':
                res.redirect('/dashboard');
                break;
            default:
                res.status(400).send('Invalid ranking result');
        }
    } else {
        res.status(400).send('Ranking data is missing or invalid');
    }
});

//route to get to sentiment page
app.get('/sentiment', (req, res) => {
    const county = req.query.county 
    const selectedYear = req.query.year 

    res.render('sentiment', { county, selectedYear });
});


 // Route to handle storing sentiment data + routing to next page
app.post('/store-sentiment', async (req, res) => {
    const { county, year, sliderValue } = req.body;

    try {
        // Prepare data to append to Google Sheets
        // const range = 'Reflection!A2:C'; // Update with your actual sheet range
        // const values = [[county, year, sliderValue]];

        // Append data to Google Sheets
        // await appendToGoogleSheet(range, values);

        // Redirect to the next page
        res.redirect(`/rank-concerns?county=${encodeURIComponent(county)}&year=${encodeURIComponent(year)}`);
    } catch (error) {
        console.error('Error storing sentiment data:', error);
        res.status(500).send('Error saving your reflection.');
    }
});


// Route to dashboard page
app.get('/dashboard', (req, res) => {
    res.render('dashboard');
});



// Route to dashboard page
// app.get('/dashboard', (req, res) => {
//     // #need to get impact level
//     let range = "Resources!A2:C";
//     let rows = await fetchSheetData(range);
//     for (const row of rows) {
//         if (row[0] === impactType) {  // Assuming county is in the first column (A)
//         let impact_resources = row[1];  // Get the value from the specified column
//         break;
//         }
//     }
//     res.render('dashboard');
// });





// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});




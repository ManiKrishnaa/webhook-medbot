const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
app.use(bodyParser.json());

// Define a route for Dialogflow webhook
app.post('/webhook', async (req, res) => {
  const queryResult = req.body.queryResult;
  const medication = queryResult.parameters.Medication;

  try {
    // Fetching medication information from the FDA API
    const apiResponse = await axios.get(`https://api.fda.gov/drug/label.json?search=${medication}&limit=1`);
    
    // Check if data was returned from the FDA API
    if (apiResponse.data.results && apiResponse.data.results.length > 0) {
      const medicationData = apiResponse.data.results[0];

      // Extracting fields like purpose and description
      const purpose = medicationData.purpose ? medicationData.purpose.join(', ') : 'Not specified';
      const description = medicationData.description ? medicationData.description.join(' ') : 'Description not available.';

      // Creating the fulfillment text response
      const fulfillmentText = `Here is some information about ${medication}: Purpose: ${purpose}. Description: ${description}.`;

      // Send back response to Dialogflow
      res.json({
        fulfillmentText: fulfillmentText
      });
    } else {
      // If no results were found
      res.json({
        fulfillmentText: `I'm sorry, I couldn't find any information about ${medication} at the moment.`
      });
    }
  } catch (error) {
    console.error('Error fetching medication information:', error);
    res.json({
      fulfillmentText: "Sorry, I couldn't retrieve the medication information at the moment."
    });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

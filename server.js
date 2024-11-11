const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

app.post('/webhook', async (req, res) => {
    const intentName = req.body.queryResult.intent.displayName;

    if (intentName === 'Medication Information') {
        const medication = req.body.queryResult.parameters['Medication'];

        try {
            const apiResponse = await axios.get(`https://api.fda.gov/drug/label.json?search=${medication}&limit=1`);
            const drugInfo = apiResponse.data.results[0];

            const responseText = `
                **Brand Name**: ${drugInfo.openfda.brand_name[0]}
                **Generic Name**: ${drugInfo.openfda.generic_name[0]}
                **Indication**: ${drugInfo.drug_indication[0]}
                **Dosage**: ${drugInfo.dosage_and_administration[0]}
            `;

            res.json({
                fulfillmentText: responseText
            });
        } catch (error) {
            res.json({
                fulfillmentText: "Sorry, I couldn't retrieve the medication information at the moment."
            });
        }
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

"use strict";

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

function main() {
  // Import the Google Cloud client libraries
  const { BigQuery } = require("@google-cloud/bigquery");

  async function createDataset() {
    const datasetId = process.env.BIGQUERY_DATASET_ID;

    const bigqueryClient = new BigQuery({
      keyFilename: process.env.BIGQUERY_KEYFILE_PATH,
      projectId: process.env.SQUARE_PROJECT_ID,
    });

    // Specify the geographic location where the dataset should reside
    const options = {
      location: "US",
    };

    // Create a new dataset
    const [dataset] = await bigqueryClient.createDataset(datasetId, options);
    console.log(`Dataset ${dataset.id} created.`);
  }

  createDataset();
}

main();

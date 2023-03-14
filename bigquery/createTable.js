"use strict";
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { schema } = require("./schemas/ordersSchema.js");

function main() {
  // [START bigquery_create_table]
  // Import the Google Cloud client library and create a client
  const { BigQuery } = require("@google-cloud/bigquery");
  const bigqueryClient = new BigQuery({
    keyFilename: process.env.BIGQUERY_KEYFILE_PATH,
    projectId: process.env.SQUARE_PROJECT_ID,
  });

  async function createTable() {
    // Creates a new table named "my_table" in "my_dataset".

    /**
     * TODO(developer): Uncomment the following lines before running the sample.
     */
    const datasetId = process.env.BIGQUERY_DATASET_ID;
    const tableId = "orders";

    const options = {
      schema: schema,
      location: "US",
    };

    // Create a new table in the dataset
    const [table] = await bigqueryClient
      .dataset(datasetId)
      .createTable(tableId, options);

    console.log(`Table ${table.id} created.`);
  }
  createTable();
}

main();

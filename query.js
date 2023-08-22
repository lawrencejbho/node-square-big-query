"use strict";
// const path = require("path");
// require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

require("dotenv").config();

function queryData(dataset) {
  // [START bigquery_create_table]
  // Import the Google Cloud client library and create a client

  const { BigQuery } = require("@google-cloud/bigquery");
  const bigqueryClient = new BigQuery({
    keyFilename: process.env.BIGQUERY_KEYFILE_PATH,
    projectId: process.env.BIGQUERY_PROJECT_ID,
  });

  async function query() {
    try {
      const datasetId = process.env.BIGQUERY_DATASET_ID;

      const projectString =
        process.env.BIGQUERY_PROJECT_ID + "." + process.env.BIGQUERY_DATASET_ID;

      const query = `SELECT *FROM \`${projectString}.${dataset}\`;`;

      const options = {
        query: query,
        location: "US",
      };

      const [job] = await bigqueryClient.createQueryJob(options);

      const [rows] = await job.getQueryResults();

      // console.log(rows);
      return rows;
    } catch (error) {
      console.log(error);
    }
  }
  return query();
}

module.exports.queryData = queryData;

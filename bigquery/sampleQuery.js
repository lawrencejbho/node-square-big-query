"use strict";

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

function main() {
  // Import the Google Cloud client library
  const { BigQuery } = require("@google-cloud/bigquery");

  async function queryShakespeare() {
    // Queries a public Shakespeare dataset.

    // Create a client
    const bigqueryClient = new BigQuery({
      keyFilename: process.env.BIGQUERY_KEYFILE_PATH,
      projectId: process.env.SQUARE_PROJECT_ID,
    });

    // The SQL query to run
    const sqlQuery = `SELECT word, word_count
            FROM \`bigquery-public-data.samples.shakespeare\`
            WHERE corpus = @corpus
            AND word_count >= @min_word_count
            ORDER BY word_count DESC`;

    //github sample data
    // const sqlQuery = `SELECT subject AS subject, COUNT(*) AS num_duplicates
    //         FROM \`bigquery-public-data.github_repos.commits\`
    //         GROUP BY subject
    //         ORDER BY num_duplicates
    //         DESC LIMIT 10`;

    const options = {
      query: sqlQuery,
      // Location must match that of the dataset(s) referenced in the query.
      location: "US",
      params: { corpus: "romeoandjuliet", min_word_count: 250 },
    };

    // Run the query
    const [rows] = await bigqueryClient.query(options);

    console.log("Rows:");
    rows.forEach((row) => console.log(row));
    // rows.forEach((row) => console.log(`${row.subject}: ${row.num_duplicates}`));
  }

  queryShakespeare();
}

main();

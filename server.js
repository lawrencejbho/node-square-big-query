require("dotenv").config();
const { Client, Environment, ApiError } = require("square");
const { testData } = require("./data.js");
const pool = require("./db.js");
const { BigQuery } = require("@google-cloud/bigquery");
const fs = require("fs");

const client = new Client({
  environment: Environment.Production,
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
});

const { locationsApi, customersApi, teamApi, ordersApi, paymentsApi } = client;

async function getLocation() {
  try {
    const response = await client.locationsApi.listLocations();

    console.log(response.result);
  } catch (error) {
    console.log(error);
  }
}

// getLocation();

async function listCustomers() {
  try {
    const response = await customersApi.listCustomers();
    console.log(response.result);
  } catch (error) {
    console.log(error);
  }
}

async function searchTeamMembers() {
  try {
    const response = await client.teamApi.searchTeamMembers({
      limit: 200,
    });
    // const databaseData = await readTeam();

    // let update = compareData(response.result.teamMembers, databaseData);

    // const bigquery = await loadData(
    //   response.result.teamMembers,
    //   "team-members"
    // );

    // console.log(update);
    fs.writeFileSync(
      process.env.LOCAL_FILE_DIRECTORY + "team_members.json",
      JSON.stringify(response.result.teamMembers),
      function (err) {
        if (err) {
          return console.log(err);
        }
        console.log("The file was saved!");
      }
    );
    // const updateBigQuery = await updateBigQuery();
  } catch (error) {
    console.log(error);
  }
}

searchTeamMembers();

async function listCustomers() {
  let cursor = "";
  let final_array = [];

  try {
    let response = await client.customersApi.listCustomers(undefined, 50);
    // console.log(response.result.customers);
    response.result.customers.forEach((entry) => {
      entry.version = Number(entry.version);
    });
    let cursor = response.result.cursor;
    let count = 0;
    final_array = [...response.result.customers];
    while (cursor != undefined) {
      response = await client.customersApi.listCustomers(cursor, 50);
      response.result.customers.forEach((entry) => {
        entry.version = Number(entry.version);
      });
      // const bigquery = await loadData(response.result.customers, "customers");
      final_array = [...final_array, ...response.result.customers];
      // console.log(response.result.customers);
      cursor = response.result.cursor;
      count++;

      // console.log(count);
      console.log(final_array.length);
    }
  } catch {}

  try {
    fs.writeFileSync(
      process.env.LOCAL_FILE_DIRECTORY + "customers.json",
      JSON.stringify(final_array),
      function (err) {
        if (err) {
          return console.log(err);
        }
        console.log("The file was saved!");
      }
    );
  } catch (err) {
    console.log(err.message);
  }
}

async function searchOrders() {
  // go through each object's property and check for bigInt, array, or object
  // array needs to be checked like this because an array is an object in js
  // anytime there is an object, recursively go through each of the object's properties

  let cursor = "";
  let final_array = [];

  try {
    let response = await client.ordersApi.searchOrders({
      locationIds: [process.env.LOCATION_ID],
    });

    let cursor = response.result.cursor;
    let count = 0;
    convertBigIntToInt(response.result.orders);
    // console.log([response.result.orders[0]]);
    final_array = [...response.result.orders];

    while (cursor != undefined) {
      response = await client.ordersApi.searchOrders({
        locationIds: [process.env.LOCATION_ID],
        cursor: cursor,
      });
      convertBigIntToInt(response.result.orders);

      // const bigquery = await loadData(response.result.customers, "customers");
      final_array = [...final_array, ...response.result.orders];
      // console.log(response.result.customers);
      cursor = response.result.cursor;
      count++;

      // console.log(count);
      console.log(final_array.length);
    }
  } catch {}

  try {
    fs.writeFileSync(
      process.env.LOCAL_FILE_DIRECTORY + "orders.json",
      JSON.stringify(final_array),
      function (err) {
        if (err) {
          return console.log(err);
        }
        console.log("The file was saved!");
      }
    );
  } catch (err) {
    console.log(err.message);
  }
}

async function listPayments() {
  let cursor = "";
  let final_array = [];

  try {
    let response = await client.paymentsApi.listPayments();
    // console.log(response.result.customers);
    // response.result.customers.forEach((entry) => {
    //   entry.version = Number(entry.version);
    // });
    let cursor = response.result.cursor;
    let count = 0;
    convertBigIntToInt(response.result.payments);
    console.log(cursor);
    // console.log(response.result.payments);
    final_array = [...response.result.payments];
    while (cursor != undefined) {
      response = await client.paymentsApi.listPayments(
        undefined,
        undefined,
        undefined,
        cursor
      );
      // response.result.customers.forEach((entry) => {
      //   entry.version = Number(entry.version);
      // });
      // const bigquery = await loadData(response.result.customers, "customers");
      convertBigIntToInt(response.result.payments);

      final_array = [...final_array, ...response.result.payments];
      // console.log(response.result.customers);
      cursor = response.result.cursor;
      count++;

      // console.log(count);
      console.log(cursor);
      console.log(final_array.length);
    }
  } catch {}

  try {
    fs.writeFileSync(
      process.env.LOCAL_FILE_DIRECTORY + "payments.json",
      JSON.stringify(final_array),
      function (err) {
        if (err) {
          return console.log(err);
        }
        console.log("The file was saved!");
      }
    );
  } catch (err) {
    console.log(err.message);
  }
}

// build a map from the databaseData then check if the map has each entry from the squareData, if not matching record then push to update array
function compareData(squareData, databaseData) {
  let map = new Map();
  let updateArray = [];

  databaseData.forEach((entry) => {
    // the resulting JSON from postgres needs to be parsed
    // we need to use a string here because having an object as a key will compare the reference of the objects which will never match
    // console.log(entry);

    let obj = JSON.parse(entry);

    const id = `id:${obj.id}_updatedAt:${obj.updatedAt}`;
    map.set(id, "1");
  });

  // console.log(map);
  // let count = 0;

  squareData.forEach((entry) => {
    const id = `id:${entry.id}_updatedAt:${entry.updatedAt}`;
    if (map.has(id)) {
      // count++;
      // console.log(count);
      return;
    }
    updateArray.push(entry);
  });
  return updateArray;
}

// create

async function createTeam(updateArray) {
  try {
    const query = await pool.query(
      "INSERT INTO team_members(entrys) VALUES ($1) RETURNING *",
      [updateArray]
    );
  } catch (err) {
    console.log(err.message);
  }
}

// read

async function readTeam() {
  try {
    const query = await pool.query("SELECT * FROM team_members");
    const result = query.rows[0].entrys;
    console.log(result);

    fs.writeFileSync(
      process.env.LOCAL_FILE_DIRECTORY + "team_members.json",
      JSON.stringify(result),
      function (err) {
        if (err) {
          return console.log(err);
        }
        console.log("The file was saved!");
      }
    );
    return result;
  } catch (err) {
    console.log(err.message);
  }
}

async function createCustomers(updateArray) {
  try {
    const query = await pool.query(
      "INSERT INTO customers(entrys) VALUES ($1) RETURNING *",
      [updateArray]
    );
  } catch (err) {
    console.log(err.message);
  }
}

async function readCustomers() {
  try {
    const query = await pool.query("SELECT * FROM customers");
    const result = query.rows[0].entrys;

    fs.writeFileSync(
      process.env.LOCAL_FILE_DIRECTORY + "customers2.json",
      result,
      function (err) {
        if (err) {
          return console.log(err);
        }
        console.log("The file was saved!");
      }
    );

    console.log(result.length);
    return result;
  } catch (err) {
    console.log(err.message);
  }
}

async function createOrders(updateArray) {
  try {
    const query = await pool.query(
      "INSERT INTO orders(entrys) VALUES ($1) RETURNING *",
      [updateArray]
    );
  } catch (err) {
    console.log(err.message);
  }
}

async function updateBigQuery() {
  try {
    const query = await pool.query;
  } catch (err) {
    console.log(err.message);
  }
}

async function loadData(dataSet, tableId) {
  const datasetId = "my_states_dataset3";

  const bigqueryClient = new BigQuery({
    keyFilename: process.env.BIGQUERY_KEYFILE_PATH,
    projectId: process.env.SQUARE_PROJECT_ID,
  });

  // Specify the geographic location where the dataset should reside
  const options = {
    location: "US",
    autodetect: true,
    sourceFormat: "NEWLINE_DELIMITED_JSON",
  };

  const job = await bigqueryClient
    .dataset(datasetId)
    .table(tableId)
    .insert(dataSet, options)
    .then((data) => {
      const apiResponse = data;
      // console.log(apiResponse);
    })
    .catch((err) => {
      console.log(`err: ${err}`);
    });
}

function convertBigIntToInt(response) {
  response.forEach((entry) => {
    recrusiveFunction(entry);
  });
  function recrusiveFunction(entry) {
    for (let [key, value] of Object.entries(entry)) {
      if (typeof value === "bigint") {
        // console.log("hit " + value);
        entry[key] = Number(value);
        continue;
      } else if (Array.isArray(value)) {
        checkArray(value);
        continue;
      } else if (typeof value == "object") {
        // console.log("recursion ");
        recrusiveFunction(value);
      }
    }
  }

  function checkArray(values) {
    // console.log(values);
    values.forEach((value) => {
      // console.log("array value " + value);
      recrusiveFunction(value);
    });
  }
}

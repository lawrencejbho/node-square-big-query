require("dotenv").config();
const { Client, Environment, ApiError } = require("square");
const { BigQuery } = require("@google-cloud/bigquery");
const fs = require("fs");

const { queryData } = require("./query.js");

const client = new Client({
  environment: Environment.Production,
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
});

const { customersApi, teamApi, ordersApi, paymentsApi, catalogApi } = client;

exports.main = async (data, context) => {
  try {
    await updateTeamMembers();
  } catch (error) {
    console.log(error);
  }
  try {
    await updateCatalog();
  } catch (error) {
    console.log(error);
  }
  try {
    await updateOrders();
  } catch (error) {
    console.log(error);
  }
  // try {
  //   await updateCustomers();
  // } catch (error) {
  //   console.log(error);
  // }
  // try {
  //   await updatePayments();
  // } catch (error) {
  //   console.log(error);
  // }
};

async function updateTeamMembers() {
  try {
    const bigQueryData = await queryData("team-members");
    console.log("Previous Big Query length " + bigQueryData.length);
    const squareData = await client.teamApi.searchTeamMembers({});
    console.log(
      "New length from Square " + squareData.result.teamMembers.length
    );

    let update = compareData(squareData.result.teamMembers, bigQueryData);
    console.log(update.length);
    if (update.length > 0) {
      const bigquery = await loadData(
        squareData.result.teamMembers,
        "team-members"
      );
    }

    // use if you need to generate the json file to load into bigQuery
    // writeToLocalFile("team_members.json", response.result.teamMembers);
  } catch (error) {
    console.log(error);
  }
}

async function updateCatalog() {
  try {
    const bigQueryData = await queryData("catalog");
    console.log("Previous Big Query length " + bigQueryData.length);
    const squareData = await client.catalogApi.searchCatalogItems({});
    console.log("New length from Square " + squareData.result.items.length);
    convertBigIntToInt(squareData.result.items);

    let update = compareData(squareData.result.items, bigQueryData);
    console.log(update.length);
    if (update.length > 0) {
      const bigquery = await loadData(squareData.result.items, "catalog");
    }
    // use if you need to generate the json file to load into bigQuery
    // writeToLocalFile("catalog.json", squareData.result.items);
  } catch (error) {
    console.log(error);
  }
}

updateCatalog();

async function updateCustomers() {
  let cursor = "";
  let final_array = [];

  async function listCustomers() {
    let response = await client.customersApi.listCustomers(undefined, 50);
    // console.log(response.result.customers);
    response.result.customers.forEach((entry) => {
      entry.version = Number(entry.version);
    });
    let cursor = response.result.cursor;
    final_array = [...response.result.customers];
    while (cursor != undefined) {
      response = await client.customersApi.listCustomers(cursor, 50);
      response.result.customers.forEach((entry) => {
        entry.version = Number(entry.version);
      });
      final_array = [...final_array, ...response.result.customers];
      cursor = response.result.cursor;
      // console.log(cursor);
      // console.log(final_array.length);
    }
    return final_array;
  }

  try {
    console.log("working on updating customers");
    const bigQueryData = await queryData("customers");
    console.log("Previous Big Query length " + bigQueryData.length);
    const squareData = await listCustomers();
    console.log("New length from Square " + squareData.length);

    if (bigQueryData.length > 16000 && squareData.length > 16000) {
      let update = compareData(squareData, bigQueryData, {});
      console.log(update.length);
      if (update?.length > 0) {
        console.log("updating");
        const bigquery = await loadData(update, "customers");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
}

async function updateOrders() {
  let cursor = "";
  let final_array = [];
  // need to skip these transactions or they will cause schema errors in bigquery
  const skip = {
    T9vQDoNfiHKz5NvAz4HE9ZqeV: 1,
    e0UlNlECJegzzyXcVMemlc2XbkcZY: 1,
    a2YYmt09o0CmcYukrYhpOz0XTkAZY: 1,
    "3Trrsbq2Sy6ESumt5w7mt5leV": 1,
    "20o6P4M37RSLVquvneQ4BP24c3GZY": 1,
    GqVjETl3RxY2zW5LVT9SVyp6t6EZY: 1,
    QhsIxG7VrRybIm8ZRs5XtDDKoA7YY: 1,
    KwxKZ39cLA6z7rUuQySmFtSPbDIZY: 1,
  };

  async function searchOrders() {
    // the cursor can't be blank for the first request
    let response = await client.ordersApi.searchOrders({
      locationIds: [process.env.SQUARE_LOCATION_ID],
    });

    convertBigIntToInt(response.result.orders);
    final_array = [...response.result.orders];
    cursor = response.result.cursor;

    while (cursor != undefined) {
      response = await client.ordersApi.searchOrders({
        locationIds: [process.env.SQUARE_LOCATION_ID],
        cursor: cursor,
      });

      // weird edge case in square where it'll just return a cursor in the response.result
      if (response.result.orders !== undefined) {
        convertBigIntToInt(response.result.orders);
        final_array = [...final_array, ...response.result.orders];
      }
      cursor = response.result.cursor;

      // console.log(final_array.length);
    }
    return final_array;
  }

  try {
    console.log("working on updating orders");
    const bigQueryData = await queryData("orders");
    console.log("Previous Big Query length " + bigQueryData.length);
    const squareData = await searchOrders();
    console.log("New length from Square " + squareData.length);

    // writeToLocalFile("orders2.json", squareData);

    if (bigQueryData.length > 20000 && squareData.length > 20000) {
      let update = compareData(squareData, bigQueryData, skip);
      console.log(update.length);
      if (update?.length > 0) {
        console.log("updating");
        const bigquery = await loadData(update, "orders");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
}

async function updatePayments() {
  let cursor = "";
  let final_array = [];

  async function listPayments() {
    let response = await client.paymentsApi.listPayments();
    convertBigIntToInt(response.result.payments);
    final_array = [...response.result.payments];
    cursor = response.result.cursor;

    while (cursor != undefined) {
      response = await client.paymentsApi.listPayments(
        undefined,
        undefined,
        undefined,
        cursor
      );

      if (response.result.payments !== undefined) {
        convertBigIntToInt(response.result.payments);
        final_array = [...final_array, ...response.result.payments];
      }
      cursor = response.result.cursor;
      // console.log(final_array.length);
    }
    return final_array;
  }

  try {
    console.log("working on updating payments");
    const bigQueryData = await queryData("payments");
    console.log("Previous Big Query length " + bigQueryData.length);
    const squareData = await listPayments();
    console.log("New length from Square " + squareData.length);

    // writeToLocalFile("payments2.json", squareData);

    if (bigQueryData.length > 10000 && squareData.length > 10000) {
      let update = compareData(squareData, bigQueryData, {});
      console.log(update.length);
      if (update?.length > 0) {
        console.log("updating");
        const bigquery = await loadData(update, "payments");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
}

// build a map from the databaseData then check if the map has each entry from the squareData, if not matching record then push to update array
function compareData(squareData, bigQueryData, skip) {
  let map = new Map();
  let updateArray = [];
  // console.log(databaseData);

  bigQueryData.forEach((entry) => {
    const id = entry.id;
    map.set(id, "1");
  });

  squareData.forEach((entry) => {
    const id = entry.id;
    if (map.has(id) || skip[id] == 1) {
      return;
    }
    updateArray.push(entry);
  });
  return updateArray;
}

async function loadData(dataSet, tableId) {
  const datasetId = "my_states_dataset3";

  const bigqueryClient = new BigQuery({
    keyFilename: process.env.BIGQUERY_KEYFILE_PATH,
    projectId: process.env.SQUARE_PROJECT_ID,
  });

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
      console.log(apiResponse);
    })
    .catch((err) => {
      console.log(`err: ${err}`);
    });
}

// go through each object's property and check for bigInt, array, or object
// array needs to be checked like this because an array is an object in js
// anytime there is an object, recursively go through each of the object's properties
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

async function writeToLocalFile(filename, result) {
  try {
    fs.writeFileSync(
      process.env.LOCAL_FILE_DIRECTORY + filename,
      JSON.stringify(result),
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

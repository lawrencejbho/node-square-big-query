const pool = require("./db.js");

// create

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

// read

async function readTeam() {
  try {
    const query = await pool.query("SELECT * FROM team_members");
    const result = query.rows[0].entrys;
    console.log(result);

    return result;
  } catch (err) {
    console.log(err.message);
  }
}

async function readCustomers() {
  try {
    const query = await pool.query("SELECT * FROM customers");
    const result = query.rows[0].entrys;

    console.log(result.length);
    return result;
  } catch (err) {
    console.log(err.message);
  }
}

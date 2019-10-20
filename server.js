require("dotenv").config();
var express = require("express");
var exphbs = require("express-handlebars");
var mysql = require("mysql");
var path = require("path");

var app = express();

var PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: process.env.DB_PASS,
  database: "grill_db"
});

connection.connect(function(err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }

  console.log("connected as id " + connection.threadId);
});

app.get("/", function(req, res) {
  connection.query("SELECT * FROM burgers;", function(err, data) {
    if (err) {
      return res.status(500).end();
    }

    res.render("index", { burgers: data });
  });
});

// Create a new plan
app.post("/api/burgers", function(req, res) {
  connection.query(
    "INSERT INTO burgers (burger) VALUES (?)",
    [req.body.burger],
    function(err, result) {
      if (err) {
        return res.status(500).end();
      }

      // Send back the ID of the new plan
      res.json({ id: result.insertId });
      console.log({ id: result.insertId });
    }
  );
});

// Update a plan
app.put("/api/burgers/:id", function(req, res) {
  connection.query(
    "UPDATE burgers SET burger = ? WHERE id = ?",
    [req.body.burger, req.params.id],
    function(err, result) {
      if (err) {
        // If an error occurred, send a generic server failure
        return res.status(500).end();
      } else if (result.changedRows === 0) {
        // If no rows were changed, then the ID must not exist, so 404
        return res.status(404).end();
      }
      res.status(200).end();
    }
  );
});

// Delete a plan
app.delete("/api/burgers/:id", function(req, res) {
  connection.query(
    "DELETE FROM burgers WHERE id = ?",
    [req.params.id],
    function(err, result) {
      if (err) {
        // If an error occurred, send a generic server failure
        return res.status(500).end();
      } else if (result.affectedRows === 0) {
        // If no rows were changed, then the ID must not exist, so 404
        return res.status(404).end();
      }
      res.status(200).end();
    }
  );
});

// Start our server so that it can begin listening to client requests.
app.listen(PORT, function() {
  // Log (server-side) when our server has started
  console.log("Server listening on: http://localhost:" + PORT);
});

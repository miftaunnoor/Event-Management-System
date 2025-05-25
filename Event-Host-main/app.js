const express = require("express");
const ejs = require("ejs");
const bodyparser = require("body-parser");
const mysql = require("mysql");
const app = express();

app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "EventManagement",
});

connection.connect((error) => {
  if (error) {
    console.error("Error connecting to the database:", error);
  } else {
    console.log("Connected to the database");
  }
});

// sultana, feature: read
app.get("/", function (req, res) {
  connection.query("SELECT * FROM event", (error, results, fields) => {
    if (error) {
      console.error("Error executing query:", error);
    } else {
      console.log("Query results:", results);
      res.render("home", {
        results: results,
      });
    }
  });
});

// Hritick feature:Search
app.post("/search", (req, res) => {
  const Event_Name = req.body.search;
  let qry = "Select * from Event where Event_Name Like '%" + Event_Name + "%'";
  connection.query(qry, (err, results) => {
    if (err) throw err;
    else {
      res.render("searchresult", { results: results });
    }
  });
});

app.get("/admin", (req, res) => {
  res.render("Admin");
});

app.post("/admin", (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  if (username == "admin@evently.com" && password == "1234") {
    connection.query("SELECT * FROM event", (error, results, fields) => {
      if (error) {
        console.error("Error executing query:", error);
      } else {
        var qry2 = "select * from queue";
        connection.query(qry2, (err, result) => {
          console.log("Query results:", results);
          res.render("dashboard", {
            results: results,
            result: result,
          });
        });
      }
    });
  }
});

//Raiyan feature: Create
app.post("/dashboard", (req, res) => {
  var eventid = req.body.eventid;
  var eventname = req.body.eventname;
  var eventdate = req.body.eventdate;
  var starttime = req.body.starttime;
  var endtime = req.body.endtime;
  var paymentid = req.body.paymentid;
  var capacity = req.body.capacity;
  var qry = "Insert into event values(?,?,?,?,?,?,?)";
  connection.query(
    qry,
    [eventid, eventname, eventdate, starttime, endtime, paymentid, capacity],
    (err, result) => {
      if (err) throw err;
      else {
        connection.query("SELECT * FROM event", (error, results, fields) => {
          if (error) {
            console.error("Error executing query:", error);
          } else {
            var qry2 = "Select * from queue";
            connection.query(qry2, (err, result2) => {
              if (err) throw err;
              else {
                res.render("dashboard", {
                  results: results,
                  result: result2,
                });
              }
            });
          }
        });
      }
    }
  );
});

// miftaun feature:delete
app.get("/delete/:id", (req, res) => {
  var eventid = req.params.id;
  var qry = "Delete from event where Event_Id=?";
  connection.query(qry, [eventid], (err, result) => {
    if (err) throw err;
    else {
      connection.query("SELECT * FROM event", (error, results, fields) => {
        if (error) {
          console.error("Error executing query:", error);
        } else {
          var qry2 = "Select * from queue";
          connection.query(qry2, (err, result2) => {
            if (err) throw err;
            else {
              res.render("dashboard", {
                results: results,
                result: result2,
              });
            }
          });
        }
      });
    }
  });
});

app.get("/edit/:id", (req, res) => {
  var eventid = req.params.id;
  var qry = "Select * from event where Event_Id=?";
  connection.query(qry, [eventid], (err, result) => {
    if (err) throw err;
    else {
      console.log(result);
      res.render("edit", { result: result });
    }
  });
});

app.post("/edit", (req, res) => {
  var id = req.body.id;
  var eventid1 = req.body.eventid;
  var eventname1 = req.body.eventname;
  var eventdate1 = req.body.eventdate;
  var starttime1 = req.body.starttime;
  var endtime1 = req.body.endtime;
  var paymentid1 = req.body.paymentid;
  var capacity1 = req.body.capacity;
  var qry =
    "Update event set Event_Id=?, Event_Name=?, Event_Date=?, Start_Time=?, End_time=?, Org_payID=?, capacity=? where Event_Id=?";
  connection.query(
    qry,
    [
      eventid1,
      eventname1,
      eventdate1,
      starttime1,
      endtime1,
      paymentid1,
      capacity1,
      id,
    ],
    (err, result) => {
      if (err) throw err;
      else {
        res.redirect("/");
      }
    }
  );
});

app.get("/register", (req, res) => {
  res.render("registration");
});

app.post("/register", (req, res) => {
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var phone = req.body.phone;
  var password = req.body.password;
  var qry = "Insert into user values(?,?,?,?,?)";
  connection.query(
    qry,
    [username, name, email, password, phone],
    (err, result) => {
      if (err) throw err;
      else {
        res.redirect("/");
      }
    }
  );
});

app.get("/checkout", (req, res) => {
  res.render("checkout");
});

app.post("/checkout", (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  var EventID = req.body.eventid;
  var TransactionID = req.body.transactionid;
  var qry = "Select * from user where user_name=?";
  connection.query(qry, [username], (err, results) => {
    if (err) throw err;
    else {
      if (results[0].Password == password) {
        var qry2 = "Insert into queue values(?,?,?)";
        connection.query(
          qry2,
          [EventID, username, TransactionID],
          (err, result) => {
            res.redirect("/");
          }
        );
      } else {
        res.send("error");
        console.log(err);
      }
    }
  });
});

app.post("/tickets", (req, res) => {
  var eventid = req.body.eventid;
  var username = req.body.username;
  var seat = req.body.seatnumber;
  var status = req.body.status;
  var qry = "insert into tickets values(?,?,?,?)";
  connection.query(qry, [eventid, username, seat, status], (err, result) => {
    if (err) throw err;
    else {
      var qry2 = "delete from queue where User_Id=?";
      connection.query(qry2, [username], (err, results) => {
        if (err) throw err;
        else {
          var qry3 = "select * from event";
          connection.query(qry3, (err, result2) => {
            if (err) throw err;
            else {
              var qry4 = "select * from queue ";
              connection.query(qry4, (err, results3) => {
                if (err) throw err;
                else {
                  res.render("dashboard", {
                    results: result2,
                    result: results3,
                  });
                }
              });
            }
          });
          // res.redirect("/");
        }
      });
    }
  });
});

app.get("/ticketstatus", (req, res) => {
  var qry = "select * from tickets";
  connection.query(qry, (err, result) => {
    if (err) throw err;
    else {
      res.render("ticketstatus", { result: result });
    }
  });
});

app.listen(3000, function () {});

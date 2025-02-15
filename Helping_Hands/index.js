// const express = require("express");
// const mysql = require("mysql2");
// const cors = require("cors");
// const https = require("https");
// const fs = require("fs");
// const path = require("path");
// const { CLIENT_RENEG_LIMIT } = require("tls");

// const app = express();
// app.use(express.json());
// app.use(cors());

// // Database connection
// const db = mysql.createConnection({
//     host: "192.168.0.126",
//     user: "root",
//     port: 3306, 
//     password: "Rakesh@2001", 
//     database: "helpinghands"
// });

// db.connect(err => {
//     if (err) {
//         console.error("Database connection failed: " + err.stack);
//         return;
//     }
//     console.log("Connected to database");
// });

// // Get all users

// app.get("/users", (req, res) => {
//     db.query("call userList()", (err, results) => {
//         if (err) return res.status(500).json(err);
//         let data = results[0];
//          console.log(data)
//         res.json(data);
//     });
// });

// app.get("/users/:id", (req, res) => {
//     const userId = req.params.id;
//     const query = "select id, firstname, lastname, date_format(users.startDate,'%Y-%m-%d') as startDate, totalContribution, lastYearContribution from users where id = ?";
    
//     db.query(query, [userId], (err, result) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).send("Error fetching user data");
//       }
      
//       if (result.length === 0) {
//         return res.status(404).send("User not found");
//       }
  
//       // Send the user data as response
//       res.json(result[0]);
//     });
//   });
  

// // Add a new user
// app.post("/users", (req, res) => {

//     console.log(req.body)
//     const { firstname, lastname, startDate, totalContribution, lastYearContribution } = req.body;
//     const query = "INSERT INTO users (firstname, lastname, startDate, totalContribution, lastYearContribution, createdOn) VALUES (?, ?, ?, ?, ?, NOW())";
//     db.query(query, [firstname, lastname, startDate, totalContribution, lastYearContribution], (err, result) => {
//         if (err) return res.status(500).json(err);
//         res.json({ message: "User added successfully", userId: result.insertId });
//     });
// });

// // Update user details
// app.put("/users/:id", (req, res) => {
//     const { firstname, lastname, startDate, totalContribution, lastYearContribution } = req.body;
//     const { id } = req.params;
//     const query = "UPDATE users SET firstname = ?, lastname=?, startDate=?, totalContribution=?, lastYearContribution=?, updatedOn=NOW() WHERE id=?";
//     db.query(query, [firstname, lastname, startDate, totalContribution, lastYearContribution, id], (err, result) => {
//         if (err) return res.status(500).json(err);
//         res.json({ message: "User updated successfully" });
//     });
// });

// // Delete a user
// app.delete("/users/:id", (req, res) => {
//     const { id } = req.params;
//     db.query("UPDATE users SET isActive=? WHERE id = ?", [0, id], (err, result) => {
//         if (err) return res.status(500).json(err);
//         res.json({ message: "User deleted successfully" });
//     });
// });


// app.get("/", (req, res) => {
//     res.sendFile(path.join(__dirname, "index.html"));
// });
// // Start server
// //const PORT = 3000;
// const server = app.listen(3000, "0.0.0.0", () => {
//     console.log("Server running at http://0.0.0.0:3000");
// });


const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;
const cors = require('cors'); 

app.use(cors()); // Enable CORS for all requests
app.use(express.json()); // Parse JSON body

// Path to the users.json file
const usersFilePath = path.join(__dirname, 'users.json');

// Utility function to read users from the JSON file
function readUsers() {
  const data = fs.readFileSync(usersFilePath, 'utf8');
  return JSON.parse(data);
}

// Utility function to write users to the JSON file
function writeUsers(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}


// Redirect root to /users
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
 // res.redirect('/users');
});

// GET: Fetch all users
app.get('/users', (req, res) => {
  const users = readUsers();
  res.json(users);
});

// GET: Fetch a specific user by ID
app.get('/users/:id', (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (user) {
    res.json(user);
  } else {
    res.status(404).send('User not found');
  }
});

// POST: Add a new user
app.post('/users', (req, res) => {
  const users = readUsers();
  const newUser = req.body;
  newUser.id = users.length ? Math.max(users.map(u => u.id)) + 1 : 1; // Assign an ID
  users.push(newUser);
  writeUsers(users);
  res.status(201).json(newUser);
});

// PUT: Update an existing user
app.put('/users/:id', (req, res) => {
  const users = readUsers();
  const index = users.findIndex(u => u.id === parseInt(req.params.id));
  if (index !== -1) {
    users[index] = { ...users[index], ...req.body };
    writeUsers(users);
    res.json(users[index]);
  } else {
    res.status(404).send('User not found');
  }
});

// DELETE: Delete a user
app.delete('/users/:id', (req, res) => {
  const users = readUsers();
  const index = users.findIndex(u => u.id === parseInt(req.params.id));
  if (index !== -1) {
    const deletedUser = users.splice(index, 1);
    writeUsers(users);
    res.json(deletedUser);
  } else {
    res.status(404).send('User not found');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
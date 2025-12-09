
const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;

app.use(express.json());

// ***********************************************************************************
// IMPORTANT: Replace with your actual MySQL database connection details
// ***********************************************************************************
const db = mysql.createConnection({
  host: 'YOUR_DATABASE_HOST',          // e.g., 'localhost' or an IP address
  user: 'YOUR_DATABASE_USER',         // e.g., 'root'
  password: 'YOUR_DATABASE_PASSWORD', // Your database password
  database: 'YOUR_DATABASE_NAME'      // The name of the database
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Successfully connected to the MySQL database.');
});

// API Endpoints

// 1. Create a new project
app.post('/api/projects', (req, res) => {
  const { firstname, lastname, phone_number, email, address, postal_code, project_details, detailed_requirements } = req.body;
  const query = 'INSERT INTO projects (firstname, lastname, phone_number, email, address, postal_code, project_details, detailed_requirements) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [firstname, lastname, phone_number, email, address, postal_code, project_details, detailed_requirements], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(201).send({ id: result.insertId, ...req.body });
  });
});

// 2. Get all projects
app.get('/api/projects', (req, res) => {
  const query = 'SELECT * FROM projects';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).send(results);
  });
});

// 3. Get a single project by ID
app.get('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM projects WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (result.length === 0) {
      return res.status(404).send({ message: 'Project not found' });
    }
    res.status(200).send(result[0]);
  });
});

// 4. Update a project by ID
app.put('/api/projects/:id', (req, res) => {
    const { id } = req.params;
    const { firstname, lastname, phone_number, email, address, postal_code, project_details, detailed_requirements } = req.body;

    // Check if at least one field is provided for update
    if (!firstname && !lastname && !phone_number && !email && !address && !postal_code && !project_details && !detailed_requirements) {
        return res.status(400).send({ message: 'No fields to update' });
    }

    let query = 'UPDATE projects SET ';
    const fieldsToUpdate = [];
    const values = [];

    if (firstname) {
        fieldsToUpdate.push('firstname = ?');
        values.push(firstname);
    }
    if (lastname) {
        fieldsToUpdate.push('lastname = ?');
        values.push(lastname);
    }
    if (phone_number) {
        fieldsToUpdate.push('phone_number = ?');
        values.push(phone_number);
    }
    if (email) {
        fieldsToUpdate.push('email = ?');
        values.push(email);
    }
    if (address) {
        fieldsToUpdate.push('address = ?');
        values.push(address);
    }
    if (postal_code) {
        fieldsToUpdate.push('postal_code = ?');
        values.push(postal_code);
    }
    if (project_details) {
        fieldsToUpdate.push('project_details = ?');
        values.push(project_details);
    }
    if (detailed_requirements) {
        fieldsToUpdate.push('detailed_requirements = ?');
        values.push(detailed_requirements);
    }

    query += fieldsToUpdate.join(', ');
    query += ' WHERE id = ?';
    values.push(id);

    db.query(query, values, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'Project not found' });
        }
        res.status(200).send({ message: 'Project updated successfully' });
    });
});


// 5. Delete a project by ID
app.delete('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM projects WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (result.affectedRows === 0) {
      return res.status(404).send({ message: 'Project not found' });
    }
    res.status(200).send({ message: 'Project deleted successfully' });
  });
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

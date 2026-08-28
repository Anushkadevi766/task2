const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Task Manager Backend is working!"
  });
});

// Register
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  const sql = `
    INSERT INTO users (name, email, password)
    VALUES (?, ?, ?)
  `;

  db.run(sql, [name, email, password], function (err) {
    if (err) {
      if (err.message.includes("UNIQUE")) {
        return res.status(400).json({
          message: "Email already registered!"
        });
      }

      console.error(err);

      return res.status(500).json({
        message: "Registration failed."
      });
    }

    console.log("New registration:", email);

    res.json({
      message: "Registration successful!",
      user: {
        id: this.lastID,
        name,
        email
      }
    });
  });
});

// Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = `
    SELECT * FROM users
    WHERE email = ? AND password = ?
  `;

  db.get(sql, [email, password], (err, user) => {
    if (err) {
      console.error(err);

      return res.status(500).json({
        message: "Login failed."
      });
    }

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    console.log("Successful login:", email);

    res.json({
      message: "Login successful!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  });
});

// Get user's tasks
app.get("/tasks/:userId", (req, res) => {
  const { userId } = req.params;

  db.all(
    "SELECT * FROM tasks WHERE user_id = ? ORDER BY id DESC",
    [userId],
    (err, tasks) => {
      if (err) {
        console.error(err);

        return res.status(500).json({
          message: "Could not load tasks."
        });
      }

      res.json(tasks);
    }
  );
});

// Add Task
app.post("/tasks", (req, res) => {
  const { userId, title, description } = req.body;

  const sql = `
    INSERT INTO tasks (user_id, title, description, status)
    VALUES (?, ?, ?, ?)
  `;

  db.run(
    sql,
    [userId, title, description, "Pending"],
    function (err) {
      if (err) {
        console.error(err);

        return res.status(500).json({
          message: "Could not add task."
        });
      }

      console.log("New task received:", title);

      res.json({
        message: "Task added successfully!",
        task: {
          id: this.lastID,
          user_id: userId,
          title,
          description,
          status: "Pending"
        }
      });
    }
  );
});

// Delete Task
app.delete("/tasks/:id", (req, res) => {
  const { id } = req.params;

  db.run(
    "DELETE FROM tasks WHERE id = ?",
    [id],
    function (err) {
      if (err) {
        console.error(err);

        return res.status(500).json({
          message: "Could not delete task."
        });
      }

      res.json({
        message: "Task deleted successfully!"
      });
    }
  );
});

// Complete Task
app.put("/tasks/:id", (req, res) => {
  const { id } = req.params;

  db.run(
    "UPDATE tasks SET status = ? WHERE id = ?",
    ["Completed", id],
    function (err) {
      if (err) {
        console.error(err);

        return res.status(500).json({
          message: "Could not complete task."
        });
      }

      res.json({
        message: "Task completed successfully!",
        status: "Completed"
      });
    }
  );
});

// Edit Task
app.put("/tasks/:id/edit", (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  db.run(
    `
    UPDATE tasks
    SET title = ?, description = ?
    WHERE id = ?
    `,
    [title, description, id],
    function (err) {
      if (err) {
        console.error(err);

        return res.status(500).json({
          message: "Could not update task."
        });
      }

      res.json({
        message: "Task updated successfully!",
        task: {
          id,
          title,
          description
        }
      });
    }
  );
});

// Start server
const PORT = 5000;

app.listen(PORT, () => {
  console.log(
    `Backend running on http://localhost:${PORT}`
  );
});
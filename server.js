const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const PORT = 3000;

// Connect to the correct database
const db = new sqlite3.Database("./tasks.db", (err) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
  } else {
    console.log("Connected to tasks.db");
  }
});

// Recreate table with the correct schema including 'done'
db.serialize(() => {
  // Drop the existing table if it exists
  db.run("DROP TABLE IF EXISTS tasks", (err) => {
    if (err) {
      console.error("Error dropping table:", err.message);
    } else {
      console.log("Dropped existing tasks table");
    }
  });

  // Create the table with the correct schema
  db.run(
    `
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      done INTEGER DEFAULT 0
    )
  `,
    (err) => {
      if (err) {
        console.error("Error creating table:", err.message);
      } else {
        console.log("Tasks table created with correct schema");
      }
    }
  );

  // Log all tasks in the database after table creation for debugging
  db.all("SELECT * FROM tasks", (err, rows) => {
    if (err) {
      console.error("Error fetching tasks on startup:", err.message);
    } else {
      console.log("Tasks in database on startup:", rows);
    }
  });
});

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Get all tasks
app.get("/api/tasks", (req, res) => {
  db.all("SELECT * FROM tasks", (err, rows) => {
    if (err) {
      console.error("Error fetching tasks:", err.message);
      return res.status(500).json({ error: err.message });
    }
    console.log("Fetched tasks for /api/tasks:", rows);
    res.json(rows);
  });
});

// Add new task
app.post("/api/tasks", (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: "Title and description are required" });
  }

  db.run(
    "INSERT INTO tasks (title, description) VALUES (?, ?)",
    [title, description],
    function (err) {
      if (err) {
        console.error("Error adding task:", err.message);
        return res.status(500).json({ error: err.message });
      }
      const newTask = { id: this.lastID, title, description, done: 0 };
      console.log("Added new task:", newTask);
      db.all("SELECT * FROM tasks", (err, rows) => {
        if (err) {
          console.error("Error verifying database after adding task:", err.message);
        } else {
          console.log("Database contents after adding task:", rows);
        }
      });
      res.json(newTask);
    }
  );
});

// Update task "done" status
app.patch("/api/tasks/:id", (req, res) => {
  const { done } = req.body;
  if (typeof done !== "number" || ![0, 1].includes(done)) {
    return res.status(400).json({ error: "Invalid done value (must be 0 or 1)" });
  }

  db.run(
    "UPDATE tasks SET done = ? WHERE id = ?",
    [done, req.params.id],
    function (err) {
      if (err) {
        console.error("Error updating task:", err.message);
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Task not found" });
      }
      console.log(`Updated task ${req.params.id} done status to ${done}`);
      res.json({ success: true });
    }
  );
});

// Delete task
app.delete("/api/tasks/:id", (req, res) => {
  db.run("DELETE FROM tasks WHERE id = ?", [req.params.id], function (err) {
    if (err) {
      console.error("Error deleting task:", err.message);
      return res.status(500).json({ error: err.message });
    }
    console.log(`Deleted task with id ${req.params.id}`);
    res.json({ success: true });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

// Close the database connection on process exit
process.on("SIGINT", () => {
  db.close((err) => {
    if (err) {
      console.error("Error closing database:", err.message);
    }
    console.log("Database connection closed");
    process.exit(0);
  });
});
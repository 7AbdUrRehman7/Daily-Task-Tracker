# Full-Stack Task Manager App

A simple and efficient Task-Tracker application built with Node.js, Express, and SQLite. This app allows users to add, delete, and mark tasks as done.

## Features
- Add tasks with a title and description.
- Delete tasks with a single click.
- Mark tasks as "done" with a persistent state (line-through effect).
- Data is stored in a local SQLite database.
- Responsive and lightweight web interface.
- More features coming soon.....

## Prerequisites
- Node.js (v14.x or later recommended)
- npm (comes with Node.js)

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/7AbdUrRehman7/Daily-Task-Tracker.git
2. Navigate to the project directory:
   ```bash
   cd Daily-Task-Tracker
3. Install dependencies (If not already):
   ```bash
   npm install
4. Start the server:
   ```bash
   node server.js
5. Open your browser and go to http://localhost:3000

## Usage
- Enter a task title and description in the form and click "Add Task" to create a new task.
- Click the "✅" button to mark a task as done (toggles line-through).
- Click the "❌" button to delete a task.
- Refresh the page to see tasks persist.

## Project Structure
```graphql
Daily-Task-Tracker/
├── server.js          # Main server file with Express and SQLite setup
├── public/
│   ├── index.html     # The main HTML structure
│   ├── app.js         # JavaScript for client-side logic
│   └── style.css      # Styling for the app
├── tasks.db           # SQLite database file (auto-generated)
└── .gitignore         # Excludes node_modules/ and tasks.db from version control

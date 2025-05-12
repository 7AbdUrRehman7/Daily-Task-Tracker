document.addEventListener("DOMContentLoaded", () => {
  const taskForm = document.getElementById("task-form");
  const taskInput = document.getElementById("task-title");
  const taskDesc = document.getElementById("task-desc");
  const taskList = document.getElementById("task-list");

  // Load existing tasks from server
  console.log("Fetching tasks on page load...");
  fetch("/api/tasks")
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      return res.json();
    })
    .then((tasks) => {
      console.log("Tasks received from server:", tasks);
      if (!Array.isArray(tasks)) {
        console.warn("Tasks is not an array, treating as empty:", tasks);
        tasks = [];
      }
      if (tasks.length > 0) {
        tasks.forEach(addTaskToDOM);
      } else {
        console.log("No tasks to load.");
      }
    })
    .catch((err) => {
      console.error("Failed to load tasks:", err);
      console.log("Falling back to empty task list.");
      taskList.innerHTML = "";
    });

  // Add new task
  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = taskInput.value.trim();
    const description = taskDesc.value.trim();

    if (!title || !description) return;

    fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    })
      .then((res) => res.json())
      .then((task) => {
        addTaskToDOM(task);
        taskInput.value = "";
        taskDesc.value = "";
      })
      .catch((err) => console.error("Failed to add task:", err));
  });

  // Handle task actions (delete or mark as done)
  taskList.addEventListener("click", (e) => {
    const li = e.target.closest("li");
    const id = li.dataset.id;

    if (e.target.classList.contains("delete-btn")) {
      // Delete task
      fetch(`/api/tasks/${id}`, { method: "DELETE" })
        .then((res) => res.json())
        .then(() => {
          li.remove();
        })
        .catch((err) => console.error("Failed to delete task:", err));
    } else if (e.target.classList.contains("done-btn")) {
      // Mark task as done
      const taskText = li.querySelector("div");
      const isDone = taskText.style.textDecoration === "line-through";
      const newDoneState = isDone ? 0 : 1;

      fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: newDoneState }),
      })
        .then((res) => res.json())
        .then(() => {
          taskText.style.textDecoration = newDoneState ? "line-through" : "none";
        })
        .catch((err) => console.error("Failed to update task:", err));
    }
  });

  function addTaskToDOM(task) {
    console.log("Adding task to DOM:", task);
    const li = document.createElement("li");
    li.className = "task-item";
    li.dataset.id = task.id;

    const taskText = document.createElement("div");
    taskText.innerHTML = `<strong>${task.title}</strong><br>${task.description}`;
    // Apply "done" style if task is marked as done
    if (task.done) {
      taskText.style.textDecoration = "line-through";
    }

    const doneBtn = document.createElement("button");
    doneBtn.textContent = "✅";
    doneBtn.classList.add("done-btn");

    const delBtn = document.createElement("button");
    delBtn.textContent = "❌";
    delBtn.classList.add("delete-btn");

    const actions = document.createElement("div");
    actions.className = "task-actions";
    actions.appendChild(doneBtn);
    actions.appendChild(delBtn);

    li.appendChild(taskText);
    li.appendChild(actions);
    taskList.appendChild(li);
  }
});
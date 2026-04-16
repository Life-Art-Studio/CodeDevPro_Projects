"use strict"
let todoList = document.querySelector("#todo-list");
let progress = document.querySelector("#progress-list");
let done = document.querySelector("#done-list");

let taskList = document.querySelectorAll(".task-item");

let input = document.querySelector("#taskInput");

let addBtn = document.querySelector("#addTaskBtn");
let draggedItem = null;

[todoList, progress, done].forEach((list) => {
  dragNdrop(list);
});

function dragNdrop(container) {
  container.addEventListener("dragover", function (e) {
    e.preventDefault(); // Required to allow drop
  });

  container.addEventListener("drop", function (e) {
    e.preventDefault();

    if (draggedItem) {
      draggedItem.status = container.id;
      renderBoard(tasks);
      saveState();
    }
  });
}
let tasks = [];
addBtn.addEventListener("click", function () {
  let inputValue = input.value;
  if (inputValue.trim() === "") return;
  const newTask = {
    id: Date.now(), // Gives it a unique number based on the current time
    text: inputValue,
    status: "todo-list",
  };
  input.value = "";
  tasks.push(newTask);

  renderBoard(tasks);
  saveState();
});

function renderBoard(taskToRender = tasks) {
  todoList.innerHTML = "";
  progress.innerHTML = "";
  done.innerHTML = "";

  taskToRender.forEach((task) => {
    let taskCard = document.createElement("div");
    taskCard.classList.add("task-item");
    taskCard.setAttribute("draggable", "true");

    taskCard.addEventListener("dragstart", () => {
      draggedItem = task;
    });

    let dateString = new Date(task.id).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    let taskDate = document.createElement("small");
    taskDate.innerText = `Added ${dateString}`;
    taskDate.classList.add("task-date");

    let taskText = document.createElement("span");
    taskText.innerText = task.text;

    taskText.addEventListener("dblclick", () => {
      let editInput = document.createElement("input");
      editInput.type = "text";
      editInput.value = task.text;

      taskCard.replaceChild(editInput, taskText);
      editInput.focus();

      const saveEdit = () => {
        if (editInput.value.trim() !== "") {
          task.text = editInput.value;
        }
        renderBoard();
        saveState();
      };

      editInput.addEventListener("blur", saveEdit);
      editInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") saveEdit();
      });
    });

    let deleteBtn = document.createElement("button");
    deleteBtn.innerText = "x";
    deleteBtn.classList.add("delete-btn");

    deleteBtn.addEventListener("click", (e) => {
      tasks = tasks.filter((t) => t.id !== task.id);

      renderBoard(tasks);
      saveState();
    });

    taskCard.appendChild(taskText);
    taskCard.appendChild(deleteBtn);
    taskCard.appendChild(taskDate);

    if (task.status === "todo-list") todoList.appendChild(taskCard);
    if (task.status === "progress-list") progress.appendChild(taskCard);
    if (task.status === "done-list") done.appendChild(taskCard);
  });
}

function saveState() {
  localStorage.setItem("myKanbanBoard", JSON.stringify(tasks));
}
function loadState() {
  let savedData = localStorage.getItem("myKanbanBoard");

  if (savedData) {
    tasks = JSON.parse(savedData);
    renderBoard(tasks);
  }
}
loadState();

let themeToggleBtn = document.querySelector("#themeToggleBtn");

themeToggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  if (document.body.classList.contains("light-mode")) {
    themeToggleBtn.innerText = "☀️";
    localStorage.setItem("theme", "light");
  } else {
    themeToggleBtn.innerText = "🌙";
    localStorage.setItem("theme", "dark");
  }
});

let savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
  document.body.classList.add("light-mode");
  themeToggleBtn.innerText = "☀️";
}

let searchInput = document.querySelector("#searchInput");
let debounceTimer;

searchInput.addEventListener("input", (e) => {
  clearTimeout(debounceTimer);

  let searchWord = e.target.value.toLowerCase();

  let filteredTasks = tasks.filter((task) => {
    return task.text.toLowerCase().includes(searchWord);
  });

  debounceTimer = setTimeout(() => {
    renderBoard(filteredTasks);
  }, 500);
});

let sortBtn = document.querySelector("#sortBtn");
let isSortedAtoZ = false;

sortBtn.addEventListener("click", () => {
  if (isSortedAtoZ) {
    tasks.sort((a, b) => a.id - b.id);
    isSortedAtoZ = false;
  } else {
    tasks.sort((a, b) => a.text.localeCompare(b.text));
    isSortedAtoZ = true;
  }

  renderBoard();
  saveState();
});

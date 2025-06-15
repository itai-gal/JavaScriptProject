let tasks = [];
let currentFilter = "all";

const taskText = document.getElementById("taskText");
const taskDate = document.getElementById("taskDate");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const sortBtn = document.getElementById("sortBtn");
const filterButtons = document.querySelectorAll(".filters button");

//  אחסון ב LocalStorage
function getTasks() {
    const stored = localStorage.getItem("tasks");
    return stored ? JSON.parse(stored) : [];
}

function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// רינדור
function renderTasks() {
    taskList.innerHTML = "";
    const filtered = filterTasks(tasks, currentFilter);
    filtered.forEach((task, index) => {
        const li = document.createElement("li");
        li.className = task.completed ? "completed" : "";
        if (task.source === "api") li.classList.add("api-task");

        li.innerHTML = `
      <span>${task.text} - ${task.dueDate || "ללא תאריך"}</span>
      <div class="task-buttons">
        <button data-id="${index}" class="completeBtn">✅</button>
        <button data-id="${index}" class="deleteBtn">🗑️</button>
      </div>
    `;
        taskList.appendChild(li);
    });
}

// הוספה של משימות
function addTask() {
    const text = taskText.value.trim();
    const dueDate = taskDate.value;

    if (!text) {
        alert("נא להזין תיאור משימה");
        return;
    }

    const newTask = {
        text,
        dueDate,
        completed: false,
        source: "user"
    };

    tasks.push(newTask);
    saveTasks(tasks);
    renderTasks();
    taskText.value = "";
    taskDate.value = "";
}

// סינון
function filterTasks(tasks, filter) {
    switch (filter) {
        case "completed":
            return tasks.filter(t => t.completed);
        case "active":
            return tasks.filter(t => !t.completed);
        default:
            return tasks;
    }
}

//  מיון
function sortTasks() {
    tasks.sort((a, b) => new Date(a.dueDate || Infinity) - new Date(b.dueDate || Infinity));
    saveTasks(tasks);
    renderTasks();
}

//  טעינה ראשונית של המשימות
async function fetchInitialTasks() {
    try {
        const storedTasks = getTasks();
        const localOnly = storedTasks.filter(t => t.source !== "api");

        if (localOnly.length >= 5) {
            tasks = localOnly;
            renderTasks();
            return;
        }

        const res = await fetch("https://jsonplaceholder.typicode.com/todos?_limit=5");
        if (!res.ok) throw new Error("שגיאה בטעינת משימות");

        const data = await res.json();
        const apiTasks = data.map(item => ({
            text: item.title,
            dueDate: "",
            completed: item.completed,
            source: "api"
        }));

        tasks = [...localOnly, ...apiTasks];
        saveTasks(tasks);
        renderTasks();
    } catch (err) {
        alert("שגיאה בטעינת משימות");
        console.error(err);
    }
}


addTaskBtn.addEventListener("click", addTask);

filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

sortBtn.addEventListener("click", sortTasks);

taskList.addEventListener("click", (e) => {
    const id = e.target.dataset.id;
    if (!id) return;

    if (e.target.classList.contains("completeBtn")) {
        tasks[id].completed = !tasks[id].completed;
    } else if (e.target.classList.contains("deleteBtn")) {
        tasks.splice(id, 1);
    }

    saveTasks(tasks);
    renderTasks();
});

// אתחול המערכת
window.addEventListener("DOMContentLoaded", fetchInitialTasks);

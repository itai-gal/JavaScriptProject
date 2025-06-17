let tasks = [];
let currentFilter = "all";

const taskText = document.getElementById("taskText");
const taskDate = document.getElementById("taskDate");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const sortBtn = document.getElementById("sortBtn");
const filterButtons = document.querySelectorAll(".filters button");

//  טעינת משימות מ LocalStorage במידה ויש
function getTasks() {
    const stored = localStorage.getItem("tasks");
    return stored ? JSON.parse(stored) : [];
}

// שומר את המשימות באחסון ומעדכן את המערך.
function saveTasks(tasksToSave) {
    localStorage.setItem("tasks", JSON.stringify(tasksToSave));
    tasks = tasksToSave;
}

// רינדור של המשימות
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

// הוספה של משימה
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

// סינון משימות
function filterTasks(tasksToFilter, filter) {
    switch (filter) {
        case "completed":
            return tasksToFilter.filter(t => t.completed);
        case "active":
            return tasksToFilter.filter(t => !t.completed);
        default:
            return tasksToFilter;
    }
}
// מיון לפי תאריך המשימה
function sortTasks() {
    console.log(tasks);
    const newTasks = [...tasks].sort((a, b) => {
        const dateA = a.dueDate ? new Date(a.dueDate) : null;
        const dateB = b.dueDate ? new Date(b.dueDate) : null;
        if (!dateA && !dateB) return 0;         // אם אין תאריכים – לא משנים מיקום.
        if (!dateA) return 1;                   // אם רק לאחד מהם יש תאריך – הוא קודם.
        if (!dateB) return -1;                  // אם רק לאחד מהם יש תאריך – הוא קודם.
        return dateA - dateB;                   // אם לשניהם יש תאריך – משווים ביניהם.
    });
    console.log(newTasks);
    saveTasks(newTasks);
    renderTasks();
}
// שמירת המשימות הממוינות ורנדור מחדש


//  טעינה ראשונית של המשימות מה -API
async function fetchInitialTasks() {
    try {
        const res = await fetch("https://jsonplaceholder.typicode.com/todos?_limit=5");
        if (!res.ok) throw new Error("שגיאה בטעינת משימות");

        const data = await res.json();

        const fetchedTasks = data.map(item => ({
            text: item.title,
            dueDate: "", // אין תאריך מה-API
            completed: item.completed
        }));

        tasks = getTasks();
        if (tasks.length === 0) {
            tasks = fetchedTasks;
            saveTasks(tasks);
        }

        renderTasks();
    } catch (err) {
        alert("אירעה שגיאה בטעינת המשימות מהשרת");
        console.error(err);
    }
}
// אם אין משימות ב־localStorage, משתמש במשימות מהשרת.
// מרנדר הכל.

// כפתור הוספה
addTaskBtn.addEventListener("click", addTask);
// סינון
filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});
// מיון
sortBtn.addEventListener("click", sortTasks);
// מחיקה או השלמה של משימות
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

// בעת טעינת ראשונית של הדף - קורא למשימות מאיפיאי ומהלוקאל סטוראג
window.addEventListener("DOMContentLoaded", fetchInitialTasks);

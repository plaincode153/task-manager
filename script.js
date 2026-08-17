const taskInputContainer = document.querySelector(".task-input")
const taskInput = document.querySelector("#task-input")
const addButton = document.querySelector("#add-btn")
const taskList = document.querySelector("#task-list")
const filters = document.querySelector(".filters")

let tasks = []

let savedTasks = JSON.parse(localStorage.getItem("tasks"))

if (savedTasks !== null) {
    tasks = savedTasks
    renderTasks(tasks)
}


addButton.addEventListener("click", (event) => {
    let taskText = taskInput.value
    createTask(taskText)
    renderTasks(tasks)
    taskInput.value = ""
})

let taskId = 0

if (localStorage.getItem("taskId") !== null) {
    taskId = Number(localStorage.getItem("taskId"))
}


function createTask(taskText) {
    taskId++
    saveTaskId()

    tasks.push({
        task: taskText,
        category: "active",
        id: taskId
    })
    saveTasks()
}

function renderTasks(arrayToRender) {
    let taskHTML = arrayToRender.map((task) => {
        let colorClass;
        let buttonClass;
        let buttonText;

        if (task.category === "active") {
            colorClass = "green-color"
            buttonClass = "complete-btn"
            buttonText = "Complete"
        }

        if (task.category === "completed") {
            colorClass = "yellow-color"
            buttonClass = "undo-btn"
            buttonText = "Undo"
        }

        return `
            <div id="${task.id}" class="task ${colorClass}">
                <p>${task.task}</p>
                <button class="delete-btn">Delete</button>
                <button class="${buttonClass}">${buttonText}</button>
            </div>
        `
    })

    taskList.innerHTML = taskHTML.join("")
}

taskList.addEventListener("click", (event) => {
    if (event.target.tagName === "BUTTON") {
        handleTaskButton(event)
    }
}
)

let findTask = (event) => {
    let taskElement = event.target.closest(".task")

    return tasks.find((task) => {
        return task.id === Number(taskElement.id)
    })
}

function handleTaskButton(event) {
    let task = findTask(event)

    if (event.target.classList.contains("undo-btn")) {
        task.category = "active"
        renderTasks(tasks)
    }

    if (event.target.classList.contains("complete-btn")) {
        task.category = "completed"
        renderTasks(tasks)
    }

    if (event.target.classList.contains("delete-btn")) {
        let index = tasks.findIndex((each) => {
            return task.id === each.id
        })

        tasks.splice(index, 1)
        renderTasks(tasks)
    }
    saveTasks()

}

filters.addEventListener("click", (event) => {

    if (event.target.tagName === "BUTTON") {
        handleFilterButtons(event)
    }

})

function handleFilterButtons(event) {

    let filteredArr;

    if (event.target.classList.contains("complete-btn")) {
        filteredArr = tasks.filter((task) => {
            return task.category === "completed"
        })
    }
    if (event.target.classList.contains("active-btn")) {
        filteredArr = tasks.filter((task) => {
            return task.category === "active"
        })
    }
    if (event.target.classList.contains("all-btn")) {
        filteredArr = tasks.filter((task) => {
            return true
        })
    }
    renderTasks(filteredArr)
}

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks))
}

function saveTaskId() {
    localStorage.setItem("taskId", taskId)
}

console.log(tasks)
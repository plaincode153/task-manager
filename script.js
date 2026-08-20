const taskInputContainer = document.querySelector(".task-input")
const taskInput = document.querySelector("#task-input")
const addButton = document.querySelector("#add-btn")
const taskList = document.querySelector("#task-list")
const filters = document.querySelector(".filters")
const editWarning = document.querySelector("#edit-warning")
const editWarningText = document.querySelector("#edit-warning p")
const dateInput = document.querySelector("#date-input")
const searchInput = document.querySelector("#search-input")
const sortSelection = document.querySelector("#sort-select")

let tasks = []
let taskId = 0

let currentFilter = "all"
let currentSearch = ""




// LOAD SAVED DATA

let savedTasks = JSON.parse(localStorage.getItem("tasks"))

if (savedTasks !== null) {
    tasks = savedTasks
    renderTasks(tasks)
}

if (localStorage.getItem("taskId") !== null) {
    taskId = Number(localStorage.getItem("taskId"))
}



// TASK CREATION

addButton.addEventListener("click", (event) => {
    let taskText = taskInput.value
    createTask(taskText)
    renderTasks(tasks)
    taskInput.value = ""
})

function createTask(taskText) {
    taskId++
    saveTaskId()

    tasks.push({
        task: taskText,
        category: "active",
        id: taskId,
        due: dateInput.value
    })

    saveTasks()
}


// TASK RENDERING

function handleDate(task) {

    let dueDateParts = task.due.split("-")
    let currentDateObj = new Date()
    currentDateObj.setHours(0, 0, 0, 0)
    dueDateObj = new Date(dueDateParts[0], dueDateParts[1] - 1, dueDateParts[2])

    let difference = dueDateObj - currentDateObj
    if (Number.isNaN(difference)) {
        return ""
    }
    return (difference / 1000 / 60 / 60 / 24)

}

function handleDateMessage(day) {
    if (day === "") {
        return ""
    }
    if (day > 7) {
        return `<p class="due-normal">Due in ${day} days</p>`
    }
    if (day === 7) {
        return `<p class="due-soon">Due in ${day} days</p>`
    }
    if (day > 0 && day < 7) {
        return `<p class="due-urgent">Due in ${day} days</p>`
    }
    if (day === 0) {
        return `<p class="due-today">Due today!</p>`
    }
    if (day === -1) {
        return `<p class="due-today">${Math.abs(day)} day overdue!</p>`
    }
    if (day < -1) {
        return `<p class="due-today">${Math.abs(day)} days overdue!</p>`
    }
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

        if (task.edit === true) {
            return `
            <div id="${task.id}" class="task ${colorClass}">
                <input value="${task.task}" type="text">
                ${handleDateMessage(handleDate(task))}
                <button class="delete-btn">Delete</button>
                <button class="submit-btn">Submit</button>
                <button class="${buttonClass}">${buttonText}</button>
            </div>
        `
        }

        return `
            <div id="${task.id}" class="task ${colorClass}">
                <p>${task.task}</p>
                ${handleDateMessage(handleDate(task))}
                <button class="delete-btn">Delete</button>
                <button class="edit-btn">Edit</button>
                <button class="${buttonClass}">${buttonText}</button>
            </div>
        `
    })

    taskList.innerHTML = taskHTML.join("")
}


// TASK ACTIONS


taskList.addEventListener("click", (event) => {
    if (event.target.tagName === "BUTTON") {
        handleTaskButton(event)
    }
})

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

        renderTasks(getFilteredTasks())
    }

    handleEditButton(event, task)

    saveTasks()
}

// EDITING

function handleEditButton(event, task) {

    if (event.target.classList.contains("edit-btn")) {

        let duplicate = false

        for (let i = 0; i < tasks.length; i++) {
            if (tasks[i].edit === true) {
                duplicate = true
                editWarningFunction()
                break
            }
        }
        if (duplicate === false) {
            task.edit = true
            renderTasks(getFilteredTasks())
        }
    }

    if (event.target.classList.contains("submit-btn")) {
        let HTMLtask = event.target.closest(".task")
        let input = HTMLtask.querySelector("input")
        task.task = input.value
        task.edit = false

        editWarningText.textContent = "" // Clear the edit warning once the edit is submitted

        renderTasks(getFilteredTasks())
    }
}



// FILTERING

let sorting = "default"

sortSelection.addEventListener("change", (event) => {
    sorting = event.target.value
    handleSorting()
    renderTasks(getFilteredTasks())
})

function handleSorting() {
    if (sorting === "default") {
        tasks.sort((a, b) => {
            return a.id - b.id
        });
    }
    if (sorting === "due-soonest") {
        tasks.sort((a, b) => {
            if (a.due > b.due) {
                return -1
            }
            if (a.due < b.due) {
                return 1
            }
        })
    }
    if (sorting === "due-latest") {
        tasks.sort((a, b) => {
            if (a.due > b.due) {
                return 1
            }
            if (a.due < b.due) {
                return -1
            }
        })
    }
}



searchInput.addEventListener("input", (event) => {
    currentSearch = event.target.value
    renderTasks(handleCurrentSearch())
})

function handleCurrentSearch() {
    if (currentFilter === "all") {
        return tasks.filter((each) => {
            return each.task.toLowerCase().includes(currentSearch.toLowerCase())
        })
    }
    let filteredTasks = tasks.filter((each) => {
        return each.category === currentFilter
    })
    return filteredTasks.filter((each) => {
        return each.task.toLowerCase().includes(currentSearch.toLowerCase())
    })
}

function getFilteredTasks() {

    if (currentSearch.length > 0) {
        return handleCurrentSearch()
    }

    if (currentFilter === "all") {
        return tasks
    }
    return tasks.filter((each) => {
        return each.category === currentFilter
    })
}

filters.addEventListener("click", (event) => {
    if (event.target.tagName === "BUTTON") {
        handleEditInProgress(event)
        handleFilterButtons(event)
    }
})

function handleFilterButtons(event) {

    // Checking whether there are edits in progress
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].edit === true) {
            return
        }
    }

    if (event.target.classList.contains("complete-btn")) {
        currentFilter = "completed"
    }

    if (event.target.classList.contains("active-btn")) {
        currentFilter = "active"
    }

    if (event.target.classList.contains("all-btn")) {
        currentFilter = "all"
    }

    renderTasks(getFilteredTasks()
    )
}

function handleEditInProgress(event) {
    let check = false

    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].edit === true) {
            check = true
        }
    }

    if (check === false) {
        return
    }

    if (
        event.target.classList.contains("all-btn") ||
        event.target.classList.contains("active-btn") ||
        event.target.classList.contains("complete-btn")
    ) {
        switchingFiltersWarning()
    }
}


// UI MESSAGES

function editWarningFunction() {
    editWarningText.textContent =
        "Finish editing the current task first before editing another task."
}

function switchingFiltersWarning() {
    editWarningText.textContent =
        "Finish editing the current task first before switching filters."
}


// LOCAL STORAGE

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks))
}

function saveTaskId() {
    localStorage.setItem("taskId", taskId)
}
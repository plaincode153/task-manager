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
    if (handleValidity(taskInput)) {
        let taskText = taskInput.value
        createTask(taskText)
        renderTasks(getVisibleTasks())
        taskInput.value = ""
    }
})

taskInput.addEventListener("input", (event) => {
    handleValidity(taskInput)
})

function handleValidity(input) {
    input.setCustomValidity("")

    if (input.validity.tooShort) {
        input.setCustomValidity("task needs to be at least two characters.")
    }
    return input.reportValidity()
}

function createTask(taskText) {
    taskId++
    saveTaskId()

    tasks.push({
        task: taskText,
        category: "active",
        id: taskId,
        due: dateInput.value,
        edit: false
    })

    saveTasks()
}


// DATE AND TIME MANAGEMENT

function handleDate(task) {

    let dueDateParts = task.due.split("-")
    let currentDateObj = new Date()
    currentDateObj.setHours(0, 0, 0, 0)
    let dueDateObj = new Date(dueDateParts[0], dueDateParts[1] - 1, dueDateParts[2])

    let difference = dueDateObj - currentDateObj
    if (Number.isNaN(difference)) {
        return ""
    }

    return Math.round(difference / 1000 / 60 / 60 / 24)
}

function handleDateElement(day) {
    let paragraphDate = document.createElement("p")

    if (day === "") {
        paragraphDate.className = ""
        paragraphDate.textContent("")
    }
    if (day > 7) {
        paragraphDate.classList.add("due-normal")
        paragraphDate.textContent = `Due in ${day} days`
    }
    if (day === 7) {
        paragraphDate.classList.add("due-normal")
        paragraphDate.textContent = `Due in ${day} days`
    }
    if (day > 0 && day < 7) {
        paragraphDate.classList.add("due-normal")
        paragraphDate.textContent = `Due in ${day} days`
    }
    if (day === 0) {
        paragraphDate.classList.add("due-normal")
        paragraphDate.textContent = `Due today`
    }
    if (day === -1) {
        paragraphDate.classList.add("due-normal")
        paragraphDate.textContent = `overdue by 1 day`
    }
    if (day < -1) {
        paragraphDate.classList.add("due-normal")
        paragraphDate.textContent = `overdue by ${Math.abs(day)} days`
    }
    return paragraphDate
}

function handleDefaultDate() {
    let dateObj = new Date()
    let currentDateString = [dateObj.getFullYear(), String(dateObj.getMonth() + 1).padStart(2, "0"), String(dateObj.getDate()).padStart(2, "0")].join("-")
    dateInput.value = currentDateString
    dateInput.min = currentDateString
}

handleDefaultDate()


// TASK RENDERING

function renderTasks(arrayToRender) {
    taskList.textContent = ""
    let taskHTML = arrayToRender.forEach((task) => {

        let btnClass;
        let text;

        if (task.category === "active") {
            text = "Complete"
            btnClass = "complete-btn"
        }
        if (task.category === "completed") {
            text = "Undo"
            btnClass = "undo-btn"
        }


        let div = document.createElement("div")
        div.classList.add("task")
        div.id = task.id

        let paragraphOrInput

        let paragraphDate = handleDateElement(handleDate(task))

        let deleteButton = document.createElement("button")
        deleteButton.classList.add("delete-btn")
        deleteButton.textContent = "Delete"

        let submitOrEditButton = document.createElement("button")

        let completeUndoButton = document.createElement("button")
        completeUndoButton.classList.add(`${btnClass}`)
        completeUndoButton.textContent = text

        if (task.edit === false) {
            paragraphOrInput = document.createElement("p")
            paragraphOrInput.textContent = task.task
            submitOrEditButton.classList.add("edit-btn")
            submitOrEditButton.textContent = "Edit"

        }

        if (task.edit === true) {
            paragraphOrInput = document.createElement("input")
            paragraphOrInput.value = task.task
            submitOrEditButton.classList.add("submit-btn")
            submitOrEditButton.textContent = `Submit`
        }

        div.append(paragraphOrInput, paragraphDate, deleteButton, submitOrEditButton, completeUndoButton)
        taskList.append(div)
    })
}


// VISIBLE TASKS 

function getVisibleTasks() {
    // active, completed, and all filters
    let visibleTasks = tasks.filter((each) => {
        if (currentFilter === "all") {
            return true
        }
        return each.category === currentFilter
    })

    handleSorting(visibleTasks)

    visibleTasks = handleSearch(visibleTasks)

    return visibleTasks
}

filters.addEventListener("click", (event) => {
    if (tasks.some((task) => task.edit === true)) {
        switchWarningFunction()
        return
    }
    handleFilterButtons(event)
})

function handleFilterButtons(event) {

    if (event.target.classList.contains("complete-btn")) {
        currentFilter = "completed"
    }
    if (event.target.classList.contains("active-btn")) {
        currentFilter = "active"
    }
    if (event.target.classList.contains("all-btn")) {
        currentFilter = "all"
    }

    renderTasks(getVisibleTasks())
}

// task list buttons 

taskList.addEventListener("click", (event) => {
    if (event.target.tagName === "BUTTON") {
        handleTaskButton(event)
    }
})

function handleTaskButton(event) {

    // finding the task via the html
    let HTMLtask = event.target.closest(".task")
    let task = tasks.find((task) => {
        return task.id === Number(HTMLtask.id)
    })

    if (event.target.classList.contains("undo-btn")) {
        task.category = "active"
    }

    if (event.target.classList.contains("complete-btn")) {
        task.category = "completed"
    }

    if (event.target.classList.contains("delete-btn")) {
        let index = tasks.findIndex((each) => {
            return task.id === each.id
        })
        tasks.splice(index, 1)
    }

    // editing

    let input = HTMLtask.querySelector("input")

    if (event.target.classList.contains("submit-btn")) {
        if (!handleValidity(input)) {
            return;
        }
        task.edit = false;
        task.task = input.value
        editWarningText.textContent = ""
    }
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].edit === true) {
            editWarningFunction()
            return;
        }
    }
    if (event.target.classList.contains("edit-btn")) {
        task.edit = true
    }


    renderTasks(getVisibleTasks())
    saveTasks()
}

// due soonest-latest sorting

sortSelection.addEventListener("change", () => {
    if (tasks.some((task) => task.edit === true)) {
        switchWarningFunction()
        return
    }
    renderTasks(getVisibleTasks())
})
function handleSorting(visibleTasks) {

    let option = sortSelection.value

    if (option === "default") {
        visibleTasks.sort((a, b) => {
            return a.id - b.id
        });
    }
    if (option === "due-soonest") {
        visibleTasks.sort((a, b) => {
            if (a.due > b.due) {
                return 1
            }
            if (a.due < b.due) {
                return -1
            }
            return 0
        })
    }
    if (option === "due-latest") {
        visibleTasks.sort((a, b) => {
            if (a.due > b.due) {
                return -1
            }
            if (a.due < b.due) {
                return 1
            }
            return 0
        })
    }
}

// searching 

searchInput.addEventListener("input", () => {
    renderTasks(getVisibleTasks())
})

function handleSearch(visibleTasks) {
    if (searchInput.value === "") {
        return visibleTasks

    }
    return visibleTasks.filter((task) => {
        return task.task.toLowerCase().includes(searchInput.value.toLowerCase())
    })
}

// UI MESSAGES

function switchWarningFunction() {
    editWarningText.textContent =
        "Finish editing before changing filters or sort by."
}

function editWarningFunction() {
    editWarningText.textContent =
        "Finish editing the current task first before editing another task."
}

// LOCAL STORAGE

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks))
}

function saveTaskId() {
    localStorage.setItem("taskId", taskId)
}
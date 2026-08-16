const taskInputContainer = document.querySelector(".task-input")
const taskInput = document.querySelector("#task-input")
const addButton = document.querySelector("#add-btn")
const taskList = document.querySelector("#task-list")
const filters = document.querySelector(".filters")

let tasks = []

addButton.addEventListener("click", (event) => {
    let taskText = taskInput.value
    createTask(taskText)
    renderTasks()
    taskInput.value = ""
})

let taskId = 0

function createTask(taskText) {
    taskId++

    tasks.push({
        task: taskText,
        category: "active",
        id: taskId
    })
}

function renderTasks() {
    let taskHTML = tasks.map((task) => {
        let colorClass;
        let buttonClass;
        let buttonText;

        if (task.category === "active") {
            colorClass = "active-color"
            buttonClass = "complete-btn"
            buttonText = "Complete"
        }

        if (task.category === "completed") {
            colorClass = "completed-color"
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
    handleTaskButton(event)
})

let findTask = (event) => {
    let taskElement = event.target.closest(".task")

    return tasks.find((task) => {
        return task.id === Number(taskElement.id)
    })
}

function handleTaskButton(event) {
    let task = findTask(event)
    console.log(task)

    if (event.target.classList.contains("undo-btn")) {
        task.category = "active"
        renderTasks()
    }

    if (event.target.classList.contains("complete-btn")) {
        task.category = "completed"
        renderTasks()
    }

    if (event.target.classList.contains("delete-btn")) {
        let index = tasks.findIndex((each) => {
            return task.id === each.id
        })
        
        tasks.splice(index, 1)
        renderTasks()
    }
}
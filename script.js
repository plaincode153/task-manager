

const taskInput = document.querySelector(".task-input")
const input = document.querySelector("#task-input")
const button = document.querySelector("#add-btn")
const taskList = document.querySelector("#task-list")
const filters = document.querySelector(".filters")

let tasks = []

button.addEventListener("click", (event) => {
    let task = input.value
    pushTask(task)
    addTask()
})

let taskId = 0

function pushTask(task) {
    taskId++
    tasks.push({
        task: task,
        category: "active",
        id: taskId
    })
}

function addTask() {

    let newtasks = tasks.map((each) => {
        return `
                 <div id="task-list">
                <div id="${each.id}" class="task">
                <p>${each.task}</p>
                <button class="complete-btn">Complete</button>
                </div>
        `})
    taskList.innerHTML = newtasks.join("")
}

taskList.addEventListener("click", (event) => {


    if (event.target.classList.contains("complete-btn")) {
        let task = event.target.closest(".task")

        let thing = tasks.find((each) => {
            return Number(task.id) === each.id
        })

        thing.category = "completed"
        addTask()
    }
    console.log(tasks)
})





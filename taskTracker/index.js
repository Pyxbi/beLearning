const fs = require('fs');
const path = require('path');

const tasksFilePath = path.join(__dirname, 'tasks.json');


// add data function 

function writeTasks(tasks) {
    fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2), "utf8");
  }


// Function to read tasks from the JSON file
function readTasks() {
    if (fs.existsSync(tasksFilePath)) {
      const data = fs.readFileSync(tasksFilePath, "utf8");
      console.log("data",JSON.parse(data))
      return JSON.parse(data);
     
    }
    return [];
  }
// function to update task from JSON file 

function updateTask(id, newDescription, newStatus){
    const tasks = readTasks();
    const findTaskID = tasks.find(task => task.id === parseInt(id));

    console.log("find ID:",findTaskID)

    if (findTaskID) {
        findTaskID.description = newDescription;
        findTaskID.status = newStatus;
    
        writeTasks(tasks);
        console.log(
          `Task ID ${id} updated successfully!`
        );
      } else {
        console.log(`Task with ID ${id} not found.`);
      }
}

// function to delete task

function deleteTask(id){
  const tasks = readTasks();
  const filteredTasks = tasks.filter(task => task.id !== parseInt(id));
  
  writeTasks(filteredTasks);
  console.log("task deleted!")
}

// function mark task

function markTask(id){
  const tasks = readTasks();
  const findTask = tasks.find((id) =>tasks.id == parseInt(id));

  if(findTask){
    findTask.status = newStatus;
    writeTasks(tasks);
    console.log(
      `Task id ${id} updated successfully!`
    );
  }else{
    console.log(`Task with ID ${id} not found.`);
  }
}


// function list all tasks
function listTasks() {
  if (!fs.existsSync(tasksFilePath)) {
    console.log('📂 No tasks found.');
    return;
  }

  const data = fs.readFileSync(tasksFilePath, 'utf-8');
  const tasks = JSON.parse(data);

  if (tasks.length === 0) {
    console.log('📭 Task list is empty.');
    return;
  }

  console.log('📋 All Tasks:');
  tasks.forEach((task, index) => {
    console.log(`${index + 1}. [${task.id}] ${task.description} - ${task.status ? '✅ Done' : '❌ Not done'}`);
  });
}

// function list task based on status

function listTaskBasedStatus(status){
  if (!fs.existsSync(tasksFilePath)) {
    console.log('📂 No tasks found.');
    return;
  }

  const data = fs.readFileSync(tasksFilePath, 'utf-8');
  const tasks = JSON.parse(data);
  if(tasks.status == status){
    tasks.forEach((task, index) => {
      console.log(`${index + 1}. [${task.id}] ${task.description} - ${task.status ? '✅ Done' : '❌ Not done'}`);
    });
  }
}

// Get CLI arguments
const [,, command, ...args] = process.argv;

switch (command) {
  case 'list':
    listTasks();
    break;

  case 'add':
    const [id, description, status] = args;
    const tasks = readTasks();
    
    tasks.push({ id: parseInt(id), description, status});
    writeTasks(tasks);
    console.log(`✅ Task "${description}" added!`);
    break;

  case 'update':
    updateTask(args[0], args[1], args[2]);
    break;

  case 'delete':
    deleteTask(args[0]);
    break;

  case 'mark':
    const markTasks = readTasks();
    const found = markTasks.find(task => task.id == parseInt(args[0]));
    if (found) {
      found.status = true;
      writeTasks(markTasks);
      console.log(`✅ Task ID ${args[0]} marked as completed.`);
    } else {
      console.log(`❌ Task with ID ${args[0]} not found.`);
    }
    break;

  case 'filter':
    const filterTasks = readTasks().filter(task => task.status === (args[0] === 'true'));
    if (filterTasks.length === 0) {
      console.log('📭 No tasks match that status.');
    } else {
      filterTasks.forEach((task, index) => {
        console.log(`${index + 1}. [${task.id}] ${task.description} - ${task.status ? '✅ Done' : '❌ Not done'}`);
      });
    }
    break;

  default:
    console.log('❓ Unknown command. Try: list, add, update, delete, mark, filter');
}

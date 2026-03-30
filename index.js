const express = require('express');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const taskData = require('./src/data/tasks');
const { renderTaskList, renderTaskBoard, mainLayout, taskDetails, taskForm } = require('./src/templates/taskTemplates');

const app = express();
const port = process.env.PORT || 3001;

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve htmx.org from node_modules
app.use('/htmx', express.static(path.join(__dirname, 'node_modules/htmx.org/dist')));

// Main layout
app.get('/', async (req, res) => {
  const tasks = await taskData.getTasks();
  const taskListHtml = renderTaskList(tasks);
  res.send(mainLayout(taskListHtml));
});

// Board view
app.get('/board', async (req, res) => {
  const tasks = await taskData.getTasks();
  res.send(renderTaskBoard(tasks));
});

// Route to get task list snippet (for refreshing the sidebar)
app.get('/task-list', async (req, res) => {
  const tasks = await taskData.getTasks();
  res.send(renderTaskList(tasks));
});

// Route to get a specific task details or new form
app.get('/tasks/:id', async (req, res) => {
  if (req.params.id === 'new') {
    return res.send(taskForm());
  }

  const task = await taskData.getTaskById(req.params.id);
  if (!task) {
    return res.status(404).send('<div class="text-red-500 font-bold p-4">Task not found</div>');
  }

  res.send(taskDetails(task));
});

// Route to get the edit form
app.get('/tasks/:id/edit', async (req, res) => {
  const task = await taskData.getTaskById(req.params.id);
  if (!task) return res.status(404).send('Not found');
  res.send(taskForm(task));
});

// Route to add a new task
app.post('/tasks', async (req, res) => {
  const { title, description, priority, status } = req.body;
  await taskData.addTask(title, description, priority, status);
  
  // Return full page on new task to update board/sidebar easily or just redirect
  const tasks = await taskData.getTasks();
  const taskListHtml = renderTaskList(tasks);
  res.send(mainLayout(taskListHtml, renderTaskBoard(tasks)));
});

// Route to update a task
app.put('/tasks/:id', async (req, res) => {
  const { title, description, priority, status } = req.body;
  const updatedTask = await taskData.updateTask(req.params.id, title, description, priority, status);
  
  if (!updatedTask) return res.status(404).send('Not found');

  // After saving, trigger sidebar update and return details
  res.setHeader('HX-Trigger', 'taskUpdated');
  res.send(taskDetails(updatedTask));
});

// Route to delete a task
app.delete('/tasks/:id', async (req, res) => {
  const success = await taskData.deleteTask(req.params.id);
  if (!success) return res.status(404).send('Not found');
  
  const tasks = await taskData.getTasks();
  const taskListHtml = renderTaskList(tasks);
  res.send(mainLayout(taskListHtml, renderTaskBoard(tasks)));
});

app.listen(port, () => {
  console.log(`Task Board app listening at http://localhost:${port}`);
});

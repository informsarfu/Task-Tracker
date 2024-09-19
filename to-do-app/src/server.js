const express = require('express');
const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const uri = 'mongodb+srv://sshahna2:6zVl5U1chRbjgZpA@to-do-cluster.su2fx.mongodb.net/?retryWrites=true&w=majority&appName=to-do-cluster'

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('Error connecting to MongoDB Atlas', err));


const taskSchema = new mongoose.Schema({
    text: String,
    completed: Boolean,
    order: Number,
});

const settingSchema = new mongoose.Schema({
    darkMode: Boolean,
});

const Task = mongoose.model('Task', taskSchema);
const Settings = mongoose.model('Settings', settingSchema);


// Endpoints

// Darkmode API

app.get('/api/settings/dark-mode', async (req, res) => {
    try {
      const settings = await Settings.findOne();
  
      if (!settings) {
        const defaultSettings = new Settings({ darkMode: false });
        await defaultSettings.save();
        return res.json(defaultSettings);
      }
  
      res.json(settings);
    } catch (error) {
      console.error('Error retrieving dark mode setting:', error);
      res.status(500).json({ message: 'Failed to retrieve dark mode setting' });
    }
  });


app.put('/api/settings/dark-mode', async (req, res) => {
    const { darkMode } = req.body;
  
    try {
      const settings = await Settings.findOneAndUpdate(
        {},
        { darkMode },
        { new: true, upsert: true }
      );
  
      res.json(settings);
    } catch (error) {
      console.error('Error saving dark mode setting:', error);
      res.status(500).json({ message: 'Failed to save dark mode setting' });
    }
  });



// Create new task
app.post('/api/tasks', async (req, res) => {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
});


// GET all tasks
app.get('/api/tasks', async (req, res) => {
    try {
      const tasks = await Task.find().sort('order');
      res.json(tasks);
    } catch (error) {
      console.error('Error retrieving tasks:', error);
      res.status(500).json({ message: 'Failed to retrieve tasks' });
    }
  });


// UPDATE a task
app.put('/tasks/:id', async (req, res) => {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(task);
});


// Reorder the tasks
app.put('/api/tasks/reorder', async (req, res) => {
    const { reorderedTasks } = req.body;
    const updatePromises = reorderedTasks.map((task, index) => 
      Task.findByIdAndUpdate(task._id, { order: index })
    );
  
    try {
      await Promise.all(updatePromises);
      res.json({ message: 'Tasks reordered successfully' });
    } catch (error) {
      console.error('Error reordering tasks:', error);
      res.status(500).json({ message: 'Failed to reorder tasks' });
    }
  });




// Clear completed tasks
app.delete('/api/tasks/completed', async (req, res) => {
    try {
        await Task.deleteMany({ completed: true });
        res.json({ message: 'Completed tasks deleted successfully' });
    } catch (error) {
        console.error('Error deleting completed tasks:', error);
        res.status(500).json({ message: 'Failed to delete completed tasks', error: error.message });
    }
});


// DELETE a task
app.delete('/api/tasks/:id', async (req, res) => {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
});


// Start the server
app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
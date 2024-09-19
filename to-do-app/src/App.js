import './App.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [newTask, setNewTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');
  const [darkMode, setDarkMode] = useState(false);
  const [draggedTaskIdx, setDraggedTaskIdx] = useState(null);

  useEffect(() => {
    const fetchDarkModeSetting = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/settings/dark-mode');
        setDarkMode(response.data.darkMode);
        console.log(response)
      } catch (error) {
        console.error('Error fetching dark mode setting:', error);
      }
    };

    fetchDarkModeSetting();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]); 

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/tasks');
        setTasks(response.data);
        console.log(response);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, [])

  const addTask = async (e) => {
    if (e.key === "Enter" && newTask.trim()){
      try {
        const response = await axios.post('http://localhost:5000/api/tasks', { text: newTask, completed: false });
        setTasks([...tasks, {text: newTask, completed: false}]);
        // console.log("Task Added:", newTask);
        setNewTask('');
        console.log(response);
      } catch (error){
        console.error('Error adding task:', error);
      }
    }
  };

  const changeTask = (e) => {
    setNewTask(e.target.value);
  };

  const markTask = async (idx) => {
    const task = tasks[idx];
    const updatedTask = {...tasks, completed: !task.completed };

    try {
      const response = await axios.put(`http://localhost:5000/tasks/${task._id}`, updatedTask);
      const updatedTasks = tasks.map((task,i) => i===idx ? response.data : task);
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (idx) => {
    const task = tasks[idx];

    try {
      await axios.delete(`http://localhost:5000/api/tasks/${task._id}`, task);
      const updatedTasks = tasks.filter((_,i) => i!==idx);
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const clearCompleted = async () => {
    try {
      await axios.delete('http://localhost:5000/api/tasks/completed');
      const activeTasks = tasks.filter(task => !task.completed);
      setTasks(activeTasks);
    } catch (error) {
      console.error('Error clearing completed tasks:', error);
    }
  };

  const filteredTask = tasks.filter(task => {
    if (filter === 'Active') return !task.completed;
    if (filter === 'Completed') return task.completed;
    return true;
  });

  const activeCount = tasks.filter(task => !task.completed).length;

  const toggleDarkMode = async () => {
    try {
      const newDarkMode = !darkMode;
      setDarkMode(newDarkMode);
      await axios.put('http://localhost:5000/api/settings/dark-mode', { darkMode: newDarkMode });
    } catch (error) {
      console.error('Error saving dark mode setting:', error);
    }
  };

  const handleDragStart = (idx) => {
    setDraggedTaskIdx(idx);
  }

  const handleDragOver = (event, idx) => {
    event.preventDefault();
    const draggedOverItem = tasks[idx];

    if (draggedTaskIdx === idx){
      return;
    }

    let items = tasks.filter((_, idx) => idx !== draggedTaskIdx);
    items.splice(idx, 0, tasks[draggedTaskIdx]);

    setTasks(items);
    setDraggedTaskIdx(idx);
  }

  const handleDragEnd = async () => {
    setDraggedTaskIdx(null);

    try {
      await axios.put('http://localhost:5000/api/tasks/reorder', {
        reorderedTasks: tasks,
      });
      console.log('Tasks reordered successfully');
    } catch (error) {
      console.error('Error reordering tasks:', error);
    }
  };

  return (
    <div className={`todo-div ${darkMode ? 'dark-mode' : ''}`}>
      <div className="header-container">
        <h1 className="todo-header">T O D O</h1>
        <button className="dark-mode-toggle" onClick={toggleDarkMode} aria-label="Toggle dark mode">
          {darkMode ? (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" width="22" height="22"><path fill="#FFF" fillRule="evenodd" d="M13 21a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-5.657-2.343a1 1 0 010 1.414l-2.121 2.121a1 1 0 01-1.414-1.414l2.12-2.121a1 1 0 011.415 0zm12.728 0l2.121 2.121a1 1 0 01-1.414 1.414l-2.121-2.12a1 1 0 011.414-1.415zM13 8a5 5 0 110 10 5 5 0 010-10zm12 4a1 1 0 110 2h-3a1 1 0 110-2h3zM4 12a1 1 0 110 2H1a1 1 0 110-2h3zm18.192-8.192a1 1 0 010 1.414l-2.12 2.121a1 1 0 01-1.415-1.414l2.121-2.121a1 1 0 011.414 0zm-16.97 0l2.121 2.12A1 1 0 015.93 7.344L3.808 5.222a1 1 0 011.414-1.414zM13 0a1 1 0 011 1v3a1 1 0 11-2 0V1a1 1 0 011-1z"/></svg>) : (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" width="20" height="20"><path fill="#FFF" fillRule="evenodd" d="M13 0c.81 0 1.603.074 2.373.216C10.593 1.199 7 5.43 7 10.5 7 16.299 11.701 21 17.5 21c2.996 0 5.7-1.255 7.613-3.268C23.22 22.572 18.51 26 13 26 5.82 26 0 20.18 0 13S5.82 0 13 0z"/></svg>)}
        </button>
      </div>
      <div className="todo-input-container">
        <input
          type="text"
          className="todo-input"
          placeholder="Create a new todo.."
          value={newTask}
          onChange={changeTask}
          onKeyDown={addTask}
        />
        <div className="todo-input-icon no-hover">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            className="input-checkbox-icon"
          >
            <circle cx="12" cy="12" r="10" fill="none" stroke="#FFF" strokeWidth="2"/>
          </svg>
        </div>
      </div>

      <ul className='todo-list'>
        {filteredTask.map((task,i) => (
          <li key={i} className={`todo-item ${task.completed ? 'completed' : ''}`} 
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={(event) => handleDragOver(event, i)}
            onDrop={handleDragEnd}
          >
            <button
              className="checkbox-btn"
              onClick={() => markTask(i)}
              aria-label="Toggle task completion"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className={`checkbox-icon ${task.completed ? 'checked' : ''}`}
              >
                <circle cx="12" cy="12" r="10" fill={task.completed ? '#00bcd4' : 'none'} stroke="#FFF" strokeWidth="2"/>
                {task.completed && (
                  <path d="M7 12l3 3 7-7" stroke="#FFF" strokeWidth="2" fill="none"/>
                )}
              </svg>
            </button>
            <span className="task-text">{task.text}</span>
            <button className="delete-task" onClick={() => deleteTask(i)}>
              <svg className="delete-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="12" height="12"><path fill="#494C6B" fillRule="evenodd" d="M16.97 0l.708.707L9.546 8.84l8.132 8.132-.707.707-8.132-8.132-8.132 8.132L0 16.97l8.132-8.132L0 .707.707 0 8.84 8.132 16.971 0z"/></svg>
            </button>
          </li>
        ))}
        {tasks.length > 0 && (
        <div className="filter-buttons filter-div">
          <span className="filter-button item-count">
            {activeCount} {activeCount == 1 || activeCount == 0 ? 'item left' : 'items left'}
          </span>
          <button onClick={() => setFilter('All')} className={`filter-button ${filter === 'All' ? 'active' : ''}`}>All</button>
          <button onClick={() => setFilter('Active')} className={`filter-button ${filter === 'Active' ? 'active' : ''}`}>Active</button>
          <button onClick={() => setFilter('Completed')} className={`filter-button ${filter === 'Completed' ? 'active' : ''}`}>Completed</button>
          <button className="filter-button" onClick={clearCompleted}>Clear Completed</button>
        </div>
        )}
      </ul>
      {tasks.length > 1 && (<div className="reorder-list">Drag and drop to reorder list</div>)}  
    </div>
  );
}

export default App;

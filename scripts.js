document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskInput = document.querySelector('.task-input');
    const addBtn = document.querySelector('.add-btn');
    const taskList = document.querySelector('.task-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const progressFill = document.querySelector('.progress-fill');
    const progressPercentage = document.getElementById('progress-percentage');
    const totalTasksElem = document.getElementById('total-tasks');
    const completedTasksElem = document.getElementById('completed-tasks');
    const remainingTasksElem = document.getElementById('remaining-tasks');
    const currentDateElem = document.getElementById('current-date');
    const currentTimeElem = document.getElementById('current-time');
    
    // State
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';
    
    // Initialize the app
    function init() {
       
        renderTasks();
        updateProgress();
        
        // Event listeners
        addBtn.addEventListener('click', addTask);
        taskInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') addTask();
        });
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.dataset.filter;
                renderTasks();
            });
        });
    }
    
    // Update time display

    setInterval(() => {
        const date = new Date();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        // const day = String(date.getDate()).padStart(2, '0');
        // const month = String(date.getMonth() + 1).padStart(2, '0');
        // const year = date.getFullYear();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateElem.textContent = date.toLocaleDateString('en-US', options);
        if(hours>12){
            currentTimeElem.innerHTML = `${hours-12}:${minutes}:${seconds} PM`;
        }else{
        currentTimeElem.innerHTML = `${hours}:${minutes}:${seconds}`;}
    }, 1000);
    
    // Add a new task
    function addTask() {
        const text = taskInput.value.trim();
        if (text === '') return;
        
        const newTask = {
            id: Date.now(),
            text: text,
            completed: false,
            timestamp: new Date().toISOString()
        };
        
        tasks.push(newTask);
        saveTasks();
        renderTasks();
        updateProgress();
        
        taskInput.value = '';
        taskInput.focus();
    }
    
    // Toggle task completion
    function toggleTask(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return {...task, completed: !task.completed};
            }
            return task;
        });
        
        saveTasks();
        renderTasks();
        updateProgress();
    }
    
    // Edit a task
    function editTask(id, newText) {
        if (newText.trim() === '') return;
        
        tasks = tasks.map(task => {
            if (task.id === id) {
                return {...task, text: newText};
            }
            return task;
        });
        
        saveTasks();
        renderTasks();
    }
    
    // Delete a task
    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
        updateProgress();
    }
    
    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    // Render tasks based on current filter
    function renderTasks() {
        // Filter tasks based on current selection
        let filteredTasks = tasks;
        if (currentFilter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }
        
        // Render tasks or empty state
        if (filteredTasks.length === 0) {
            let message = '';
            if (currentFilter === 'all') message = 'No tasks yet. Add a task to get started!';
            else if (currentFilter === 'active') message = 'No active tasks. Great job!';
            else if (currentFilter === 'completed') message = 'No completed tasks yet. Keep going!';
            
            taskList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tasks"></i>
                    <p>${message}</p>
                </div>
            `;
            return;
        }
        
        // Render tasks
        taskList.innerHTML = '';
        filteredTasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskItem.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${task.text}</span>
                <div class="task-actions">
                    <button class="edit-btn"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            
            // Add event listeners to the task item
            const checkbox = taskItem.querySelector('.task-checkbox');
            const editBtn = taskItem.querySelector('.edit-btn');
            const deleteBtn = taskItem.querySelector('.delete-btn');
            const taskText = taskItem.querySelector('.task-text');
            
            checkbox.addEventListener('change', () => toggleTask(task.id));
            
            editBtn.addEventListener('click', () => {
                const newText = prompt('Edit your task:', task.text);
                if (newText !== null) editTask(task.id, newText);
            });
            
            deleteBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this task?')) {
                    deleteTask(task.id);
                }
            });
            
            taskList.appendChild(taskItem);
        });
    }
    
    // Update progress information
    function updateProgress() {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        const remainingTasks = totalTasks - completedTasks;
        const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        // Update progress bar
        progressFill.style.width = `${percentage}%`;
        progressPercentage.textContent = `${percentage}%`;
        
        // Update stats
        totalTasksElem.textContent = totalTasks;
        completedTasksElem.textContent = completedTasks;
        remainingTasksElem.textContent = remainingTasks;
    }
    

    init();
});
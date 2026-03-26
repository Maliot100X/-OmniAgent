export class TaskManager {
  constructor() {
    this.tasks = new Map();
  }

  createTask(title, description, assignee, priority = 'medium') {
    const task = {
      id: 'task_' + Date.now(),
      title,
      description,
      assignee,
      priority,
      status: 'open',
      created: new Date(),
      completed: null,
      subtasks: []
    };
    this.tasks.set(task.id, task);
    return task;
  }

  completeTask(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) return { error: 'Not found' };
    task.status = 'completed';
    task.completed = new Date();
    return { success: true };
  }

  assignTask(taskId, assignee) {
    const task = this.tasks.get(taskId);
    if (!task) return { error: 'Not found' };
    task.assignee = assignee;
    return { success: true };
  }

  updatePriority(taskId, priority) {
    const task = this.tasks.get(taskId);
    if (!task) return { error: 'Not found' };
    task.priority = priority;
    return { success: true };
  }

  getTask(taskId) {
    return this.tasks.get(taskId);
  }

  listTasks(status = null) {
    return Array.from(this.tasks.values()).filter(t => !status || t.status === status);
  }

  deletTask(taskId) {
    this.tasks.delete(taskId);
    return { success: true };
  }
}

export default TaskManager;

/**
 * File-based Task Storage
 * Stores tasks in .company/tasks/ directory
 */

const fs = require('fs');
const path = require('path');

class TaskStorage {
  constructor(basePath = process.cwd()) {
    this.basePath = basePath;
    this.tasksDir = path.join(basePath, '.company', 'tasks');
    this.indexFile = path.join(this.tasksDir, 'index.json');
    this.ensureDirectory();
  }

  /**
   * Ensure the tasks directory exists
   */
  ensureDirectory() {
    if (!fs.existsSync(this.tasksDir)) {
      fs.mkdirSync(this.tasksDir, { recursive: true });
    }
    if (!fs.existsSync(this.indexFile)) {
      this.writeIndex({ nextId: 1, tasks: [] });
    }
  }

  /**
   * Read the task index
   * @returns {Object} Index data
   */
  readIndex() {
    try {
      return JSON.parse(fs.readFileSync(this.indexFile, 'utf8'));
    } catch (e) {
      return { nextId: 1, tasks: [] };
    }
  }

  /**
   * Write the task index
   * @param {Object} index - Index data
   */
  writeIndex(index) {
    fs.writeFileSync(this.indexFile, JSON.stringify(index, null, 2));
  }

  /**
   * Get task file path
   * @param {string} taskId - Task ID
   * @returns {string} File path
   */
  getTaskPath(taskId) {
    return path.join(this.tasksDir, `task-${taskId}.json`);
  }

  /**
   * Create a new task
   * @param {Object} task - Task data
   * @returns {Object} Created task with ID
   */
  create(task) {
    const index = this.readIndex();
    const taskId = String(index.nextId);

    const newTask = {
      id: taskId,
      subject: task.subject || 'Untitled Task',
      description: task.description || '',
      status: 'pending',
      owner: task.owner || null,
      blocks: [],
      blockedBy: [],
      metadata: task.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Write task file
    fs.writeFileSync(this.getTaskPath(taskId), JSON.stringify(newTask, null, 2));

    // Update index
    index.nextId++;
    index.tasks.push({
      id: taskId,
      subject: newTask.subject,
      status: newTask.status
    });
    this.writeIndex(index);

    return newTask;
  }

  /**
   * Get a task by ID
   * @param {string} taskId - Task ID
   * @returns {Object|null} Task data or null
   */
  get(taskId) {
    const taskPath = this.getTaskPath(taskId);
    try {
      return JSON.parse(fs.readFileSync(taskPath, 'utf8'));
    } catch (e) {
      return null;
    }
  }

  /**
   * Update a task
   * @param {string} taskId - Task ID
   * @param {Object} updates - Fields to update
   * @returns {Object|null} Updated task or null
   */
  update(taskId, updates) {
    const task = this.get(taskId);
    if (!task) return null;

    // Apply updates
    const updatedTask = { ...task };

    if (updates.subject !== undefined) updatedTask.subject = updates.subject;
    if (updates.description !== undefined) updatedTask.description = updates.description;
    if (updates.status !== undefined) updatedTask.status = updates.status;
    if (updates.owner !== undefined) updatedTask.owner = updates.owner;
    if (updates.metadata !== undefined) {
      updatedTask.metadata = { ...updatedTask.metadata, ...updates.metadata };
      // Remove null keys
      for (const key of Object.keys(updatedTask.metadata)) {
        if (updatedTask.metadata[key] === null) {
          delete updatedTask.metadata[key];
        }
      }
    }

    // Handle dependency updates
    if (updates.addBlocks) {
      updatedTask.blocks = [...new Set([...updatedTask.blocks, ...updates.addBlocks])];
    }
    if (updates.addBlockedBy) {
      updatedTask.blockedBy = [...new Set([...updatedTask.blockedBy, ...updates.addBlockedBy])];
    }

    updatedTask.updatedAt = new Date().toISOString();

    // Handle deletion
    if (updates.status === 'deleted') {
      fs.unlinkSync(this.getTaskPath(taskId));
      const index = this.readIndex();
      index.tasks = index.tasks.filter(t => t.id !== taskId);
      this.writeIndex(index);
      return { deleted: true, id: taskId };
    }

    // Write updated task
    fs.writeFileSync(this.getTaskPath(taskId), JSON.stringify(updatedTask, null, 2));

    // Update index
    const index = this.readIndex();
    const indexEntry = index.tasks.find(t => t.id === taskId);
    if (indexEntry) {
      indexEntry.subject = updatedTask.subject;
      indexEntry.status = updatedTask.status;
      this.writeIndex(index);
    }

    return updatedTask;
  }

  /**
   * List all tasks
   * @param {Object} filters - Optional filters
   * @returns {Array} List of tasks
   */
  list(filters = {}) {
    const index = this.readIndex();
    let tasks = [];

    for (const entry of index.tasks) {
      const task = this.get(entry.id);
      if (task) {
        tasks.push(task);
      }
    }

    // Apply filters
    if (filters.status) {
      tasks = tasks.filter(t => t.status === filters.status);
    }
    if (filters.owner) {
      tasks = tasks.filter(t => t.owner === filters.owner);
    }

    return tasks;
  }

  /**
   * Get tasks summary (for list view)
   * @returns {Array} Summary of all tasks
   */
  summary() {
    const tasks = this.list();
    return tasks.map(t => ({
      id: t.id,
      subject: t.subject,
      status: t.status,
      owner: t.owner,
      blockedBy: t.blockedBy.filter(id => {
        const blockingTask = this.get(id);
        return blockingTask && blockingTask.status !== 'completed';
      })
    }));
  }

  /**
   * Clear all tasks (for testing)
   */
  clear() {
    const index = this.readIndex();
    for (const entry of index.tasks) {
      const taskPath = this.getTaskPath(entry.id);
      if (fs.existsSync(taskPath)) {
        fs.unlinkSync(taskPath);
      }
    }
    this.writeIndex({ nextId: 1, tasks: [] });
  }
}

module.exports = TaskStorage;

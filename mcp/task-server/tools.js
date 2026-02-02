/**
 * Task Tool Definitions
 * Defines the MCP tools exposed by the task server
 */

/**
 * Get the tool definitions for the task server
 * @returns {Array} Tool definitions
 */
function getToolDefinitions() {
  return [
    {
      name: 'cvc_task_create',
      description: 'Create a new task in the Claude Virtual Company task system. Use this to track work items, features, and todos.',
      inputSchema: {
        type: 'object',
        properties: {
          subject: {
            type: 'string',
            description: 'A brief title for the task (imperative form, e.g., "Implement login feature")'
          },
          description: {
            type: 'string',
            description: 'Detailed description of what needs to be done, including context and acceptance criteria'
          },
          owner: {
            type: 'string',
            description: 'Optional owner/assignee for the task'
          },
          metadata: {
            type: 'object',
            description: 'Optional metadata to attach to the task'
          }
        },
        required: ['subject', 'description']
      }
    },
    {
      name: 'cvc_task_list',
      description: 'List all tasks in the Claude Virtual Company task system. Returns a summary view of all tasks with their status and dependencies.',
      inputSchema: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['pending', 'in_progress', 'completed'],
            description: 'Filter by task status'
          },
          owner: {
            type: 'string',
            description: 'Filter by task owner'
          }
        }
      }
    },
    {
      name: 'cvc_task_get',
      description: 'Get detailed information about a specific task including its full description, dependencies, and metadata.',
      inputSchema: {
        type: 'object',
        properties: {
          taskId: {
            type: 'string',
            description: 'The ID of the task to retrieve'
          }
        },
        required: ['taskId']
      }
    },
    {
      name: 'cvc_task_update',
      description: 'Update a task in the Claude Virtual Company task system. Can update status, description, owner, or dependencies.',
      inputSchema: {
        type: 'object',
        properties: {
          taskId: {
            type: 'string',
            description: 'The ID of the task to update'
          },
          status: {
            type: 'string',
            enum: ['pending', 'in_progress', 'completed', 'deleted'],
            description: 'New status for the task'
          },
          subject: {
            type: 'string',
            description: 'New subject/title for the task'
          },
          description: {
            type: 'string',
            description: 'New description for the task'
          },
          owner: {
            type: 'string',
            description: 'New owner for the task'
          },
          addBlocks: {
            type: 'array',
            items: { type: 'string' },
            description: 'Task IDs that this task blocks (cannot start until this completes)'
          },
          addBlockedBy: {
            type: 'array',
            items: { type: 'string' },
            description: 'Task IDs that block this task (must complete before this can start)'
          },
          metadata: {
            type: 'object',
            description: 'Metadata to merge into the task (set a key to null to delete it)'
          }
        },
        required: ['taskId']
      }
    }
  ];
}

/**
 * Create tool handlers using the storage instance
 * @param {TaskStorage} storage - Storage instance
 * @returns {Object} Tool handlers keyed by tool name
 */
function createToolHandlers(storage) {
  return {
    cvc_task_create: (args) => {
      const task = storage.create({
        subject: args.subject,
        description: args.description,
        owner: args.owner,
        metadata: args.metadata
      });
      return {
        success: true,
        message: `Task #${task.id} created: ${task.subject}`,
        task
      };
    },

    cvc_task_list: (args) => {
      const tasks = storage.summary();

      // Apply filters if provided
      let filtered = tasks;
      if (args.status) {
        filtered = filtered.filter(t => t.status === args.status);
      }
      if (args.owner) {
        filtered = filtered.filter(t => t.owner === args.owner);
      }

      // Format output
      const lines = filtered.map(t => {
        const blockedStr = t.blockedBy.length > 0
          ? ` (blocked by: ${t.blockedBy.join(', ')})`
          : '';
        const ownerStr = t.owner ? ` [${t.owner}]` : '';
        return `#${t.id}. [${t.status}] ${t.subject}${ownerStr}${blockedStr}`;
      });

      return {
        success: true,
        count: filtered.length,
        tasks: filtered,
        formatted: lines.join('\n') || 'No tasks found'
      };
    },

    cvc_task_get: (args) => {
      const task = storage.get(args.taskId);
      if (!task) {
        return {
          success: false,
          error: `Task #${args.taskId} not found`
        };
      }
      return {
        success: true,
        task
      };
    },

    cvc_task_update: (args) => {
      const { taskId, ...updates } = args;
      const task = storage.update(taskId, updates);

      if (!task) {
        return {
          success: false,
          error: `Task #${taskId} not found`
        };
      }

      if (task.deleted) {
        return {
          success: true,
          message: `Task #${taskId} deleted`
        };
      }

      return {
        success: true,
        message: `Task #${task.id} updated`,
        task
      };
    }
  };
}

module.exports = {
  getToolDefinitions,
  createToolHandlers
};

#!/usr/bin/env node

/**
 * Claude Virtual Company - MCP Task Server
 *
 * Provides task management tools via the Model Context Protocol.
 * Works with both Claude Code (optional) and Gemini CLI (required for task tools).
 *
 * Usage:
 *   node index.js [--basePath /path/to/project]
 *
 * The server exposes these tools:
 *   - cvc_task_create: Create a new task
 *   - cvc_task_list: List all tasks
 *   - cvc_task_get: Get task details
 *   - cvc_task_update: Update a task
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

const TaskStorage = require('./storage');
const { getToolDefinitions, createToolHandlers } = require('./tools');

/**
 * Parse command line arguments
 * @returns {Object} Parsed arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    basePath: process.cwd()
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--basePath' && args[i + 1]) {
      result.basePath = args[i + 1];
      i++;
    }
  }

  return result;
}

/**
 * Create and start the MCP server
 */
async function main() {
  const args = parseArgs();

  // Initialize storage
  const storage = new TaskStorage(args.basePath);

  // Create server
  const server = new Server(
    {
      name: 'cvc-task-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Get tool definitions and handlers
  const toolDefinitions = getToolDefinitions();
  const toolHandlers = createToolHandlers(storage);

  // Handle list tools request
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: toolDefinitions,
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: toolArgs } = request.params;

    const handler = toolHandlers[name];
    if (!handler) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: `Unknown tool: ${name}` }),
          },
        ],
        isError: true,
      };
    }

    try {
      const result = handler(toolArgs || {});
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: error.message }),
          },
        ],
        isError: true,
      };
    }
  });

  // Start server with stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log startup (to stderr so it doesn't interfere with stdio protocol)
  console.error('CVC Task Server started');
  console.error(`Base path: ${args.basePath}`);
  console.error(`Tasks directory: ${storage.tasksDir}`);
}

// Run the server
main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

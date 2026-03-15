import { z } from 'zod';
import { createTool } from '@mastra/core/tools';

export interface ToolContext {
  db: any;
  orgId: string;
}

const writeProjectDocInputSchema = z.object({
  projectId: z.string(),
  title: z.string(),
  content: z.string(),
  docType: z.enum(['spec', 'prd', 'architecture', 'guide', 'other']).default('other'),
  createdByType: z.enum(['user', 'agent']).optional(),
  createdById: z.string().optional(),
});

const writeProjectDocOutputSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string(),
});

const readProjectDocsInputSchema = z.object({
  projectId: z.string(),
  docType: z.string().optional(),
});

const readProjectDocsOutputSchema = z.object({
  docs: z.array(z.object({
    id: z.string(),
    title: z.string(),
    content: z.string().nullable(),
    docType: z.string(),
    createdAt: z.string(),
  })),
});

const createGoalInputSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  level: z.enum(['outcome', 'objective', 'task']).default('task'),
  parentId: z.string().optional(),
  ownerAgentId: z.string().optional(),
});

const createGoalOutputSchema = z.object({
  id: z.string(),
  title: z.string(),
});

const createTaskInputSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  projectId: z.string().optional(),
  goalId: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  assigneeAgentId: z.string().optional(),
  parentId: z.string().optional(),
});

const createTaskOutputSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
});

const updateTaskInputSchema = z.object({
  taskId: z.string(),
  status: z.enum(['backlog', 'todo', 'in_progress', 'in_review', 'blocked', 'done', 'cancelled']).optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  assigneeAgentId: z.string().optional(),
});

const updateTaskOutputSchema = z.object({
  id: z.string(),
  updated: z.boolean(),
});

const addTaskCommentInputSchema = z.object({
  taskId: z.string(),
  body: z.string(),
  authorAgentId: z.string().optional(),
  authorUserId: z.string().optional(),
});

const addTaskCommentOutputSchema = z.object({
  id: z.string(),
  taskId: z.string(),
});

const listTasksInputSchema = z.object({
  projectId: z.string().optional(),
  status: z.string().optional(),
  assigneeAgentId: z.string().optional(),
  limit: z.number().default(50),
});

const listTasksOutputSchema = z.object({
  tasks: z.array(z.object({
    id: z.string(),
    title: z.string(),
    status: z.string(),
    priority: z.string().nullable(),
    assigneeAgentId: z.string().nullable(),
  })),
});

const readPrDiffInputSchema = z.object({
  pullRequestId: z.string(),
});

const readPrDiffOutputSchema = z.object({
  diff: z.string(),
  prNumber: z.number().nullable(),
  url: z.string().nullable(),
});

const listProjectFilesInputSchema = z.object({
  projectId: z.string(),
  path: z.string().default('.'),
});

const listProjectFilesOutputSchema = z.object({
  files: z.array(z.string()),
});

const triggerPipelineInputSchema = z.object({
  taskId: z.string(),
  pipelineConfigId: z.string(),
});

const triggerPipelineOutputSchema = z.object({
  pipelineRunId: z.string(),
  status: z.string(),
});

const requestApprovalInputSchema = z.object({
  type: z.enum(['hire_agent', 'budget_change', 'deploy', 'custom']),
  payload: z.record(z.unknown()),
  requestedByAgentId: z.string().optional(),
  requestedByUserId: z.string().optional(),
});

const requestApprovalOutputSchema = z.object({
  approvalId: z.string(),
  status: z.string(),
});

const hireAgentInputSchema = z.object({
  name: z.string(),
  shortname: z.string(),
  role: z.string(),
  model: z.string().default('claude-sonnet-4-5'),
  instructions: z.string().optional(),
  requestedByAgentId: z.string().optional(),
});

const hireAgentOutputSchema = z.object({
  approvalId: z.string(),
  status: z.string(),
});

function makeId() {
  return crypto.randomUUID();
}

export function buildPlatformTools(ctx: ToolContext) {
  const writeProjectDoc = createTool({
    id: 'write_project_doc',
    description: 'Write a document to the project_docs table',
    inputSchema: writeProjectDocInputSchema,
    outputSchema: writeProjectDocOutputSchema,
    execute: async ({ context }) => {
      const input = context as z.infer<typeof writeProjectDocInputSchema>;
      const id = makeId();
      if (ctx.db?.insert) {
        await ctx.db.insert('project_docs').values({ id, ...input });
      }
      return { id, projectId: input.projectId, title: input.title };
    },
  });

  const readProjectDocs = createTool({
    id: 'read_project_docs',
    description: 'Read documents for a project',
    inputSchema: readProjectDocsInputSchema,
    outputSchema: readProjectDocsOutputSchema,
    execute: async ({ context }) => {
      const input = context as z.infer<typeof readProjectDocsInputSchema>;
      if (ctx.db?.query) {
        const docs = await ctx.db.query('project_docs', { projectId: input.projectId });
        return { docs };
      }
      return { docs: [] };
    },
  });

  const createGoal = createTool({
    id: 'create_goal',
    description: 'Create a new goal',
    inputSchema: createGoalInputSchema,
    outputSchema: createGoalOutputSchema,
    execute: async ({ context }) => {
      const input = context as z.infer<typeof createGoalInputSchema>;
      const id = makeId();
      if (ctx.db?.insert) {
        await ctx.db.insert('goals').values({ id, orgId: ctx.orgId, ...input });
      }
      return { id, title: input.title };
    },
  });

  const createTask = createTool({
    id: 'create_task',
    description: 'Create a new task linked to a project or goal',
    inputSchema: createTaskInputSchema,
    outputSchema: createTaskOutputSchema,
    execute: async ({ context }) => {
      const input = context as z.infer<typeof createTaskInputSchema>;
      const id = makeId();
      if (ctx.db?.insert) {
        await ctx.db.insert('tasks').values({ id, orgId: ctx.orgId, status: 'backlog', ...input });
      }
      return { id, title: input.title, status: 'backlog' };
    },
  });

  const updateTask = createTool({
    id: 'update_task',
    description: 'Update task status or fields',
    inputSchema: updateTaskInputSchema,
    outputSchema: updateTaskOutputSchema,
    execute: async ({ context }) => {
      const input = context as z.infer<typeof updateTaskInputSchema>;
      if (ctx.db?.update) {
        await ctx.db.update('tasks').set(input).where({ id: input.taskId });
      }
      return { id: input.taskId, updated: true };
    },
  });

  const addTaskComment = createTool({
    id: 'add_task_comment',
    description: 'Add a comment to a task',
    inputSchema: addTaskCommentInputSchema,
    outputSchema: addTaskCommentOutputSchema,
    execute: async ({ context }) => {
      const input = context as z.infer<typeof addTaskCommentInputSchema>;
      const id = makeId();
      if (ctx.db?.insert) {
        await ctx.db.insert('task_comments').values({ id, ...input });
      }
      return { id, taskId: input.taskId };
    },
  });

  const listTasks = createTool({
    id: 'list_tasks',
    description: 'List tasks with optional filters',
    inputSchema: listTasksInputSchema,
    outputSchema: listTasksOutputSchema,
    execute: async ({ context }) => {
      const input = context as z.infer<typeof listTasksInputSchema>;
      if (ctx.db?.query) {
        const tasks = await ctx.db.query('tasks', {
          orgId: ctx.orgId,
          ...input,
        });
        return { tasks };
      }
      return { tasks: [] };
    },
  });

  const readPrDiff = createTool({
    id: 'read_pr_diff',
    description: 'Read a pull request diff (stub)',
    inputSchema: readPrDiffInputSchema,
    outputSchema: readPrDiffOutputSchema,
    execute: async ({ context }) => {
      const input = context as z.infer<typeof readPrDiffInputSchema>;
      return {
        diff: `// Stub: PR diff for ${input.pullRequestId} not yet implemented`,
        prNumber: null,
        url: null,
      };
    },
  });

  const listProjectFiles = createTool({
    id: 'list_project_files',
    description: 'List files in a project workspace (stub)',
    inputSchema: listProjectFilesInputSchema,
    outputSchema: listProjectFilesOutputSchema,
    execute: async ({ context }) => {
      const input = context as z.infer<typeof listProjectFilesInputSchema>;
      return {
        files: [`// Stub: file listing for project ${input.projectId} at ${input.path} not yet implemented`],
      };
    },
  });

  const triggerPipeline = createTool({
    id: 'trigger_pipeline',
    description: 'Create a pipeline run for a task',
    inputSchema: triggerPipelineInputSchema,
    outputSchema: triggerPipelineOutputSchema,
    execute: async ({ context }) => {
      const input = context as z.infer<typeof triggerPipelineInputSchema>;
      const id = makeId();
      if (ctx.db?.insert) {
        await ctx.db.insert('pipeline_runs').values({
          id,
          taskId: input.taskId,
          pipelineConfigId: input.pipelineConfigId,
          status: 'running',
        });
      }
      return { pipelineRunId: id, status: 'running' };
    },
  });

  const requestApproval = createTool({
    id: 'request_approval',
    description: 'Create an approval request',
    inputSchema: requestApprovalInputSchema,
    outputSchema: requestApprovalOutputSchema,
    execute: async ({ context }) => {
      const input = context as z.infer<typeof requestApprovalInputSchema>;
      const id = makeId();
      if (ctx.db?.insert) {
        await ctx.db.insert('approvals').values({
          id,
          orgId: ctx.orgId,
          ...input,
          status: 'pending',
        });
      }
      return { approvalId: id, status: 'pending' };
    },
  });

  const hireAgent = createTool({
    id: 'hire_agent',
    description: 'Create a hire agent request (creates an approval)',
    inputSchema: hireAgentInputSchema,
    outputSchema: hireAgentOutputSchema,
    execute: async ({ context }) => {
      const input = context as z.infer<typeof hireAgentInputSchema>;
      const approvalId = makeId();
      if (ctx.db?.insert) {
        await ctx.db.insert('approvals').values({
          id: approvalId,
          orgId: ctx.orgId,
          type: 'hire_agent',
          requestedByAgentId: input.requestedByAgentId,
          status: 'pending',
          payload: {
            name: input.name,
            shortname: input.shortname,
            role: input.role,
            model: input.model,
            instructions: input.instructions,
          },
        });
      }
      return { approvalId, status: 'pending' };
    },
  });

  return [
    writeProjectDoc,
    readProjectDocs,
    createGoal,
    createTask,
    updateTask,
    addTaskComment,
    listTasks,
    readPrDiff,
    listProjectFiles,
    triggerPipeline,
    requestApproval,
    hireAgent,
  ] as const;
}

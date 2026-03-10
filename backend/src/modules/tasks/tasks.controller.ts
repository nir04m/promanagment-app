import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/apiResponse';
import {
  createTask,
  listTasks,
  getTaskById,
  updateTask,
  selfAssignTask,
  deleteTask,
} from './tasks.service';
import { CreateTaskInput, UpdateTaskInput, ListTasksQuery } from './tasks.schema';

// Creates a new task in the project
export const create = catchAsync(async (req: Request, res: Response) => {
  const input = req.body as CreateTaskInput;
  const task = await createTask(req.params.projectId, input, req.user!.id, req);
  sendCreated(res, task, 'Task created successfully');
});

// Returns a filtered and paginated list of tasks for the project
export const list = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListTasksQuery;
  const result = await listTasks(req.params.projectId, req.user!.id, query);
  sendSuccess(res, result.data, 'Tasks retrieved successfully', 200, result.meta);
});

// Returns a single task by ID
export const getOne = catchAsync(async (req: Request, res: Response) => {
  const task = await getTaskById(req.params.taskId, req.user!.id);
  sendSuccess(res, task, 'Task retrieved successfully');
});

// Updates a task's details or status
export const update = catchAsync(async (req: Request, res: Response) => {
  const input = req.body as UpdateTaskInput;
  const task = await updateTask(req.params.taskId, input, req.user!.id, req);
  sendSuccess(res, task, 'Task updated successfully');
});

// Assigns the task to the currently authenticated user
export const selfAssign = catchAsync(async (req: Request, res: Response) => {
  const task = await selfAssignTask(req.params.taskId, req.user!.id, req);
  sendSuccess(res, task, 'Task self-assigned successfully');
});

// Deletes a task — PM only
export const remove = catchAsync(async (req: Request, res: Response) => {
  await deleteTask(req.params.taskId, req.user!.id, req);
  sendNoContent(res);
});
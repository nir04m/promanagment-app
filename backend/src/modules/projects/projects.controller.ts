import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/apiResponse';
import {
  createProject,
  listProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from './projects.service';
import {
  CreateProjectInput,
  UpdateProjectInput,
  ListProjectsQuery,
} from './projects.schema';

// Creates a new project with the authenticated PM as the owner
export const create = catchAsync(async (req: Request, res: Response) => {
  const input = req.body as CreateProjectInput;
  const project = await createProject(input, req.user!.id, req);
  sendCreated(res, project, 'Project created successfully');
});

// Returns a paginated list of projects the authenticated user belongs to
export const list = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListProjectsQuery;
  const result = await listProjects(req.user!.id, req.user!.systemRole, query);
  sendSuccess(res, result.data, 'Projects retrieved successfully', 200, result.meta);
});

// Returns a single project by ID if the user is a member
export const getOne = catchAsync(async (req: Request, res: Response) => {
  const project = await getProjectById(req.params.projectId, req.user!.id);
  sendSuccess(res, project, 'Project retrieved successfully');
});

// Updates a project — PM and owner only
export const update = catchAsync(async (req: Request, res: Response) => {
  const input = req.body as UpdateProjectInput;
  const project = await updateProject(req.params.projectId, req.user!.id, input, req);
  sendSuccess(res, project, 'Project updated successfully');
});

// Deletes a project permanently — owner only
export const remove = catchAsync(async (req: Request, res: Response) => {
  await deleteProject(req.params.projectId, req.user!.id, req);
  sendNoContent(res);
});
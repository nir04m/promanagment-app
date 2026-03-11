import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { sendSuccess } from '../../utils/apiResponse';
import { getProjectReport, getMyReport } from './reports.service';

// Returns the full project report — PM only
export const projectReport = catchAsync(async (req: Request, res: Response) => {
  const report = await getProjectReport(req.params.projectId, req.user!.id);
  sendSuccess(res, report, 'Project report retrieved successfully');
});

// Returns the personal task report for the authenticated user
export const myReport = catchAsync(async (req: Request, res: Response) => {
  const report = await getMyReport(req.user!.id);
  sendSuccess(res, report, 'Personal report retrieved successfully');
});
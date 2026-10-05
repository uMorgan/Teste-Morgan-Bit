import type { Request, Response } from 'express';
import type { ServiceRequestService } from '../services/service-request.service';
import { getAuthUser } from '../utils/http';
import {
  createRequestSchema,
  idParamSchema,
  listRequestsQuerySchema,
  updateRequestSchema,
  updateStatusSchema,
} from '../validators/schemas';

export class ServiceRequestController {
  constructor(private readonly service: ServiceRequestService) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const filters = listRequestsQuerySchema.parse(req.query);
    const result = await this.service.list(filters);
    res.status(200).json(result);
  };

  show = async (req: Request, res: Response): Promise<void> => {
    const { id } = idParamSchema.parse(req.params);
    const request = await this.service.getById(id);
    res.status(200).json(request);
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const input = createRequestSchema.parse(req.body);
    const created = await this.service.create(input, getAuthUser(req));
    res.status(201).location(`/api/requests/${created.id}`).json(created);
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = idParamSchema.parse(req.params);
    const data = updateRequestSchema.parse(req.body);
    const updated = await this.service.update(id, data, getAuthUser(req));
    res.status(200).json(updated);
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    const { id } = idParamSchema.parse(req.params);
    await this.service.delete(id, getAuthUser(req));
    res.status(204).send();
  };

  updateStatus = async (req: Request, res: Response): Promise<void> => {
    const { id } = idParamSchema.parse(req.params);
    const { status } = updateStatusSchema.parse(req.body);
    const updated = await this.service.updateStatus(id, status, getAuthUser(req));
    res.status(200).json(updated);
  };
}

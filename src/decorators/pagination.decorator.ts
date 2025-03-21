import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

import { Pagination } from '../constants/types';

export const PaginationParams = createParamDecorator((_data, ctx: ExecutionContext): Pagination => {
  const req: Request = ctx.switchToHttp().getRequest();

  const page = parseInt(req.query.page as string);
  const limit = parseInt(req.query.limit as string);

  if (isNaN(page) || page < 0 || isNaN(limit) || limit < 0) {
    throw new BadRequestException('Invalid pagination params');
  }

  const offset = page * limit;
  return { page, limit, offset };
});

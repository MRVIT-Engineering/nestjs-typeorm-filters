import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

import { Pagination } from '../constants/types';

export const PaginationParams = createParamDecorator((data, ctx: ExecutionContext): Pagination => {
  const req: Request = ctx.switchToHttp().getRequest();

  const page = parseInt(req.query.page as string);
  const size = parseInt(req.query.size as string);

  if (isNaN(page) || page < 0 || isNaN(size) || size < 0) {
    throw new BadRequestException('Invalid pagination params');
  }

  const limit = size;
  const offset = page * limit;
  return { page, limit, size, offset };
});

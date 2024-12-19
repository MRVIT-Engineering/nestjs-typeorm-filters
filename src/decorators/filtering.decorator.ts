import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

import { FilterRule } from '../constants/enums';
import { Filtering } from '../constants/types';

export const FilteringParams = createParamDecorator((data: string[], ctx: ExecutionContext): Filtering[] => {
  const req: Request = ctx.switchToHttp().getRequest();

  const filters = req.query.filter as string | string[];

  if (!filters) return [];

  if (!Array.isArray(data)) throw new BadRequestException('Filter properties must be an array');

  const filterArray: string[] = Array.isArray(filters) ? filters : [filters];

  return filterArray.map((filter) => {
    if (
      !filter.match(/^[a-zA-Z0-9_]+:(eq|neq|gt|gte|lt|lte|like|nlike|in|nin):[a-zA-Z0-9_,]+$/) &&
      !filter.match(/^[a-zA-Z0-9_]+:(isnull|isnotnull)$/)
    ) {
      throw new BadRequestException('Invalid filter parameter format');
    }

    const [property, rule, rawValue] = filter.split(':');
    if (!data.includes(property)) throw new BadRequestException(`Invalid filter property: ${property}`);

    if (!Object.values(FilterRule).includes(rule as FilterRule))
      throw new BadRequestException(`Invalid filter rule: ${rule}`);

    let value: string | number | Array<string | number>;

    if (rule === FilterRule.IN || rule === FilterRule.NOT_IN) {
      value = rawValue.split(',').map((v) => (isNaN(Number(v)) ? v : Number(v)));
    } else if (rule === FilterRule.IS_NULL || rule === FilterRule.IS_NOT_NULL) {
      value = [];
    } else {
      value = isNaN(Number(rawValue)) ? rawValue : Number(rawValue);
    }

    return { property, rule, value };
  });
});

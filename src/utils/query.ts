import {
  IsNull,
  Not,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  ILike,
  In,
  FindOptionsWhere,
} from 'typeorm';
import { Filtering, FilterRule, Sorting } from '../constants';

export const getOrder = (sort: Sorting) => (sort ? { [sort.property]: sort.direction } : {});

export const getWhere = (filters: Filtering[]): FindOptionsWhere<any> => {
  if (!filters || filters.length === 0) return {};

  const where: FindOptionsWhere<any> = {};

  filters.forEach((filter) => {
    switch (filter.rule) {
      case FilterRule.IS_NULL:
        where[filter.property] = IsNull();
        break;
      case FilterRule.IS_NOT_NULL:
        where[filter.property] = Not(IsNull());
        break;
      case FilterRule.EQUALS:
        where[filter.property] = filter.value;
        break;
      case FilterRule.NOT_EQUALS:
        where[filter.property] = Not(filter.value);
        break;
      case FilterRule.GREATER_THAN:
        where[filter.property] = MoreThan(filter.value);
        break;
      case FilterRule.GREATER_THAN_OR_EQUALS:
        where[filter.property] = MoreThanOrEqual(filter.value);
        break;
      case FilterRule.LESS_THAN:
        where[filter.property] = LessThan(filter.value);
        break;
      case FilterRule.LESS_THAN_OR_EQUALS:
        where[filter.property] = LessThanOrEqual(filter.value);
        break;
      case FilterRule.LIKE:
        where[filter.property] = ILike(`%${filter.value}%`);
        break;
      case FilterRule.NOT_LIKE:
        where[filter.property] = Not(ILike(`%${filter.value}%`));
        break;
      case FilterRule.IN:
        where[filter.property] = In(
          typeof filter.value === 'string' ? filter.value.split(',') : Array.isArray(filter.value) ? filter.value : []
        );
        break;
      case FilterRule.NOT_IN:
        where[filter.property] = Not(
          In(
            typeof filter.value === 'string' ? filter.value.split(',') : Array.isArray(filter.value) ? filter.value : []
          )
        );
        break;
      default:
        throw new Error(`Unsupported filter rule: ${filter.rule}`);
    }
  });

  return where;
};

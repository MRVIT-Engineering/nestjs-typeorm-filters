# @mrv/nestjs-typeorm-filtering

A NestJS library providing custom decorators to easily handle filtering and sorting of TypeORM queries based on HTTP query parameters.

This will provide a standardized way to handle filtering and sorting using TypeORM repository pattern.

## Features

- **FilteringParams**: Validate and parse filter query parameters into structured filter conditions for TypeORM queries.
- **SortingParams**: Validate and parse sort query parameters into a sorting configuration for TypeORM queries.
- **PaginationParams**: Validate and parse pagination parameters to handle offset-based pagination.
- Built-in validation to ensure only whitelisted properties are used for filtering/sorting.
  Throws BadRequestException on invalid input.

<br/>

## Installation

```bash
npm install @mrv/nestjs-typeorm-filters
```

or

```bash
yarn add @mrv/nestjs-typeorm-filters
```

<br/>

## Usage

1. **Import the Decorators**

```typescript
import { Controller, Get } from '@nestjs/common';
import {
  Filtering,
  Sorting,
  Pagination,
  FilteringParams,
  SortingParams,
  PaginationParams,
  getWhere,
  getOrder,
} from '@mrv/nestjs-typeorm-filters';
```

2. Apply in the Controller

- Make sure you add all the columns you want to `filter` by in the arrat param of the `FilteringParams` decorator.

```typescript
@Controller('users')
export class UsersController {
  @Get()
  findUsers(
    @FilteringParams(['username', 'email']) filters: Filtering[],
    @SortingParams(['createdAt']) sort: Sorting | null,
    @PaginationParams() pagination: Pagination
  ) {
    const whereCondition = getWhere(filters);
    const order = getOrder(sort);

    // Use TypeORM's repository pattern with pagination
    return this.userRepository.find({
      where: whereCondition,
      order: order,
      skip: pagination.offset,
      take: pagination.limit,
    });
  }
}
```

3. Apply in ther Service Class

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Filtering, getWhere } from '@mrvlabs/nestjs-typeorm-filters';

import { User } from './entities/post.entity';

@Injectable()
export class UserService {
  constructor(@InjectRepository(Post) private readonly userRepository: Repository<User>) {}

  fetch(filters: Filtering[]) {
    // Use TypeORM's repository pattarend and getWhere utility to apply the filters.
    return this.userRepository.find({ where: getWhere(filters) });
  }
}
```

<br/>

## Building Query Parameters

The `FilteringParams` and `SortingParams` decorators will validate and parse the query parameters into structured filter conditions and sorting configuration.

The `getWhere` and `getOrder` functions will build the where condition and order configuration for TypeORM queries.

When you want to apply query filters you need to add the `filter` query param in your HTTP request. The value of the param should be a string in the following format:

```bash
ENTITY_COLUMN:FILTER_RULE:FILTER_VALUE
```

To use `multiple` filtering values you can chain the `filter` query param on the HTTP request like this.

```bash
?filter=firstName:like:Rares&filter=id:eq:2
```

So if we take the last example, the return value from `getWhere` would be a TypeORM find [options object](https://orkhan.gitbook.io/typeorm/docs/find-options) like this

```typescript
 {
  firstName: FindOperator {
    '@instanceof': Symbol(FindOperator),
    _type: 'ilike',
    _value: '%Rares%',
    _useParameter: true,
    _multipleParameters: false,
    _getSql: undefined,
    _objectLiteralParameters: undefined
  },
  id: 2
}
```

So all you have to do to apply the filters using TypeORM [repository pattern](https://typeorm.io/working-with-repository) like this:

```ts
fetch(filters: Filtering[]) {
  const where = getWhere(filters);
  return this.userRepository.find({ where })
}
```

Here are some examples of how to build the query parameters:

- **Filtering**:

  - `GET` /users?filter=username:eq:john_doe
  - `GET` /users?filter=username:like:joh% (for "username LIKE 'joh%'")
  - `GET` /users?filter=email:in:john@example.com,jane@example.com

- **Sorting**:

  - `GET` /users?sort=createdAt:asc
  - `GET` /users?sort=createdAt:desc

- **Pagination**:

  - `GET` /users?page=0&size=10 (first page, 10 items per page)
  - `GET` /users?page=1&size=25 (second page, 25 items per page)

- **Combined Usage**:
  - `GET` /users?filter=username:eq:john_doe&sort=createdAt:desc&page=0&size=10

<br/>

## Supported Filter Rules

The following rules are supported (as defined in the FilterRule enum):

- `eq` (equals)
- `neq` (not equals)
- `gt` (greater than)
- `gte` (greater than or equal)
- `lt` (less than)
- `lte` (less than or equal)
- `like` (SQL LIKE)
- `nlike` (SQL NOT LIKE)
- `in` (SQL IN)
- `nin` (SQL NOT IN)
- `isnull` (SQL IS NULL)
- `isnotnull` (SQL IS NOT NULL)

You should make sure that your `client` applications build the URL queries with this `rules` as a standard. So for example you can create a utility method like the one in the example below to construct query params for the HTTP request:

```typescript
import { Filter } from '@/constants/types';

/**
 * Utility function to build query parameters for API filters
 *
 * @param filters - Array of filtering objects with property, rule, and value
 * @returns An object representing the query parameters for the filters
 */
export const buildFilterQueryParams = (filters: Filter[]): Record<string, string[]> => {
  const params: Record<string, string[]> = {
    filter: [],
  };

  filters.forEach((filter) => {
    let value: string;

    if (Array.isArray(filter.value)) {
      value = filter.value.join(',');
    } else {
      value = String(filter.value);
    }

    // Construct the filter parameter in the format 'property:rule:value'
    params.filter.push(`${filter.property}:${filter.rule}:${value}`);
  });

  return params;
};
```

<br />

## Types

- Filtering:

```typescript
Copy code
interface Filtering {
  property: string;
  rule: string;
  value: string | number | (string | number)[];
}
```

- Sorting:

```typescript
Copy code
interface Sorting {
  property: string;
  direction: 'asc' | 'desc';
}
```

- Pagination:

```typescript
interface Pagination {
  page: number; // Current page number (0-based)
  limit: number; // Number of items per page
  size: number; // Same as limit
  offset: number; // Calculated offset (page * limit)
}
```

## Pagination Details

The `PaginationParams` decorator provides offset-based pagination functionality:

- **Parameters**:

  - `page`: Zero-based page number (e.g., 0 for first page, 1 for second page)
  - `size`: Number of items per page

- **Validation**:

  - Both `page` and `size` must be non-negative numbers
  - Invalid values will throw a `BadRequestException`

- **Usage Example**:

```typescript
@Get()
async findAll(@PaginationParams() pagination: Pagination) {
  return this.repository.find({
    skip: pagination.offset,
    take: pagination.limit,
  });
}
```

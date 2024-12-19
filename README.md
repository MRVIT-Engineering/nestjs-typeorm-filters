# @mrv/nestjs-typeorm-filtering

A NestJS library providing custom decorators to easily handle filtering and sorting of TypeORM queries based on HTTP query parameters.

This will provide a standardized way to handle filtering and sorting using TypeORM repository pattern.

## Features

- **FilteringParams**: Validate and parse filter query parameters into structured filter conditions for TypeORM queries.
- **SortingParams**: Validate and parse sort query parameters into a sorting configuration for TypeORM queries.
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
import { Filtering, Sorting, FilteringParams, SortingParams, getWhere, getOrder } from '@mrv/nestjs-typeorm-filters';
```

2. Apply in the Controller

```typescript
@Controller('users')
export class UsersController {
  @Get()
  findUsers(
    @FilteringParams(['username', 'email']) filters: Filtering[],
    @SortingParams(['createdAt']) sort: Sorting | null
  ) {
    const whereCondition = getWhere(filters);
    const order = getOrder(sort);

    console.log('whereCondition', whereCondition);
    console.log('order', order);

    // Use query conditions to fetch data using TypeORM
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

Here are some examples of how to build the query parameters:

- **Filtering**:

  - `GET` /users?filter=username:eq:john_doe
  - `GET` /users?filter=username:like:joh% (for "username LIKE 'joh%'")
  - `GET` /users?filter=email:in:john@example.com,jane@example.com

- **Sorting**:

  - `GET` /users?sort=createdAt:asc
  - `GET` /users?sort=createdAt:desc

- **Multiple filters can be applied** by providing multiple filter query parameters:

  - `GET` /users?filter=username:eq:john_doe&filter=email:like:%example%

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

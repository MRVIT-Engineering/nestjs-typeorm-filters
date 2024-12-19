# @mrv/nestjs-typeorm-filtering

A NestJS library providing custom decorators to easily handle filtering and sorting of TypeORM queries based on HTTP query parameters.

## Features

- **_FilteringParams_**: Validate and parse filter query parameters into structured filter conditions for TypeORM queries.
- **SortingParams**: Validate and parse sort query parameters into a sorting configuration for TypeORM queries.
- Built-in validation to ensure only whitelisted properties are used for filtering/sorting.
  Throws BadRequestException on invalid input.

<br/>

## Installation

```bash
npm install nestjs-typeorm-query-decorators
```

or

```bash
yarn add nestjs-typeorm-query-decorators
```

<br/>

## Usage

1. **Import the Decorators**

```typescript
import { Controller, Get } from '@nestjs/common';
import { FilteringParams, SortingParams } from 'nestjs-typeorm-query-decorators';
import { Filtering, Sorting } from '@mrv/nestjs-typeorm-filters';
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
    // `filters` is now an array of filtering conditions, e.g.:
    // [{ property: 'username', rule: 'eq', value: 'john_doe' }]
    //
    // `sort` might be { property: 'createdAt', direction: 'asc' } or null if none provided.
    // Apply filters and sorting to your TypeORM query, for example:
    // let query = this.userRepository.createQueryBuilder('user');
    // filters.forEach(filter => {
    //   // Apply filter logic here
    // });
    // if (sort) {
    //   query.addOrderBy(`user.${sort.property}`, sort.direction.toUpperCase());
    // }
    // return query.getMany();
  }
}
```

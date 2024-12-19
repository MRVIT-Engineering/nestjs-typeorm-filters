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
  ) {}
```

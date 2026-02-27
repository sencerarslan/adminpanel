---
trigger: always_on
glob: ["**/*.ts", "**/*.tsx"]
description: TypeScript type safety rules, best practices, and project-specific type patterns
---

# TypeScript Rules

## Core Principles

- **Strict mode**: `"strict": true` must be enabled in `tsconfig.json`. No exceptions.
- **No `any`**: Using `any` is forbidden. Use `unknown` with a type-guard when the type is truly unknown.
- **No type assertions without guards**: Avoid `as SomeType` casts. Prefer narrowing with `if`, `instanceof`, or custom type-guards.
- **Explicit return types**: All exported functions and React components must have explicit return types.
- **No non-null assertion**: Avoid `value!` — use optional chaining `value?.` or explicit null checks.

## Type Definitions

- All shared types live in `types/`. Domain-specific types go in `types/<domain>.types.ts`.
- Prefer `interface` for object shapes that may be extended; use `type` for unions, intersections, and mapped types.
- Never use `object`, `Function`, or `{}` as types — be precise.
- Use `readonly` for props and data that should not be mutated.

```ts
// ✅ Good
interface User {
  readonly id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string; // ISO 8601 string from API
}

type UserRole = 'admin' | 'editor' | 'viewer';

// ❌ Bad
const getUser = (id: any): any => { ... }
const user: object = { id: '1' };
```

## Type Guards

Write explicit type-guards instead of casting:

```ts
// ✅ Good
function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    'code' in value
  );
}

// ❌ Bad
const err = error as ApiError;
```

## React Component Types

```ts
// ✅ Always explicit JSX return type
export function UserCard({ user }: UserCardProps): React.JSX.Element {
  return <div>{user.name}</div>;
}

// Props interface — always above the component
interface UserCardProps {
  readonly user: User;
  onEdit?: (id: string) => void;
  className?: string;
}
```

## Generics

- Use descriptive generic parameter names beyond single letters for complex types (`TData`, `TResponse`, `TFilters`).
- Constrain generics whenever possible: `<T extends Record<string, unknown>>`.

```ts
// ✅ Descriptive generics
function useApiQuery<TData, TFilters extends Record<string, unknown>>(
  queryKey: readonly unknown[],
  filters: TFilters,
): TData { ... }
```

## Enums

Prefer `const` object + `typeof` union over TypeScript `enum` to avoid runtime overhead:

```ts
// ✅ Preferred
const OrderStatus = {
  PENDING: 'pending',
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
} as const;

type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

// ❌ Avoid
enum OrderStatus { PENDING, ACTIVE, CANCELLED }
```

## API & Shared Types

Every API response must be typed. Never leave responses as `unknown` without narrowing.

```ts
// src/types/api.types.ts
export interface ApiResponse<TData> {
  data: TData;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<TData> {
  data: TData[];
  pagination: {
    readonly page: number;
    readonly perPage: number;
    readonly total: number;
    readonly totalPages: number;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  errors?: Record<string, string[]>; // field-level validation errors
}
```

## Component & Hook Typing Patterns

```ts
// Event handlers
type ButtonClickHandler = React.MouseEventHandler<HTMLButtonElement>;
type InputChangeHandler = React.ChangeEventHandler<HTMLInputElement>;

// Children
interface WithChildren {
  children: React.ReactNode;
}

// Polymorphic 'as' prop pattern (when needed)
interface PolymorphicProps<TElement extends React.ElementType> {
  as?: TElement;
}
```

## Utility Types

Leverage built-in utility types before defining new ones:

| Utility | Use case |
|---------|----------|
| `Partial<T>` | Optional version of all fields (e.g. update payload) |
| `Required<T>` | All fields mandatory |
| `Pick<T, K>` | Subset of fields |
| `Omit<T, K>` | Exclude fields (e.g. omit `id` from create DTO) |
| `NonNullable<T>` | Strip `null \| undefined` |
| `Parameters<T>` | Extract function parameter types |
| `ReturnType<T>` | Extract function return type |
| `Awaited<T>` | Unwrap Promise type |

```ts
// Common patterns
type CreateUserDto = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateUserDto = Partial<CreateUserDto>;
type UserSummary = Pick<User, 'id' | 'name' | 'email'>;
```

## tsconfig.json Requirements

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---
trigger: always_on
glob: ["**/*.tsx"]
description: Form management with React Hook Form and Zod validation
---

# Forms Rules

## Core Stack

- **Form state**: React Hook Form. Managing form state with `useState` is forbidden.
- **Validation**: Zod schemas. `@hookform/resolvers/zod` is used as the resolver.
- **UI components**: shadcn/ui `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`.

## Schema Definition

Zod schemas are defined at the top of the form file or in a dedicated `<domain>.schema.ts` file for reuse:

```ts
// schemas/user.schema.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2, 'Ad en az 2 karakter olmalıdır').max(100),
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  role: z.enum(['admin', 'editor', 'viewer'], {
    required_error: 'Rol seçimi zorunludur',
  }),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
```

## Form Setup

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function CreateUserForm() {
  const form = useForm<CreateUserDto>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: '', email: '', role: 'viewer' },
  });

  const { mutate, isPending } = useCreateUser();

  function onSubmit(values: CreateUserDto) {
    mutate(values, {
      onSuccess: () => {
        toast.success('Kullanıcı başarıyla oluşturuldu');
        form.reset();
      },
      onError: (err) => toast.error(err.message),
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ad Soyad</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* ... other fields */}
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Oluştur
        </Button>
      </form>
    </Form>
  );
}
```

## Required Field Rules

Every form field must have:
- `<FormLabel>` — descriptive label text
- `placeholder` — example input value
- `<FormMessage>` — Zod-generated or custom error display

## Submit Button Behavior

- Disabled while the mutation is in flight (`isPending`).
- Shows a loading spinner (Loader2 from lucide-react + `animate-spin`) during submission.
- Never disabled simply because the form is invalid — let the user attempt submission to see all errors.

## After Successful Submit

- Show a `toast.success()` notification.
- Reset the form with `form.reset()` if creating a new resource.
- Close the modal/drawer if the form is rendered inside one.
- Invalidate the relevant TanStack Query cache to reflect the new data.

## Edit Forms

- Pre-populate `defaultValues` from the fetched entity data.
- Use `form.reset(fetchedData)` inside the query's `onSuccess` or `useEffect` (only for resetting derived state from props — this is the one permitted `useEffect` pattern).
- Show a skeleton loader while the entity is loading; do not render the form with empty defaults.

## Multi-Step Forms

- Each step has its own Zod schema; all steps are composed into a single merged schema for final submission.
- Step state is managed with `useState` at the parent level — not inside individual step components.
- Navigating back preserves entered values (keep form instance alive, don't unmount).

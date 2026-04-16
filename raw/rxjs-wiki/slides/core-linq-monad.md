---
marp: true
theme: uncover
title: "LINQ — Language Integrated Monad"
---

# LINQ — Language Integrated Monad

> LINQ is not just "Language Integrated Query" — it is Language Integrated Monad: a mechanism for composing computations inside any container that satisfies three algebraic laws. Observable is one such container, and `mergeMap`/`switchMap`/`concatMap`/`exhaustMap` are its four interpretations of the monadic bind.

---

## What Is a Monad?

A monad is a triple **(M, of, flatMap)**:

| Component | Type | In RxJS |
|-----------|------|---------|
| **M** | Type constructor `M<T>` | `Observable<T>` |
| **of** (unit / return) | `T → M<T>` | `of(x)` |
| **flatMap** (bind) | `M<T> → (T → M<R>) → M<R>` | `mergeMap(f)` |

Three laws that must hold:
```
Left identity:   of(x).pipe(mergeMap(f))           ≡  f(x)
Right identity:  obs.pipe(mergeMap(of))              ≡  obs
Associativity:   obs.pipe(mergeMap(f), mergeMap(g))  ≡  obs.pipe(mergeMap(x => f(x).pipe(mergeMap(g))))
```

---

## The IEnumerable Monad

```typescript
// unit:  T → T[]         = (x) => [x]
// bind:  T[] → (T → R[]) → R[]  = Array.flatMap

const xs = [1, 2, 3];

// SelectMany = flatMap = monadic bind
const result = xs.flatMap(x => [x, x * 10]);
// [1, 10, 2, 20, 3, 30]
```

- LINQ query syntax (`from x in xs select f(x)`) **de-sugars to `SelectMany`**
- Any type providing `Select` + `SelectMany` participates in LINQ
- `IEnumerable`, `IObservable`, `Task`, `IQueryable` — all monads

---

## IObservable — The Dual Monad

```typescript
// Left identity: of(x).pipe(mergeMap(f)) ≡ f(x)
of(5).pipe(mergeMap(x => of(x * 2)));
// emits: 10  — same as of(10)

// Right identity: obs.pipe(mergeMap(of)) ≡ obs
source$.pipe(mergeMap(of));  // identity — no change

// Associativity
source$.pipe(mergeMap(f), mergeMap(g));
// ≡
source$.pipe(mergeMap(x => f(x).pipe(mergeMap(g))));
```

- Associativity → collapse/expand `mergeMap` chains freely
- Same algebraic guarantees as LINQ on arrays

---

## SelectMany → Four flatMap Policies

| Operator | Policy | When new outer arrives |
|----------|--------|------------------------|
| `mergeMap` | Interleave all inners | Keep existing, run new |
| `concatMap` | Queue, never overlap | Buffer until current finishes |
| `switchMap` | Cancel previous | Unsubscribe old, subscribe new |
| `exhaustMap` | Ignore while busy | Discard new until done |

```
outer:  --a-------b-------c-->
mergeMap:  --A1--A2-B1--B2-C1--|  (all interleaved)
switchMap: --A1--B1--C1--|        (only latest survives)
```

All four satisfy the monad laws for their interpretation of bind.

---

## pipe() as Kleisli Composition

- A **Kleisli arrow** for monad M: `A → M<B>`
- `OperatorFunction<A, B>` = `Observable<A> → Observable<B>` = Kleisli arrow
- `pipe(f, g)` = compose two Kleisli arrows without manual subscription

```typescript
// Kleisli arrows
const double: OperatorFunction<number, number> = map(x => x * 2);
const toString: OperatorFunction<number, string> = map(x => `${x}`);

// Kleisli composition — associativity guaranteed by monad laws
const doubleToString = pipe(double, toString);
// pipe(pipe(f, g), h) ≡ pipe(f, pipe(g, h))
```

---

## LINQ Query Syntax as Do-Notation

```
Haskell do-notation:    C# query syntax:         RxJS pipe():
do                      from x in xs             xs.pipe(
  x <- xs               from y in f(x)             mergeMap(x =>
  y <- f(x)             select g(x, y)               f(x).pipe(
  return g(x, y)                                        map(y => g(x, y))
                                                   ))
                                                 )
```

All three express: "for each `x` from `xs`, run `f(x)`, combine with `g`."
The monad handles the container plumbing. The programmer writes only domain logic.

---

## Monad Laws as Refactoring Rules

```typescript
// 1. Left identity — wrapping then binding is a no-op
of(userId).pipe(mergeMap(id => fetchUser(id)));
// safe to refactor to:
fetchUser(userId);

// 2. Right identity — binding with of() is a no-op
obs$.pipe(mergeMap(x => of(x)));
// safe to refactor to:
obs$;

// 3. Associativity — re-nesting is safe
obs$.pipe(mergeMap(x => validate(x)), mergeMap(x => save(x)));
// ≡
obs$.pipe(mergeMap(x => validate(x).pipe(mergeMap(y => save(y)))));
```

---

## Why LINQ Works on Arrays and Streams Equally

```typescript
// IEnumerable monad:
[1, 2, 3].flatMap(x => [x, x + 10]);
// [1, 11, 2, 12, 3, 13]

// IObservable monad:
of(1, 2, 3).pipe(
	mergeMap(x => of(x, x + 10))
);
// emits: 1, 11, 2, 12, 3, 13
```

- Same algebraic structure → same operator catalogue
- Erik Meijer applied all LINQ operators to `IObservable` **by algebra, not reinvention**
- `switchMap` has no array equivalent only because arrays are synchronous (no time dimension)

---

## Observable Is Not a "Pure" Monad in Practice

- **`mergeMap`** — satisfies all three laws unconditionally → canonical monadic bind
- **`concatMap`** — satisfies all three; sacrifices concurrency
- **`switchMap`** — breaks associativity with async inners (cancellation changes outcomes)
- **`exhaustMap`** — breaks associativity (ignoring values changes outcomes)

**Practical rule:**
- Use `mergeMap` when algebraic reasoning matters (laws always hold)
- Use `switchMap`/`exhaustMap`/`concatMap` for their practical concurrency properties — knowing the law you're bending

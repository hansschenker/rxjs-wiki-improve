---
title: "LINQ — Language Integrated Monad"
category: core
tags: [core, monad, linq, flatMap, selectMany, functional-programming, category-theory, mathematical-foundations]
related: [observable-internals.md, higher-order-operators.md, frp-concepts.md, custom-operators.md, ../history/erik-meijer.md, ../history/roots.md]
sources: 2
updated: 2026-04-09
---

# LINQ — Language Integrated Monad

> LINQ is not just "Language Integrated **Query**" — it is Language Integrated **Monad**: a mechanism for composing computations inside any container that satisfies three algebraic laws. Observable is one such container, and `mergeMap`/`switchMap`/`concatMap`/`exhaustMap` are its four interpretations of the monadic bind.

## Overview

Erik Meijer, creator of both LINQ and Rx.NET, has said explicitly that LINQ is a monad comprehension system. C#'s `from ... select` syntax de-sugars to calls to `SelectMany`, `Select`, and `Where` — exactly Haskell's `do`-notation for monads. The same mathematical structure that makes LINQ work on `IEnumerable<T>` (arrays, databases, XML) also makes it work on `IObservable<T>` (push streams). RxJS inherits this structure directly.

Understanding Observable as a monad explains:
- Why `of(x).pipe(mergeMap(f))` is the same as calling `f(x)` directly
- Why `pipe()` chains can always be collapsed into a single `mergeMap`
- Why there are exactly four `flatMap` policies — and what each policy sacrifices to gain its property
- Why the Observable contract has exactly the shape it has

## What Is a Monad?

A monad is a triple **(M, of, flatMap)** where:

| Component | Type | In RxJS |
|-----------|------|---------|
| **M** | Type constructor `M<T>` | `Observable<T>` |
| **of** (unit / return) | `T → M<T>` | `of(x)` |
| **flatMap** (bind / chain) | `M<T> → (T → M<R>) → M<R>` | `mergeMap(f)` |

The three **monad laws** that must hold:

```
Left identity:   of(x).pipe(mergeMap(f))          ≡  f(x)
Right identity:  obs.pipe(mergeMap(of))             ≡  obs
Associativity:   obs.pipe(mergeMap(f), mergeMap(g)) ≡  obs.pipe(mergeMap(x => f(x).pipe(mergeMap(g))))
```

These laws mean you can **refactor chains freely** without changing observable behaviour — exactly the same guarantee LINQ gives over SQL or arrays.

## The IEnumerable Monad

LINQ operators on arrays are monadic operations over `IEnumerable<T>`:

```typescript
// IEnumerable monad:
// unit:   T → T[]          = (x) => [x]
// bind:   T[] → (T → R[]) → R[]  = Array.prototype.flatMap

const xs = [1, 2, 3];

// SelectMany = flatMap = monadic bind
const result = xs.flatMap(x => [x, x * 10]);
// [1, 10, 2, 20, 3, 30]

// C# query syntax (de-sugared to SelectMany):
// from x in xs
// from y in [x, x * 10]
// select y
```

**LINQ query syntax is syntactic sugar over the monad.** The C# compiler transforms `from`/`select`/`where` into method calls. Any type that provides `Select` (map) and `SelectMany` (flatMap) gets to participate in query syntax — `IEnumerable`, `IObservable`, `Task`, `IQueryable`, even user-defined types.

## IObservable — The Dual Monad

Applying the [IEnumerable ↔ IObservable duality](../history/roots.md), `IObservable<T>` is also a monad with the same three components:

```typescript
// Observable monad:
// unit:   T → Observable<T>          = of(x)
// bind:   Observable<T> → (T → Observable<R>) → Observable<R>  = mergeMap(f)

import { of, mergeMap } from 'rxjs';

// Left identity: of(x).pipe(mergeMap(f)) ≡ f(x)
of(5).pipe(
	mergeMap(x => of(x * 2))
);
// emits: 10  — same as of(5 * 2)

// Right identity: obs.pipe(mergeMap(of)) ≡ obs
source$.pipe(mergeMap(of));
// emits same values as source$

// Associativity
source$.pipe(
	mergeMap(x => f(x)),
	mergeMap(y => g(y)),
);
// ≡
source$.pipe(
	mergeMap(x => f(x).pipe(mergeMap(y => g(y)))),
);
```

The associativity law is the practical one: it proves that **flattening a chain of `mergeMap` calls into a single nested `mergeMap` is always safe** — behaviour is identical either way.

## SelectMany → Four flatMap Policies

For `IEnumerable`, `SelectMany` has one obvious meaning: append all results in order. For `IObservable`, there is a new dimension: **what happens when a new outer value arrives while a previous inner Observable is still running?**

There are exactly four pure policies:

| Operator | Policy | Inner concurrency | When new outer arrives |
|----------|--------|-------------------|------------------------|
| `mergeMap` | Subscribe to all, interleave | Unlimited | Keep existing, run new |
| `concatMap` | Queue, never overlap | 1 (sequential) | Buffer until current finishes |
| `switchMap` | Cancel previous, keep latest | 1 (latest only) | Unsubscribe old, subscribe new |
| `exhaustMap` | Ignore while busy | 1 (first only) | Discard new until current finishes |

```
outer:   --a-------b-------c-->
         mergeMap(v => inner$(v))

inner(a): ---A1--A2--|
inner(b):          ---B1--B2--|
inner(c):                   ---C1--|

merge:   -----A1--A2-B1--B2---C1--|

─────────────────────────────────────

         switchMap(v => inner$(v))

inner(a): ---A1--A2--|      ← cancelled when b arrives
inner(b):    ---B1--B2--|   ← cancelled when c arrives
inner(c):             ---C1--|

switch:  -----A1--B1--C1--|
```

All four satisfy the monad laws for their respective interpretation of "binding". They are not four different monads — they are four different strategies for the same monadic structure.

## pipe() as Kleisli Composition

In category theory, a **Kleisli arrow** for a monad M is a function `A → M<B>`. Composing two Kleisli arrows `A → M<B>` and `B → M<C>` gives `A → M<C>` — the intermediate wrapping is handled automatically.

In RxJS:
- An **`OperatorFunction<A, B>`** is `Observable<A> → Observable<B>` — a Kleisli arrow
- **`pipe(f, g)`** is Kleisli composition: produce `Observable<A> → Observable<C>` without manually subscribing to the intermediate
- The monad laws guarantee this composition is associative: `pipe(f, pipe(g, h))` ≡ `pipe(pipe(f, g), h)`

```typescript
// Kleisli arrows (OperatorFunctions)
const double: OperatorFunction<number, number> = map(x => x * 2);
const toString: OperatorFunction<number, string> = map(x => `${x}`);

// Kleisli composition via pipe()
const doubleToString = pipe(double, toString);

// Associativity guaranteed by monad laws:
pipe(pipe(double, toString), prefix)
// ≡
pipe(double, pipe(toString, prefix))
```

## LINQ Query Syntax as Do-Notation

Haskell's `do`-notation is syntactic sugar over monadic bind. C#'s LINQ query syntax is the same thing, cross-language:

```
Haskell do-notation:         C# query syntax:              RxJS pipe():
do                           from x in xs                  xs.pipe(
  x <- xs                    from y in f(x)                  mergeMap(x =>
  y <- f(x)                  select g(x, y)                    f(x).pipe(
  return g(x, y)                                                  map(y => g(x, y))
                                                              ))
                                                          )
```

All three express the same computation: "for each `x` drawn from `xs`, run `f(x)`, then combine `x` and `y` with `g`." The monad handles the container plumbing (`[]`, `IObservable`, etc.) so the programmer writes only the domain logic.

## Monad Laws as Refactoring Rules

The three laws are practical refactoring guarantees:

```typescript
// 1. Left identity — wrapping then immediately binding is a no-op
of(userId).pipe(
	mergeMap(id => fetchUser(id))
);
// Refactor to (safe by left identity):
fetchUser(userId);

// 2. Right identity — binding with of() is a no-op
obs$.pipe(mergeMap(x => of(x)));
// Refactor to (safe by right identity):
obs$;

// 3. Associativity — pipeline order doesn't change semantics
obs$.pipe(
	mergeMap(x => validate(x)),
	mergeMap(x => save(x)),
);
// Refactor to nested form (safe by associativity):
obs$.pipe(
	mergeMap(x => validate(x).pipe(mergeMap(y => save(y)))),
);
```

Breaking any of these laws would mean your code silently changes behaviour when you restructure it — the laws protect you from that.

## Observable is Not a "Real" Monad — Practically

Pure monad theory requires `mergeMap` to satisfy all three laws. In practice:

- **Left identity** holds for `mergeMap`, `concatMap`, `switchMap`, `exhaustMap`
- **Right identity** holds for all four
- **Associativity** holds for `mergeMap` and `concatMap`; for `switchMap` it holds in the absence of time (if inners complete synchronously). With asynchronous inners, `switchMap`'s cancellation breaks associativity — the order of flattening changes which values get cancelled.

This is why **`mergeMap` is the "canonical" monadic bind for Observable** — it is the only one that satisfies all three laws unconditionally. The other three sacrifice associativity (switchMap/exhaustMap) or concurrency freedom (concatMap) to gain a practical property.

## Why LINQ Works on Both Arrays and Streams

Because `IEnumerable` and `IObservable` are both monads (over their respective values), any LINQ operator derivable from `SelectMany` works for both — automatically, by algebra.

```typescript
// Works on arrays (IEnumerable monad):
[1, 2, 3].flatMap(x => [x, x + 10]);  // [1, 11, 2, 12, 3, 13]

// Works on streams (IObservable monad):
of(1, 2, 3).pipe(
	mergeMap(x => of(x, x + 10))
);
// emits: 1, 11, 2, 12, 3, 13
```

The operator implementations differ (one pulls synchronously, the other subscribes and pushes), but the algebraic structure — and the laws that govern composition — is identical. This is the deep reason Erik Meijer could take all of LINQ's operator catalogue and apply it directly to `IObservable` without reinventing anything.

## Related

- [observable-internals](observable-internals.md) — building Observable from scratch; Observer/Iterator synthesis
- [higher-order-operators](higher-order-operators.md) — switchMap / mergeMap / concatMap / exhaustMap in depth
- [frp-concepts](frp-concepts.md) — FRP origins; Event/Behavior duality
- [custom-operators](custom-operators.md) — writing OperatorFunction (Kleisli arrows)
- [erik-meijer](../history/erik-meijer.md) — Erik Meijer's mathematical foundations
- [roots](../history/roots.md) — how the IEnumerable/IObservable dual was discovered

---
marp: true
theme: uncover
title: "Subject"
---

# Subject

> A special Observable that is also an Observer — it multicasts to all its subscribers and allows imperative value injection from outside.

---

## What Makes Subject Special

- A regular Observable creates a **new execution per subscriber** (cold)
- Subject maintains a **list of observers** — forwards each value to all of them
- Simultaneously an **Observable** (subscribe to it) and an **Observer** (call `next`/`error`/`complete` on it)

```
Source ──► Subject ──► Observer 1
                  └──► Observer 2
                  └──► Observer 3
```

---

## Basic Usage

```typescript
const subject$ = new Subject<number>();

// Subscribe (as Observable)
subject$.subscribe(v => console.log('A:', v));
subject$.subscribe(v => console.log('B:', v));

// Emit (as Observer)
subject$.next(1); // A: 1, B: 1
subject$.next(2); // A: 2, B: 2
subject$.complete();
```

---

## Late Subscribers Miss Past Values

- Values emitted **before** `subscribe()` are **permanently lost** to late subscribers
- This is the critical pitfall of plain `Subject`
- For late-subscriber replay → use `BehaviorSubject` or `ReplaySubject`

```typescript
const subject$ = new Subject<number>();
subject$.next(1); // emitted to no-one
subject$.next(2); // emitted to no-one

subject$.subscribe(v => console.log(v)); // subscribes AFTER
subject$.next(3); // sees: 3 only — missed 1 and 2
```

---

## As a Bridge (Cold → Hot)

- Pipe a cold Observable into a Subject to **make it hot**
- All subscribers share the same upstream execution

```typescript
const cold$ = interval(1000);
const subject$ = new Subject<number>();

cold$.subscribe(subject$); // pipe cold into subject

// Both share the same interval
subject$.subscribe(v => console.log('A', v));
subject$.subscribe(v => console.log('B', v));
```

---

## As an Action Bus

- Canonical use in **MVU / effects** architectures
- `action$.next(...)` dispatches; `action$.pipe(ofType(...))` listens

```typescript
const action$ = new Subject<Action>();

// Dispatch
action$.next({ type: 'LOAD_DATA' });

// Effects listen
action$.pipe(
	ofType('LOAD_DATA'),
	switchMap(() => fetchData())
).subscribe(data => action$.next({ type: 'LOAD_SUCCESS', payload: data }));
```

---

## Variants

| Type | Replays | Initial value | Use case |
|------|---------|---------------|----------|
| `Subject` | None | None | Event bus, action dispatcher |
| `BehaviorSubject` | Last 1 | Required | State holder |
| `ReplaySubject` | Last N | Optional | Cache, late-join streams |
| `AsyncSubject` | Last 1 on complete | None | Promise-like, last value |

---

## Pitfalls

- `error()` propagates to **all subscribers** — Subject becomes a "zombie" (any further `subscribe()` immediately errors)
- After `complete()` or `error()`, Subject is **inert** — no future values can be emitted

```typescript
const s$ = new Subject<number>();
s$.subscribe({ error: e => console.log('A error') });
s$.subscribe({ error: e => console.log('B error') });

s$.error(new Error('boom')); // Both subscribers error
// Subject now dead — all new subscribers immediately error
```

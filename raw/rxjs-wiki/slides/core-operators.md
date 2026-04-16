---
marp: true
theme: uncover
title: "Operators Overview"
---

# Operators Overview

> Pure functions that transform Observables — the vocabulary of reactive programming. Each operator takes an Observable and returns a new Observable without mutating the source.

---

## How Operators Work

- An operator is `Observable<T> → Observable<R>` — a **pure function**, no mutation
- Applied via `pipe()`, composed **left-to-right**
- Each operator wraps the previous, building a lazy chain until `subscribe()`

```typescript
type OperatorFunction<T, R> = (source: Observable<T>) => Observable<R>;

source$.pipe(
	operator1(),
	operator2(),
	operator3()
);
```

---

## Operator Selection Decision Tree

- Choose the **right family** before picking a specific operator

```
Transform each value?            → map, scan, reduce
Filter values?                   → filter, take, distinctUntilChanged
Async work per value?            → switchMap, mergeMap, concatMap, exhaustMap
Combine multiple streams?        → combineLatest, merge, zip, withLatestFrom
Handle rate / time?              → debounceTime, throttleTime, delay
Share a stream?                  → share, shareReplay
Handle errors?                   → catchError, retry
```

---

## Creation Operators

| Operator | Use case |
|----------|----------|
| `of(...values)` | Synchronous values |
| `from(iterable/Promise)` | Convert to Observable |
| `fromEvent(target, event)` | DOM events (hot) |
| `interval(ms)` | 0, 1, 2… on interval |
| `timer(delay, interval?)` | Delayed, optional repeat |
| `defer(factory)` | Lazy per-subscribe creation |
| `EMPTY` / `NEVER` | Complete now / never emit |

---

## Transformation Operators

| Operator | Use case |
|----------|----------|
| `map(fn)` | Transform each value |
| `scan(fn, seed)` | Running accumulation / state |
| `switchMap(fn)` | Cancel previous inner (search) |
| `mergeMap(fn)` | Parallel inners (fetch) |
| `concatMap(fn)` | Sequential inners (ordered) |
| `exhaustMap(fn)` | Ignore while active (submit) |
| `pairwise()` | Emit `[prev, curr]` pairs |

---

## Filtering Operators

| Operator | Use case |
|----------|----------|
| `filter(pred)` | Emit only matching values |
| `take(n)` / `takeUntil(n$)` | Limit / cancel on signal |
| `debounceTime(ms)` | Emit after silence |
| `throttleTime(ms)` | Rate limit |
| `distinctUntilChanged()` | Skip unchanged values |
| `first()` / `last()` | Single boundary value |
| `skip(n)` | Discard first n values |

---

## Combination Operators

| Operator | Use case |
|----------|----------|
| `combineLatest([a$, b$])` | Latest from all on any emission |
| `merge(a$, b$)` | Concurrent merge |
| `concat(a$, b$)` | Sequential — b$ after a$ completes |
| `zip([a$, b$])` | Pair nth values |
| `forkJoin([a$, b$])` | All complete → last values |
| `withLatestFrom(b$)` | Sample b$ when source emits |
| `startWith(...values)` | Prepend sync values |

---

## Error Handling Operators

| Operator | Description |
|----------|-------------|
| `catchError(fn)` | Replace error with Observable |
| `retry(n)` | Resubscribe on error N times |
| `retryWhen(fn)` | Custom retry logic |
| `onErrorResumeNext(...)` | Continue with next source |

---

## Multicasting Operators

| Operator | Description |
|----------|-------------|
| `share()` | `publish() + refCount()` |
| `shareReplay(n)` | Share + replay last n values |
| `publish()` | Multicast with Subject |
| `publishBehavior(v)` | Multicast with BehaviorSubject |
| `publishReplay(n)` | Multicast with ReplaySubject |
| `multicast(Subject)` | Manual multicast control |

---

## Utility Operators

| Operator | Use case |
|----------|----------|
| `tap(fn)` | Side effects without mutation |
| `delay(ms)` | Delay all emissions |
| `timeout(ms)` | Error if no emission in time |
| `finalize(fn)` | Teardown / cleanup callback |
| `observeOn(scheduler)` | Move emissions to scheduler |

---

## Lossy vs Non-Lossy Operators

- **Non-lossy** — every input appears in output: `map`, `scan`, `delay`
- **Lossy** — some inputs intentionally dropped: `filter`, `debounceTime`, `take`
- Lossy is a **deliberate design choice** — not a bug

| | Non-lossy | Lossy |
|--|-----------|-------|
| Value-based | `map`, `scan`, `pairwise` | `filter`, `distinctUntilChanged`, `take` |
| Time-based | `delay`, `bufferTime` | `debounceTime`, `throttleTime` |

---

## Value-Based vs Time-Based Operators

- **Value-based** — operates on the *content* of emissions: `map`, `filter`, `scan`
- **Time-based** — operates on the *timing* of emissions: `debounceTime`, `delay`, `timeout`
- Axes are **orthogonal** — problem is *what data arrives* vs *when data arrives*

---

## First-Order vs Higher-Order Operators

| Category | Returns | Examples |
|----------|---------|---------|
| **First-order** | Values | `map`, `filter`, `tap`, `scan` |
| **Higher-order** | Observables (flattened) | `switchMap`, `mergeMap`, `concatMap`, `exhaustMap` |

```typescript
source$.pipe(
	map(x => x * 2),              // first-order: number → number
	switchMap(x => http.get(x)),   // higher-order: number → Observable<Response>
);
```

---

## The Higher-Order Mapping Operators Compared

All four take `value => Observable` and flatten — differ only in **concurrency strategy**:

```
switchMap   — cancel previous inner on new outer  (search typeahead)
mergeMap    — run all inners concurrently          (parallel fetch)
concatMap   — queue inners, one at a time          (sequential ops)
exhaustMap  — ignore new outer while inner active  (form submit)
```

- Wrong choice here is the most common source of **race conditions** in RxJS

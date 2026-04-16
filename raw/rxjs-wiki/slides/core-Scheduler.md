---
marp: true
theme: uncover
title: "Scheduler"
---

# Scheduler

> Controls *when* work is executed in RxJS — the execution context for Observable emissions.

---

## What a Scheduler Does

- Answers: "**When** should the next `next()` call happen?"
- Decouples *what* to do from *when* to do it
- All built-in creation operators accept an optional `scheduler` parameter
- Used explicitly via `observeOn()` and `subscribeOn()`

---

## Built-in Schedulers

| Scheduler | Mechanism | When work runs |
|-----------|-----------|----------------|
| `asyncScheduler` | `setTimeout` / `setInterval` | After current sync code |
| `asapScheduler` | Microtask (`Promise.resolve`) | After task, before next macrotask |
| `animationFrameScheduler` | `requestAnimationFrame` | Before next browser paint |
| `queueScheduler` | Synchronous queue | Synchronously, in order |
| `VirtualTimeScheduler` | Simulated time | Testing — advance manually |

---

## Usage

```typescript
// Make emissions async
of(1, 2, 3).pipe(
	observeOn(asyncScheduler)
).subscribe(console.log);
// Nothing logged until current call stack clears

// Schedule DOM updates on animation frames
state$.pipe(
	observeOn(animationFrameScheduler)
).subscribe(updateDOM);
```

---

## `observeOn` vs `subscribeOn`

| | `observeOn` | `subscribeOn` |
|--|-------------|---------------|
| Affects | `next` / `error` / `complete` calls | When `subscribe()` itself runs |
| Use case | Deliver values on specific scheduler | Start subscription on specific scheduler |

```typescript
// Deliver values on animationFrame
source$.pipe(observeOn(animationFrameScheduler)).subscribe(render);

// Start subscription asynchronously
source$.pipe(subscribeOn(asyncScheduler)).subscribe(handler);
```

---

## Scheduler in Creation Operators

Many creators accept a scheduler as the last argument:

```typescript
interval(1000, asyncScheduler)           // default
interval(1000, animationFrameScheduler)  // synced with rAF
of(1, 2, 3, asyncScheduler)             // emit asynchronously
```

---

## TestScheduler (Virtual Time)

- Replaces real time with **virtual time** for deterministic testing
- `run()` callback gives access to `cold`, `hot`, `expectObservable`

```typescript
const testScheduler = new TestScheduler((actual, expected) => {
	expect(actual).toEqual(expected);
});

testScheduler.run(({ cold, expectObservable }) => {
	const source$ = cold('-a--b--|');
	expectObservable(source$.pipe(delay(20))).toBe('---a--b--|');
});
```

---

## `queueScheduler` — Recursive Safety

- Prevents **stack overflows** by queuing recursive calls synchronously
- Essential when using `expand` for deep recursion

```typescript
source$.pipe(
	expand(v => v > 0
		? of(v - 1).pipe(observeOn(queueScheduler))
		: EMPTY)
).subscribe(console.log);
```

---

## `asapScheduler` — Microtask Queue

- Runs after current sync code but **before the next macrotask**
- Useful for batching changes that happen in the same tick while staying async

```typescript
changes$.pipe(
	observeOn(asapScheduler),
	bufferWhen(() => asap$)
).subscribe(batchRender);
```

---

## Zalgo — The Synchronous-Sometimes Anti-pattern

**Zalgo**: an API that fires sometimes sync, sometimes async — ordering becomes non-deterministic.

```typescript
// Bad — sync on cache hit, async on miss
function getUser(id: string): Observable<User> {
	if (cache.has(id)) return of(cache.get(id)!); // sync
	return http.get<User>(`/users/${id}`);         // async
}
```

**Fix** — `observeOn(asapScheduler)` normalises to always-async:

```typescript
if (cache.has(id)) {
	return of(cache.get(id)!).pipe(observeOn(asapScheduler));
}
```

- Rule: any Observable factory should be **consistently sync or consistently async**

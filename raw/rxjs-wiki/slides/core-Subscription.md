---
marp: true
theme: uncover
title: "Subscription"
---

# Subscription

> The handle returned by `subscribe()` — represents the ongoing execution of an Observable and provides a way to cancel it.

---

## Interface

- Returned by every `subscribe()` call
- `unsubscribe()` cancels the execution and triggers teardown
- `closed` flag indicates whether it has been cancelled
- `add()` groups child subscriptions for bulk cancellation

```typescript
interface Subscription {
	unsubscribe(): void;
	closed: boolean;
	add(teardown: TeardownLogic): void;
	remove(teardown: Subscription): void;
}
```

---

## Basic Usage

```typescript
const sub = interval(1000).subscribe(console.log);

// Later — cancel the subscription
sub.unsubscribe();

// Check if closed
console.log(sub.closed); // true after unsubscribe
```

---

## Composite Subscriptions

- Group multiple subscriptions into one parent `Subscription`
- A single `unsubscribe()` cancels **all children at once**
- Ideal for component lifecycle cleanup

```typescript
const sub = new Subscription();

sub.add(timer1$.subscribe(...));
sub.add(timer2$.subscribe(...));
sub.add(stream3$.subscribe(...));

// Cancels all three at once
sub.unsubscribe();
```

---

## Teardown Logic

- Manual Observables return a **teardown function** to clean up resources
- Teardown runs on: `unsubscribe()`, `complete`, or `error`
- Used to clear intervals, abort requests, release event listeners

```typescript
const timer$ = new Observable<number>(observer => {
	let count = 0;
	const id = setInterval(() => observer.next(count++), 1000);

	// Teardown: runs on unsubscribe or complete/error
	return () => clearInterval(id);
});
```

---

## Preventing Memory Leaks

Not unsubscribing from long-lived Observables is the **#1 source of memory leaks** in RxJS.

**Strategy 1 — `takeUntil`** (component destroy pattern):
```typescript
const destroy$ = new Subject<void>();

interval(1000).pipe(
	takeUntil(destroy$)
).subscribe(console.log);

destroy$.next(); // on destroy
destroy$.complete();
```

**Strategy 2 — `take(1)`** (single value):
```typescript
source$.pipe(take(1)).subscribe(console.log);
```

**Strategy 3 — composite Subscription**: `new Subscription()` + `add()` + single `unsubscribe()`

---

## Subscription vs Promise

- Unlike a Promise, a Subscription can be **cancelled** at any time
- Calling `unsubscribe()` invokes the Observable's teardown logic
- Pending work is stopped — e.g. HTTP requests can be aborted when using `ajax` from RxJS
- A Promise always resolves or rejects; there is **no cancellation mechanism**

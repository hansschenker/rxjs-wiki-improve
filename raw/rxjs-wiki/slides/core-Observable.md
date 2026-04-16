---
marp: true
theme: uncover
title: "Observable"
---

# Observable

> The fundamental building block of RxJS — a lazy push-based collection that can emit zero or more values synchronously or asynchronously.

---

## Overview

- **Lazy** — nothing happens until `subscribe()`
- Emits **multiple values** over time (unlike a Promise's single value)
- **Cancellable** — unsubscribe at any time to stop execution
- Can be **synchronous** (e.g. `of(1, 2, 3)`) or asynchronous

---

## The Mathematical Dual

- Observable is the **mathematical dual of Iterable** — Erik Meijer's core insight from Rx.NET
- Any LINQ/array operator (`map`, `filter`, `reduce`) can be mechanically derived for Observable
- The 100+ RxJS operators follow from this mathematics

```
IEnumerable<T>  (pull)  dual  IObservable<T>  (push)
MoveNext()              dual  OnNext(value)
return (done)           dual  OnCompleted()
throw (error)           dual  OnError(err)
```

---

## Formal Model — Timed Sequence of Pairs

- A lazy, potentially infinite sequence of timed `(T, value)` pairs
- **Time is part of the data model** — values have timestamps, not just order
- The sequence doesn't exist until subscribed — only then does time start flowing

```typescript
// Conceptual type (not actual RxJS)
type Stream<A> = [(time: number, value: A), ...]
```

---

## Contract

The Observable contract — must be honoured by every Observable:
- May call `next` **zero or more times**
- After `error` or `complete`, **no further methods** may be called
- After `unsubscribe`, **no methods** may be called

```
next* (error | complete)?
```

---

## Creation

```typescript
// Manual creation
const manual$ = new Observable<number>(subscriber => {
	subscriber.next(1);
	subscriber.complete();
	return () => console.log('torn down');
});

// Factory creators
of(1, 2, 3)               // synchronous values
from([1, 2, 3])           // iterable / Promise / Observable
fromEvent(btn, 'click')   // DOM events (HOT)
interval(1000)            // 0,1,2... every 1s
// ...
```

---

## Subscribing

```typescript
// Full observer
const sub = source$.subscribe({
	next: value => console.log(value),
	error: err => console.error(err),
	complete: () => console.log('done'),
});

// Shorthand (next only)
source$.subscribe(value => console.log(value));

// Unsubscribe to prevent leaks
sub.unsubscribe();
```

---

## pipe() — Operator Composition

- Each operator is a pure function `Observable<T> → Observable<R>`
- `pipe()` composes left-to-right — source is never mutated
- Returns a new Observable; lazy until subscribed

```typescript
source$.pipe(
	filter(x => x > 0),
	map(x => x * 2),
	take(5)
).subscribe(console.log);
```

---

## Cold vs Hot

| | Cold | Hot |
|--|------|-----|
| Source starts | On subscribe | Independent of subscribers |
| Multiple subs | Each gets own execution | Share the same execution |

```typescript
const cold$ = interval(1000);              // each sub gets 0,1,2...
const hot$ = fromEvent(document, 'click'); // shared click events
const shared$ = cold$.pipe(share());       // cold → hot
```

---

## Marble Diagram Notation

```
-  = time passing (10ms frame)
a  = value emitted
|  = complete
#  = error
```

```
source:  -a--b--c--|
result:  -A--B--C--|   (after map(toUpperCase))
```

---

## Internals

- Observable is a **function wrapped in an object** — `subscribeFn` is the whole story
- Every `subscribe()` call runs `subscribeFn` fresh — that's what makes Observables cold

```typescript
class Observable<T> {
	constructor(private subscribeFn: (observer: Observer<T>) => TeardownLogic) {}

	subscribe(observer: Observer<T>): Subscription {
		const teardown = this.subscribeFn(observer);
		return new Subscription(teardown);
	}
}
```

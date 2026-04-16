---
marp: true
theme: uncover
title: "Observer"
---

# Observer

> The consumer of an Observable — an object with `next`, `error`, and `complete` callbacks that receives pushed values.

---

## Interface

- Three callbacks: `next(value)`, `error(err)`, `complete()`
- All three are optional in practice — a `PartialObserver`
- Missing methods are filled with no-ops by `SafeSubscriber`

```typescript
interface Observer<T> {
	next: (value: T) => void;
	error: (err: unknown) => void;
	complete: () => void;
}
```

---

## Usage

```typescript
// Full observer
const observer: Observer<number> = {
	next: value => console.log('Value:', value),
	error: err => console.error('Error:', err),
	complete: () => console.log('Completed'),
};
source$.subscribe(observer);

// Shorthand — next only
source$.subscribe(value => console.log(value));

// Partial — complete omitted (treated as no-op)
source$.subscribe({ next: value => console.log(value) });
```

---

## Observer Guarantees (SafeSubscriber)

RxJS wraps every observer in a `SafeSubscriber` that enforces the contract:

- After `complete()` or `error()`, **no further methods** are called
- After `unsubscribe()`, **no further methods** are called
- Synchronous errors thrown inside `next` are **forwarded to `error`**
- You never need to guard against out-of-order calls in your callbacks

---

## The Observer–Observable Relationship

- Observable is the **producer**; Observer is the **consumer**
- `subscribe(observer)` wires them together and returns a `Subscription`
- Observable calls Observer's methods per the contract: `next*` then optionally `error` or `complete`

```
Observable  ──push──►  Observer
  (source)             (consumer)

Observable.subscribe(observer) returns Subscription
```

---

## Subject as Observer

- A `Subject` implements `next`, `error`, and `complete` — it **is** an Observer
- This makes Subjects useful as **bridges**: receive from upstream, emit to downstream

```typescript
const proxy$ = new Subject<number>();

// Subject as observer — receives from upstream
upstream$.subscribe(proxy$);

// Subject as observable — emits to downstream
proxy$.subscribe(console.log);
```

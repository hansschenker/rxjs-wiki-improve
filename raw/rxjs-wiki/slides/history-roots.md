---
marp: true
theme: uncover
title: "The Roots of RxJS"
---

# The Roots of RxJS

> RxJS descends from Reactive Extensions for .NET, created by Erik Meijer at Microsoft Research in 2009 — a library built from a single mathematical insight: the observable is the dual of the iterable.

---

## The Raven Test — Finding the Missing Shape

- Erik Meijer's method: find the *commonality* between things (Raven IQ-style puzzle)
- **Pull collections** (arrays, lists) — unified by `IEnumerable<T>` + LINQ
- **Push collections** (events, async data) — no unified interface existed
- The missing shape in the grid: an interface for push streams = `IObservable<T>`

---

## The Mathematical Dual — IEnumerable ↔ IObservable

```
Pull (synchronous)            Push (asynchronous)
─────────────────             ─────────────────────
IEnumerable<T>       dual     IObservable<T>
IEnumerator<T>       dual     IObserver<T>
MoveNext() / Current dual     OnNext(T value)
return (completed)   dual     OnCompleted()
throw (error)        dual     OnError(Exception)
```

- Every LINQ operator (`map`, `filter`, `groupBy`) is mechanically derivable via duality
- The operator set was **not invented** — it followed from the mathematics
- Three channels (`next`/`error`/`complete`) = minimal push-dual of `IEnumerator`

---

## Rx.NET — Created at Microsoft Research (2009)

- Built by Erik Meijer + Bart de Smet at **Microsoft Research**
- Original goal: unify UI events and async cloud calls under one model

```typescript
// Erik's original motivating example
keystrokes$.pipe(
  debounceTime(300),       // don't send every keystroke
  switchMap(q => search(q).pipe(
    timeout(1000),         // cancel if server is slow
    catchError(() => of([]))
  ))
);
```

- Debounce + cancel-previous + timeout emerge naturally from operator composition

---

## Power Through Simplicity

- Removing `array[i]` random access seems like a restriction — it is actually power
- No indexing → **parallel execution**: `map` functions can run in any order
- No indexing → **distributed computing**: sequential push works across cluster nodes
- No indexing → **lazy evaluation**: elements only exist when the stream fires
- The random number generator: no backing array, zero memory footprint

> "By limiting ourselves to a simpler interface, we get more power."
> — Erik Meijer

---

## The Philosophy: Focus on the Present

- Stream programming requires a single mental stance: **focus on now**
- No past, no future — only the current element
- Mouse position, stock price, baby's cry — all push streams, all "present only"
- `IObservable` enforces this by design: no indexing, no history access
- Buffering operators (`bufferTime`, `window`) exist *when* you need the past — opt-in

---

## The Two Kinds of Streams

| Kind | Metaphor | Interface | Driven by |
|------|----------|-----------|-----------|
| Pull | Pump jack — flows only when you pump | `IEnumerable` | Consumer |
| Push | Baby — cries whether you want it or not | `IObservable` | Producer |

- Push streams fire whether the consumer is ready or not
- This is why `debounceTime`, `throttleTime`, `bufferTime` exist: managing producer/consumer speed mismatch

---

## Port to JavaScript — RxJS 1.x (2012)

- **Matthew Podwysocki** + **Bart de Smet** created the first JS port in 2012
- Closely mirrored Rx.NET API under `Rx.Observable` global namespace
- JavaScript has *more* push sources than .NET: every DOM event, timer, XHR is a stream
- The mathematical model translated directly — no adaptation needed

---

## From Rx.NET to the JS Ecosystem

| Year | Event |
|------|-------|
| 2009 | Erik Meijer creates Rx.NET at Microsoft Research |
| 2012 | First RxJS port (Matthew Podwysocki) |
| 2014–2016 | Angular 2 adopts RxJS — drives mass adoption |
| 2016 | RxJS 5 — full rewrite by Ben Lesh for performance |
| 2018 | RxJS 6 — `pipe()` revolution, tree-shakeable operators |
| 2021 | RxJS 7 — TypeScript rewrite (Nicholas Jamieson) |

---

## What the Roots Explain

| Design choice | Rooted in |
|--------------|-----------|
| Three-channel contract (`next`/`error`/`complete`) | Mathematical dual of `IEnumerator` |
| Operators work on any Observable | LINQ derivation from the dual |
| No built-in indexing | Enables parallelism and lazy evaluation |
| `pipe()` composition | Functions-as-values, algebraic composition |
| Observable is lazy (cold by default) | Values only exist when subscribed |

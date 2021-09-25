---
layout: post
title: "JavaScript object keys ordering"
date: 2021-09-25 07:00
comments: true
---

I remember hearing about how ES6 defined made object key order a part of the
spec several years ago. Maybe from [this article](https://2ality.com/2015/10/property-traversal-order-es6.html).
I didn't give it a lot of thought, because why would you ever rely
on order of keys in an object? Why not use a different data structure?
Well...because. Don't judge me.

So here's what we're talking about. The keys from a function like `Object.keys`
return them in the same order as they were added.

``` javascript
Object.keys({
  'foo': null,
  'bar': null,
  'baz': null,
}).map(JSON.stringify);

// [ '"foo"', '"bar"', '"baz"' ]
```

So far, so good. That's about as far as my knowledge of it went. If I would have
continued to read that article or the spec I would have found out about the
actual rules, and more specifically, about integer keys. The rules are...

1. First, the keys that are integer indices, in ascending numeric order.
1. Then, all other string keys, in the order in which they were added to the object.
1. Lastly, all symbol keys, in the order in which they were added to the object.

Let's see that in action. Note that integer key means a `Number`
integer *or* a `String` integer and keys are always returned as `String`s.

``` javascript
Object.keys({
  3: null,
  '1': null,
  2: null
}).map(JSON.stringify);

// [ '"1"', '"2"', '"3"' ]
```

We're passing `3, '1', 2` in and getting `"1", "2", "3"` out.

Rule number 1 is where I recently got bit by this. My task was to take a group
of numbers and group them into the range defined by the keys of an object...i.e.
make a bar chart.

Normally that object would like...

``` javascript
Object.keys({
  '1': 'green',
  '2': 'red',
  '3': 'blue',
});

// [ '1', '2', '3' ]
```

So I would get the keys from this object, loop through them placing the
data points in the right bucket. The implementation of that isn't important,
just note that it relied on the keys being in numerical order.

They could also be decimal numbers like...

``` javascript
Object.keys({
  '1.5': 'green',
  '2.2': 'red',
  '3.9': 'blue',
});

// [ '1.5', '2.2', '3.9' ]
```

That also worked because the source data that the object was being built from
was already sorted.

Can you guess where the bug is introduced?

Answer: mixed integers and decimals...

``` javascript
Object.keys({
  '1': 'green',
  '2.2': 'red',
  '3': 'blue',
});

// [ '1', '3', '2.2' ]
```

<figure>
  <a href="https://sadtrombone.com/"><img src="/images/sadtrombone.png"></a>
  <figcaption>&nbsp;</figcaption>
</figure>


Funny how the computers always do what they were told to do. The 🔨 was to
explicitly sort the keys before using them to group the data points.

``` javascript
Object.keys({
  '1': 'green',
  '2.2': 'red',
  '3': 'blue',
}).sort((a, b) => Number(a) - Number(b));

// [ '1', '2.2', '3' ]
```


# quick-avl

A Typescript implementation of an AVL tree, which is a self-balancing binary search tree.

Implements the Map interface.

Named after the inventors [Adelson-Velsky and Landis](https://en.wikipedia.org/wiki/AVL_tree), an AVL tree enforces an invariant where the heights of the subtrees of a node differ by at most one. Rebalancing is performed after each insert or remove operation, if that operation made the tree imbalanced.

## Installation

```
npm install quick-avl
```

## Performance

The main reason of using an AVL tree is performance. Because of its self-balancing property, worst case lookup is _O(log(n))_, compared to the plain binary search trees where this is _O(n)_.

| Operation | Average time complexity | Worst case complexity |
| --------- | ----------------------- | --------------------- |
| find      | _O(log n)_              | _O(log n)_            |
| insert    | _O(log n)_              | _O(log n)_            |
| remove    | _O(log n)_              | _O(log n)_            |
| traversal | _O(n)_                  | _O(n)_                |

## Usage

This AVL tree implementation acts like a map to store key-value pairs in.

```typescript
import { AvlTree } from 'quick-avl';

const users = new AvlTree<number, string>();

users.set(100, 'Bob').set(200, 'Carol').set(0, 'Alice');

users.get(100); // --> 'Bob'
users.has(100); // --> true

users.delete(200); // --> true

users.valueList(); // --> ['Alice', 'Carol']

for (const [key, value] of users) {
  console.log(`Key: ${key}, value: ${value}`);
}
```

## Why another AVL library

While there are some excellent AVL libraries available within NPM, these libraries swap out tree node values while performing tree balancing. I required an AVL library that does not replace keys or values within a node. That way, a reference to a tree node will always keep the same value.

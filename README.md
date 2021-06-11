# quick-avl

A Typescript implementation of an AVL tree, which is a self-balancing binary search tree.

Named after the inventors [Adelson-Velsky and Landis](https://en.wikipedia.org/wiki/AVL_tree), an AVL tree enforces an invariant where the heights of the subtrees of a node differ by at most one. Rebalancing is performed after each insert or remove operation, if that operation made the tree imbalanced.

## Performance

The main reason of using an AVL tree is performance. Because of its self-balancing property, worst case lookup is _O(log(n))_, compared to the plain binary search trees where this is _O(n)_.

| Operation | Average time complexity | Worst case complexity |
| --------- | ----------------------- | --------------------- |
| find      | _O(log n)_              | _O(log n)_            |
| insert    | _O(log n)_              | _O(log n)_            |
| remove    | _O(log n)_              | _O(log n)_            |
| traversal | _O(n)_                  | _O(n)_                |

## Installation

```
npm install quick-avl
```

## Usage

This AVL tree implementation acts like a map to store key-value pairs in.

```typescript
import { AvlTree } from 'quick-avl';

const users = new AvlTree<number, string>();

users.insert(100, 'Bob'); // --> AvlTreeNode
users.insert(200, 'Carol'); // --> AvlTreeNode
users.insert(0, 'Alice'); // --> AvlTreeNode

users.find(100); // --> 'Bob'
users.contains(100); // --> true

users.remove(200); // --> true

users.values(); // --> ['Alice', 'Carol']

for (const node of users) {
  console.log(`Key: ${node.key}, value: ${node.value}`);
}
```

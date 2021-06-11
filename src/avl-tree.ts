import { AvlTreeNode } from './avl-tree-node';
import {
    disconnectChildNodeFromParent,
    nodeToJson,
    printTreeNode,
    replaceChild,
    replaceNode,
    rotateLeft,
    rotateRight
} from './avl-tree-utils';

export class AvlTree<K = any, V = any> {
    private _root?: AvlTreeNode<K, V>;
    private _size = 0;

    constructor(private compareFunction: CompareFunction<K> = defaultCompareFunction) {}

    get size(): number {
        return this._size;
    }

    get root(): AvlTreeNode<K, V> | undefined {
        return this._root;
    }

    toJSON(): AvlTreeNode<K, V> | undefined {
        return this._root && nodeToJson(this._root);
    }

    contains(key: K): boolean {
        return !!this.findNode(key);
    }

    findNode(key: K): AvlTreeNode<K, V> | undefined {
        let current: AvlTreeNode<K, V> | undefined = this._root;
        while (current) {
            const cmp = this.compareFunction(key, current.key);
            if (cmp < 0) {
                current = current.left;
            } else if (cmp > 0) {
                current = current.right;
            } else {
                // Key found!
                break;
            }
        }
        return current;
    }

    find(key: K): V | undefined {
        return this.findNode(key)?.value;
    }

    /**
     * Inserts a key-value pair into the AVL tree.
     * @param key The key used to determine the order in the tree
     * @param value The value attached to the key
     * @returns The tree node if inserted, undefined if not. The latter happens when
     *  a key already exists in the tree.
     */
    insert(key: K, value: V): AvlTreeNode<K, V> | undefined {
        // Shortcut for root
        if (!this._root) {
            this._root = {
                key,
                value,
                balanceFactor: 0
            };
            this._size += 1;
            return this._root;
        }

        let current: AvlTreeNode<K, V> | undefined = this._root;
        let parent: AvlTreeNode<K, V> | undefined;

        // Latest key-node comparison result
        let cmp = 0;

        // Travel downwards to find the insertion spot
        while (current) {
            cmp = this.compareFunction(key, current.key);
            parent = current;
            if (cmp < 0) {
                current = current.left;
            } else if (cmp > 0) {
                current = current.right;
            } else {
                // Key already present, cannot add
                return undefined;
            }
        }

        /* istanbul ignore next */
        if (!parent) {
            throw new Error('Invariant failed: no parent node found');
        }

        const newNode: AvlTreeNode<K, V> = {
            key,
            value,
            parent,
            balanceFactor: 0
        };

        if (cmp < 0) {
            parent.left = newNode;
        } else {
            parent.right = newNode;
        }
        this._size += 1;

        this.rebalanceAfterInsertion(newNode);

        return newNode;
    }

    /**
     * Removes a key-value pair from this tree.
     * @param key The key to search for
     * @returns True if the item was found and removed, false otherwise.
     */
    remove(key: K): boolean {
        const node = this.findNode(key);
        if (!node) {
            return false;
        }

        let rebalanceStartNode: AvlTreeNode<K, V> | undefined;
        let removedNodeWasOnLeft: boolean;

        if (!node.left && !node.right) {
            // Leaf node removal is simple
            rebalanceStartNode = node.parent;
            removedNodeWasOnLeft = node.parent?.left === node;
            if (node === this._root) {
                this._root = undefined;
            } else {
                disconnectChildNodeFromParent(node);
            }
        } else if (node.left && node.right) {
            if (node.balanceFactor <= 0) {
                // Left heavy case:
                // - Take predecessor of removed node
                // - Replace predecessor with its left child
                // - Replace node with predecessor

                let predecessor = node.left;

                while (predecessor.right) {
                    predecessor = predecessor.right;
                }

                const predecessorLeft = predecessor.left;

                if (predecessorLeft) {
                    // Predecessor has only left node
                    // console.log(`Replacing predecessor ${predecessor.key} with its left child: ${predecessorLeft.key}`);

                    replaceChild(predecessor, predecessorLeft);

                    /* istanbul ignore next */
                    if (!predecessorLeft.parent) {
                        throw new Error(
                            `Invariant failed: predecessor's left child ${predecessorLeft.key} has no parent`
                        );
                    }

                    // console.log('predecessorLeft', predecessorLeft);

                    replaceNode(node, predecessor);
                    removedNodeWasOnLeft = predecessorLeft.parent.left === predecessorLeft;
                    rebalanceStartNode = predecessorLeft.parent;
                } else {
                    // Predecessor has no child nodes
                    if (predecessor.parent === node) {
                        rebalanceStartNode = predecessor;
                        removedNodeWasOnLeft = predecessor.parent.left === predecessor;
                    } else {
                        rebalanceStartNode = predecessor.parent;
                        removedNodeWasOnLeft = false;
                    }

                    // console.log(
                    //     `Predecessor ${predecessor.key} has no left child, taking parent ${rebalanceStartNode?.key} as rebalance start`
                    // );

                    replaceNode(node, predecessor);
                }

                if (node === this._root) {
                    // console.log(`Setting new root: ${predecessor.key}`);
                    this._root = predecessor;
                }
            } else {
                // Right heavy case:
                // - Take successor of removed node
                // - Replace successor with its right child
                // - Replace node with successor
                let successor = node.right;

                while (successor.left) {
                    successor = successor.left;
                }

                const successorRight = successor.right;

                if (successorRight) {
                    // console.log(`Replacing successor ${successor.key} with its right child: ${successorRight.key}`);
                    replaceChild(successor, successorRight);

                    /* istanbul ignore next */
                    if (!successorRight.parent) {
                        throw new Error(
                            `Invariant failed: successor's right child ${successorRight.key} has no parent`
                        );
                    }

                    replaceNode(node, successor);
                    removedNodeWasOnLeft = successorRight.parent.left === successorRight;
                    rebalanceStartNode = successorRight.parent;
                } else {
                    // Successor has no child nodes
                    rebalanceStartNode = successor.parent === node ? successor : successor.parent;
                    removedNodeWasOnLeft = true;
                    replaceNode(node, successor);
                }

                if (node === this._root) {
                    // console.log(`Setting new root: ${successor.key}`);
                    this._root = successor;
                }
            }
        } else if (node.left) {
            // Only left node is present
            const leftChild = node.left;
            removedNodeWasOnLeft = node.parent?.left === node;
            replaceChild(node, leftChild);
            rebalanceStartNode = leftChild.parent;

            if (node === this._root) {
                this._root = leftChild;
            }
        } else if (node.right) {
            // Only right node is present
            const rightChild = node.right;
            removedNodeWasOnLeft = node.parent?.left === node;
            replaceChild(node, rightChild);
            rebalanceStartNode = rightChild.parent;

            if (node === this._root) {
                this._root = rightChild;
            }
        } else {
            /* istanbul ignore next */
            throw new Error('Invariant failed; left/right child check inconsistent');
        }
        this._size -= 1;

        if (rebalanceStartNode) {
            this.rebalanceAfterDeletion(rebalanceStartNode, removedNodeWasOnLeft);
        }

        return true;
    }

    toString(): string {
        return printTreeNode(this._root);
    }

    /* istanbul ignore next */
    print(): void {
        console.log(this.toString());
    }

    keys(): K[] {
        const results: K[] = [];
        for (const node of this) {
            results.push(node.key);
        }
        return results;
    }

    values(): V[] {
        const results: V[] = [];
        for (const node of this) {
            results.push(node.value);
        }
        return results;
    }

    forEach(fn: (node: AvlTreeNode<K, V>, index: number) => void): void {
        let index = 0;
        for (const node of this) {
            fn(node, index);
            index += 1;
        }
    }

    map<T>(fn: (node: AvlTreeNode<K, V>, index: number) => T): T[] {
        const results: T[] = [];
        let index = 0;
        for (const node of this) {
            results.push(fn(node, index));
            index += 1;
        }
        return results;
    }

    entries(): [K, V][] {
        const results: [K, V][] = [];
        for (const node of this) {
            results.push([node.key, node.value]);
        }
        return results;
    }

    minKey(): K | undefined {
        return this.minNode()?.key;
    }

    minValue(): V | undefined {
        return this.minNode()?.value;
    }

    minNode(): AvlTreeNode<K, V> | undefined {
        let current: AvlTreeNode<K, V> | undefined = this._root;
        if (!current) {
            return undefined;
        }

        while (current.left) {
            current = current.left;
        }
        return current;
    }

    maxKey(): K | undefined {
        return this.maxNode()?.key;
    }

    maxValue(): V | undefined {
        return this.maxNode()?.value;
    }

    maxNode(): AvlTreeNode<K, V> | undefined {
        let current: AvlTreeNode<K, V> | undefined = this._root;
        if (!current) {
            return undefined;
        }

        while (current.right) {
            current = current.right;
        }
        return current;
    }

    at(index: number): AvlTreeNode<K, V> | undefined {
        if (index < 0 || index >= this._size) {
            throw new Error(`Index out of bounds: ${index}`);
        }
        let selected: AvlTreeNode<K, V> | undefined;
        this.walk((node, i, done) => {
            if (index === i) {
                selected = node;
                done();
            }
        });
        return selected;
    }

    walk(fn: (node: AvlTreeNode<K, V>, index: number, done: () => void) => void): void {
        let i = 0;
        let isDone = false;
        for (const n of this) {
            fn(n, i, () => (isDone = true));
            i += 1;
            if (isDone) {
                break;
            }
        }
    }

    predecessor(node: AvlTreeNode<K, V>): AvlTreeNode<K, V> | undefined {
        if (node.left) {
            // Find rightmost child
            let current = node.left;
            while (current.right) {
                current = current.right;
            }
            return current;
        }

        let child: AvlTreeNode<K, V> = node;
        let parent = node.parent;

        // Travel up until the current node is no longer the left child of its parent
        while (parent?.left === child) {
            child = parent;
            parent = child.parent;
        }

        return parent;
    }

    successor(node: AvlTreeNode<K, V>): AvlTreeNode<K, V> | undefined {
        if (node.right) {
            // Find leftmost child
            let current = node.right;
            while (current.left) {
                current = current.left;
            }
            return current;
        }

        let child: AvlTreeNode<K, V> = node;
        let parent = node.parent;

        // Travel up until the current node is no longer the right child of its parent
        while (parent?.right === child) {
            child = parent;
            parent = child.parent;
        }

        return parent;
    }

    /**
     * Returns an iterator for the nodes.
     * Usable with the 'for ... of' syntax.
     */
    *[Symbol.iterator](): Generator<AvlTreeNode<K, V>> {
        const stack: AvlTreeNode<K, V>[] = [];

        let current: AvlTreeNode<K, V> | undefined = this._root;
        let done = false;
        while (!done) {
            if (current) {
                stack.push(current);
                current = current.left;
            } else if (stack.length > 0) {
                current = stack.pop() as AvlTreeNode<K, V>;
                yield current;
                current = current.right;
            } else {
                done = true;
            }
        }
    }

    private rebalanceAfterInsertion(child: AvlTreeNode<K, V>): void {
        let parent = child.parent;

        /* istanbul ignore next */
        if (!parent) {
            throw new Error(`Invariant failed: child ${child.key} inserted without parent`);
        }

        // Travel up through the tree to update balance factors and apply rotations
        while (parent) {
            if (parent.left === child) {
                parent.balanceFactor -= 1;
            } else if (parent.right === child) {
                parent.balanceFactor += 1;
            } else {
                /* istanbul ignore next */
                throw new Error(`Invariant failed: node ${child.key} is not a child of ${parent.key}`);
            }

            if (parent.balanceFactor === 0) {
                break;
            }
            if (parent.balanceFactor < -1) {
                // Parent node is left-heavy

                // If its left child is right-heavy, rotate that child to the left first
                if (parent.left && parent.left.balanceFactor > 0) {
                    rotateLeft(parent.left);
                }

                // Parent is still left-heavy, rotate right around parent
                const newParent: AvlTreeNode<K, V> = rotateRight(parent);

                // Replace root if necessary
                if (parent === this._root) {
                    this._root = newParent;
                }
                break;
            }
            if (parent.balanceFactor > 1) {
                // Parent node is right-heavy

                // If its right child is left-heavy, rotate the child to the right first
                if (parent.right && parent.right.balanceFactor < 0) {
                    rotateRight(parent.right);
                }

                // Parent is still right-heavy, rotate left around parent
                const newParent: AvlTreeNode<K, V> = rotateLeft(parent);

                // Replace root if necessary
                if (parent === this._root) {
                    this._root = newParent;
                }
                break;
            }
            child = parent;
            parent = parent.parent;
        }
    }

    /**
     * Rebalances a tree from a node upwards after a deletion
     * @param key The key to determine the deleted node
     * @param node The node to start rebalancing with
     */
    private rebalanceAfterDeletion(node: AvlTreeNode<K, V>, removedChildWasOnLeft: boolean): void {
        let parent: AvlTreeNode<K, V> | undefined = node;
        let child: AvlTreeNode<K, V> | undefined;

        // console.log(
        //     `Rebalance from ${removedChildWasOnLeft ? 'left' : 'right'} removal from start node: ${parent?.key} -> ${
        //         parent?.parent?.key
        //     } -> ${parent?.parent?.parent?.key}`
        // );

        while (parent) {
            const wasRemovedFromLeft = child ? parent.left === child : removedChildWasOnLeft;
            const wasRemovedFromRight = child ? parent.right === child : !removedChildWasOnLeft;
            if (wasRemovedFromLeft) {
                // Left child got removed, balance goes to the right
                parent.balanceFactor += 1;
                // console.log(`Updating balance factor of ${parent.key} with +1 to ${parent.balanceFactor}`);
            } else if (wasRemovedFromRight) {
                // Right child got removed, balance goes to the left
                parent.balanceFactor -= 1;
                // console.log(`Updating balance factor of ${parent.key} with -1 to ${parent.balanceFactor}`);
            } else {
                /* istanbul ignore next */
                throw new Error(`Invariant failed: removed key found: ${parent.key}`);
            }
            if (parent.balanceFactor < -1) {
                // Parent node is left-heavy

                // If its left child is right-heavy, rotate that child to the left first
                if (parent.left && parent.left.balanceFactor > 0) {
                    rotateLeft(parent.left);
                }

                // Parent is still left-heavy, rotate right around parent
                const newParent: AvlTreeNode<K, V> = rotateRight(parent);

                // Replace root if necessary
                if (parent === this._root) {
                    this._root = newParent;
                }
                parent = newParent;
            } else if (parent.balanceFactor > 1) {
                // Parent node is right-heavy

                // If its right child is left-heavy, rotate the child to the right first
                if (parent.right && parent.right.balanceFactor < 0) {
                    rotateRight(parent.right);
                }

                // Parent is still right-heavy, rotate left around parent
                const newParent: AvlTreeNode<K, V> = rotateLeft(parent);

                // Replace root if necessary
                if (parent === this._root) {
                    this._root = newParent;
                }

                parent = newParent;
            }

            if (parent.balanceFactor === 1 || parent.balanceFactor === -1) {
                break;
            }

            // Go up along the tree
            child = parent;
            parent = parent.parent;
        }
    }
}

export type CompareFunction<K> = (left: K, right: K) => number;

function defaultCompareFunction<K>(a: K, b: K): number {
    if (a < b) {
        return -1;
    } else if (a > b) {
        return 1;
    } else {
        return 0;
    }
}

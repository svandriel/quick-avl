import { AvlTreeNode } from './avl-tree-node';

/**
 * Rotates left around a root node
 * @param root The root node
 * @returns The new root node
 *
 *         100    Rotate left     150
 *       /     \                /     \
 *     50      150   ====>    100      175
 *    /  \    /   \          /  \
 *  25   75  125  175      50    125
 *                        /  \
 *                       25  75
 *
 * In above picture, 100 is the root, and 150 is the new root
 */
export function rotateLeft<K, V>(root: AvlTreeNode<K, V>): AvlTreeNode<K, V> {
    const { right: newRoot } = root;
    if (!newRoot) {
        throw new Error('Cannot rotate left without a right child');
    }

    // Parent of old root needs to link to new root
    replaceChild(root, newRoot);

    // Old root gets new right node: the left child of the new root
    root.right = newRoot.left;
    if (newRoot.left) {
        newRoot.left.parent = root;
    }

    // Make the old root the left child of the new root
    newRoot.left = root;
    root.parent = newRoot;

    // Old root's balance factor decreases by 1
    root.balanceFactor -= 1;

    // If the new root was right-heavy, decrease the old root's
    // balance factor because the new root is no longer under the old root
    if (newRoot.balanceFactor > 0) {
        root.balanceFactor -= newRoot.balanceFactor;
    }

    // New root also decreases by 1
    newRoot.balanceFactor -= 1;

    // If the old root is now left-heavy, decrease the new root's
    // balance factor because the new root now has the old root
    // as it's left child
    if (root.balanceFactor < 0) {
        newRoot.balanceFactor += root.balanceFactor;
    }

    return newRoot;
}

/**
 * Rotates right around a root node
 * @param root The root node
 * @returns The new root node
 *
 *        100       Rotate right    50
 *      /     \                   /     \
 *    50      150      ====>    25      100
 *   /  \    /   \                     /   \
 * 25   75  125  175                  75   150
 *                                        /   \
 *                                       125  175
 *
 * In above picture, 100 is the root, and 50 is the new root
 */
export function rotateRight<K, V>(root: AvlTreeNode<K, V>): AvlTreeNode<K, V> {
    const { left: newRoot } = root;
    if (!newRoot) {
        throw new Error('Cannot rotate right without a left child');
    }

    // Parent of old root needs to link to new root
    replaceChild(root, newRoot);

    // Old root gets new left node: the right child of the new root
    root.left = newRoot.right;
    if (newRoot.right) {
        newRoot.right.parent = root;
    }

    // Make the old root the right child of the new root
    newRoot.right = root;
    root.parent = newRoot;

    // Old root's balance factor increases by 1
    root.balanceFactor += 1;

    // If the new root was left-heavy, decrease the old root's
    // balance factor because the new root is no longer under the old root
    if (newRoot.balanceFactor < 0) {
        root.balanceFactor -= newRoot.balanceFactor;
    }

    // New root also decreases by 1
    newRoot.balanceFactor += 1;

    // If the old root is now right-heavy, decrease the new root's
    // balance factor because the new root now has the old root
    // as it's left child
    if (root.balanceFactor > 0) {
        newRoot.balanceFactor += root.balanceFactor;
    }

    return newRoot;
}

/**
 * Replaces a parents' reference to a child node with another child node.
 * The old child node will be disconnected from its parent.
 * @param oldChild Old child node
 * @param newChild Replacement child node (may be undefined)
 * @returns The parent node (may be undefined)
 */
export function replaceChild<K, V>(
    oldChild: AvlTreeNode<K, V>,
    newChild: AvlTreeNode<K, V>
): AvlTreeNode<K, V> | undefined {
    // console.log(`Replacing child ${oldChild.key} with ${newChild?.key}`);
    const parent = oldChild.parent;

    if (newChild.parent) {
        disconnectChildNodeFromParent(newChild);
    }
    // console.log(`Setting parent of new child ${newChild.key} to ${parent?.key}`);
    newChild.parent = parent;

    // console.log(`Unsetting parent of old child ${oldChild.key}`);
    oldChild.parent = undefined;
    if (parent) {
        // If old child was left child, replace left with new child
        if (parent.left === oldChild) {
            // console.log(`Setting left child of parent ${parent.key} to new child ${newChild?.key}`);
            parent.left = newChild;
        } else {
            // Otherwise old child was right child, replace right
            // console.log(`Setting right child of parent ${parent.key} to new child ${newChild?.key}`);
            parent.right = newChild;
        }
    }
    return parent;
}

/**
 * Disconnects a child node from its parent
 * @param childNode The child node to remove
 * @returns The parent node from which the child was removed
 */
export function disconnectChildNodeFromParent<K, V>(childNode: AvlTreeNode<K, V>): AvlTreeNode<K, V> {
    const parent = childNode.parent;
    if (!parent) {
        throw new Error('Cannot disconnect child node because node has no parent');
    }
    // console.log(`Disconnecting childNode ${childNode.key} from parent ${parent.key}`);

    // If old child was left child, replace left with new child

    if (parent.left === childNode) {
        // console.log(`Unsetting left child of child node ${childNode.key}'s parent ${parent.key}`);
        parent.left = undefined;
    } /* istanbul ignore else */ else if (parent.right === childNode) {
        // Otherwise old child was right child, replace right
        // console.log(`Unsetting right child of child node ${childNode.key}'s parent ${parent.key}`);
        parent.right = undefined;
    } else {
        throw new Error(`Invariant failed: node ${childNode.key} is not a child of ${childNode.parent?.key}`);
    }
    childNode.parent = undefined;
    return parent;
}

/**
 * Replaces a node with another replacement node.
 * The replacement node will first be completely unhooked from
 * its parent and children, then moved into the place of the old node.
 *
 * After the replacement node has been substituted, the old node will
 * be completely unhooked from its parent and children.
 *
 * @param node
 * @param replacement
 */
export function replaceNode<K, V>(node: AvlTreeNode<K, V>, replacement: AvlTreeNode<K, V>): void {
    // console.log(`Replacing ${node.key} with ${replacement.key}`);

    const parent = node.parent;
    const leftChild = node.left;
    const rightChild = node.right;

    // console.log(`-> parent: ${parent?.key}`);
    // console.log(`-> leftChild: ${leftChild?.key}`);
    // console.log(`-> rightChild: ${rightChild?.key}`);

    // Unhook the replacement node
    if (replacement.parent) {
        if (replacement.parent.left === replacement) {
            replacement.parent.left = undefined;
        } /* istanbul ignore else */ else if (replacement.parent.right === replacement) {
            replacement.parent.right = undefined;
        } else {
            throw new Error(
                `Invariant failed: node ${replacement.key} has parent ${replacement.parent.key} that has no link back`
            );
        }
        replacement.parent = undefined;
    }
    if (replacement.left) {
        replacement.left.parent = undefined;
        replacement.left = undefined;
    }
    if (replacement.right) {
        replacement.right.parent = undefined;
        replacement.right = undefined;
    }

    // Replace link to parent, if any

    if (parent) {
        if (parent.left === node) {
            parent.left = replacement;
        } /* istanbul ignore else */ else if (parent.right === node) {
            parent.right = replacement;
        } else {
            throw new Error(`Invariant failed: node ${node.key} has parent ${node.parent?.key} that has no link back`);
        }
        node.parent = undefined;
        replacement.parent = parent;
    }

    // Replace link to left child, if any
    if (leftChild && leftChild !== replacement) {
        replacement.left = leftChild;
        leftChild.parent = replacement;
    }
    node.left = undefined;

    // Replace link to right child, if any
    if (rightChild && rightChild !== replacement) {
        replacement.right = rightChild;
        rightChild.parent = replacement;
    }
    node.right = undefined;

    // Copy balance factor
    replacement.balanceFactor = node.balanceFactor;
}

/**
 * Prints tree horizontally
 * @param  root
 * @param  printNode
 * @return
 */
export function printTreeNode<K, V>(
    root: AvlTreeNode<K, V> | undefined,
    printNode: (node: AvlTreeNode<K, V>) => string = nodeToString
): string {
    const out: string[] = [];
    row(root, '', true, v => out.push(v), printNode);
    return out.join('');
}

function nodeToString<K, V>(node: AvlTreeNode<K, V>): string {
    return `${node.key} [${node.balanceFactor}]`;
}

/**
 * Prints level of the tree
 * @param root
 * @param prefix
 * @param isTail
 * @param out
 * @param printNode
 */
function row<K, V>(
    root: AvlTreeNode<K, V> | undefined,
    prefix: string,
    isTail: boolean,
    out: (output: string) => void,
    printNode: (node: AvlTreeNode<K, V>) => string
): void {
    if (root) {
        out(`${prefix}${isTail ? '└── ' : '├── '}${printNode(root)}\n`);
        const indent = prefix + (isTail ? '    ' : '│   ');
        if (root.left) {
            row(root.left, indent, false, out, printNode);
        }
        if (root.right) {
            row(root.right, indent, true, out, printNode);
        }
    }
}

export function nodeToJson<K, V>(node: AvlTreeNode<K, V>): AvlTreeNode<K, V> {
    const json: AvlTreeNode<K, V> = {
        key: node.key,
        value: node.value,
        balanceFactor: node.balanceFactor
    };
    if (node.left) {
        json.left = nodeToJson(node.left);
    }
    if (node.right) {
        json.right = nodeToJson(node.right);
    }
    return json;
}

export function checkTree<K, V>(node: AvlTreeNode<K, V> | undefined): void {
    if (!node) {
        return;
    }

    // Check if all children link back to us
    /* istanbul ignore next */
    if (node.left && node.left.parent !== node) {
        throw new Error(`Node ${node.left.key} does not link back to its parent ${node.key}`);
    }
    /* istanbul ignore next */
    if (node.right && node.right.parent !== node) {
        /* istanbul ignore next */
        throw new Error(`Node ${node.right.key} does not link back to its parent ${node.key}`);
    }

    const balanceFactor = computeHeight(node.right) - computeHeight(node.left);

    /* istanbul ignore next */
    if (balanceFactor < -1 || balanceFactor > 1) {
        throw new Error(`Computed balance factor of node ${node.key} is ${balanceFactor}, which is not AVL`);
    }
    /* istanbul ignore next */
    if (balanceFactor !== node.balanceFactor) {
        throw new Error(`Balance factor of node ${node.key} is ${node.balanceFactor}, but should be ${balanceFactor}`);
    }

    checkTree(node.left);
    checkTree(node.right);
}

export function computeHeight<K, V>(node: AvlTreeNode<K, V> | undefined): number {
    if (!node) {
        return 0;
    }
    const leftHeight = node.left ? computeHeight(node.left) : 0;
    const rightHeight = node.right ? computeHeight(node.right) : 0;
    return Math.max(leftHeight, rightHeight) + 1;
}

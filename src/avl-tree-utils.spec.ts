import { AvlTreeNode } from './avl-tree-node';
import { disconnectChildNodeFromParent, replaceChild, replaceNode, rotateLeft, rotateRight } from './avl-tree-utils';

describe('AvlTreeUtils', () => {
    describe('replaceChild', () => {
        it('replaces child with another one', () => {
            /**
             * Tree:
             *
             *         100
             *       /     \
             *     50      150
             *    /  \     /  \
             *   25  75  125  175
             *
             * Replacing 150 with 50:
             *         100
             *             \
             *              50          150
             *             /  \        /   \
             *            25   75    125   175
             */

            const parent = createNode(100);
            const child = setRight(parent, 150);
            const left = setLeft(child, 125);
            const right = setRight(child, 175);

            const newChild = setLeft(parent, 50);
            const newChildLeft = setLeft(newChild, 25);
            const newChildRight = setRight(newChild, 75);

            const p = replaceChild(child, newChild);
            expect(p).toEqual(parent);

            // Check link between parent and its new child
            expect(parent.right).toBe(newChild);
            expect(newChild.parent).toBe(parent);

            // Check that newChild still has same children
            expect(newChild.left).toBe(newChildLeft);
            expect(newChild.right).toBe(newChildRight);
            expect(newChildLeft.parent).toBe(newChild);
            expect(newChildRight.parent).toBe(newChild);

            // Check that old child is now disconnected
            expect(parent.left).toBeUndefined();
            expect(child.parent).toBeUndefined();

            // Check that old child still has same children
            expect(child.left).toBe(left);
            expect(child.right).toBe(right);
            expect(left.parent).toBe(child);
            expect(right.parent).toBe(child);
        });
    });

    describe('replaceNode', () => {
        it('can replace a node with its left child', () => {
            /**
             * Tree:
             *         5
             *       /
             *     2
             *    / \
             *   1   3
             *  /     \
             * 0       4
             *
             * Replacing 2 with 1:
             *
             *         5
             *       /
             *     1        2
             *      \
             *       3      0
             *        \
             *         4
             */
            const parent = createNode(5);
            const node = setLeft(parent, 2);
            const left = setLeft(node, 1);
            const right = setRight(node, 3);
            const leftLeft = setLeft(left, 0);
            const rightRight = setRight(right, 4);

            setBalanceFactorAndComputeHeight(parent);

            replaceNode(node, left);

            // Check downward links
            expect(node.left).toBeUndefined();
            expect(node.right).toBeUndefined();

            expect(parent.left).toBe(left);
            expect(parent.right).toBeUndefined();
            expect(left.left).toBeUndefined();
            expect(left.right).toBe(right);
            expect(right.left).toBeUndefined();
            expect(right.right).toBe(rightRight);
            expect(leftLeft.left).toBeUndefined();
            expect(leftLeft.right).toBeUndefined();

            // Check upward links
            expect(parent.parent).toBeUndefined();
            expect(left.parent).toBe(parent);
            expect(leftLeft.parent).toBeUndefined();
            expect(right.parent).toBe(left);
            expect(rightRight.parent).toBe(right);
            expect(node.parent).toBeUndefined();

            // Check that balance factor is copied
            // (rebalancing is not done here)
            expect(left.balanceFactor).toBe(0);
        });

        it('can replace a node across a tree', () => {
            /**
             * Tree:
             *         5
             *       /
             *     2
             *    / \
             *   1   3
             *  /     \
             * 0       4
             *
             * Replacing 2 with 4:
             *
             *         5
             *       /
             *     4          2
             *    / \
             *   1   3
             *  /
             * 0
             */

            const parent = createNode(5);
            const node = setLeft(parent, 2);
            const left = setLeft(node, 1);
            const right = setRight(node, 3);
            const leftLeft = setLeft(left, 0);
            const rightRight = setRight(right, 4);

            setBalanceFactorAndComputeHeight(parent);

            replaceNode(node, rightRight);

            // Check downward links
            expect(parent.left).toBe(rightRight);
            expect(parent.right).toBeUndefined();
            expect(rightRight.left).toBe(left);
            expect(rightRight.right).toBe(right);
            expect(left.left).toBe(leftLeft);
            expect(left.right).toBeUndefined();
            expect(node.left).toBeUndefined();
            expect(node.right).toBeUndefined();

            // Check upward links
            expect(parent.parent).toBeUndefined();
            expect(rightRight.parent).toBe(parent);
            expect(left.parent).toBe(rightRight);
            expect(leftLeft.parent).toBe(left);
            expect(right.parent).toBe(rightRight);
        });

        it('can replace a node with a root node', () => {
            /**
             * Tree:
             *         5
             *       /
             *     2
             *    / \
             *   1   3
             *  /     \
             * 0       4
             *
             * Replacing 5 with 3:
             *
             *         3
             *       /
             *     2          5
             *    /
             *   1            4
             *  /
             * 0
             */

            const root = createNode(5);
            const left = setLeft(root, 2);
            const leftLeft = setLeft(left, 1);
            const leftRight = setRight(left, 3);
            const leftLeaf = setLeft(leftLeft, 0);
            const rightLeaf = setRight(leftRight, 4);

            setBalanceFactorAndComputeHeight(root);

            replaceNode(root, leftRight);

            const newRoot = leftRight;

            // Check downward links
            expect(newRoot.left?.key).toBe(left.key);
            expect(newRoot.right).toBeUndefined();
            expect(left.left).toBe(leftLeft);
            expect(left.right).toBeUndefined();
            expect(leftLeft.left).toBe(leftLeaf);
            expect(leftLeft.right).toBeUndefined();
            expect(leftLeaf.left).toBeUndefined();
            expect(leftLeaf.right).toBeUndefined();
            expect(rightLeaf.left).toBeUndefined();
            expect(rightLeaf.right).toBeUndefined();

            // Check upward links
            expect(root.parent).toBeUndefined();
            expect(rightLeaf.parent).toBeUndefined();

            expect(newRoot.parent).toBeUndefined();
            expect(left.parent).toBe(newRoot);
            expect(leftLeft.parent).toBe(left);
            expect(leftLeaf.parent).toBe(leftLeft);
        });
    });
    describe('rotateLeft', () => {
        it('rotates a balanced tree', () => {
            // Setup simple tree

            //        100    Rotate left     150
            //      /     \                /     \
            //    50      150   ====>    100      175
            //   /  \    /   \          /  \
            // 25   75  125  175      50    125
            //                       /  \
            //                      25  75
            const root = createNode(100);
            const left = setLeft(root, 50);
            const leftLeft = setLeft(left, 25);
            const leftRight = setRight(left, 75);

            const right = setRight(root, 150);
            const rightLeft = setLeft(right, 125);
            const rightRight = setRight(right, 175);

            setBalanceFactorAndComputeHeight(root);

            const newRoot = rotateLeft(root);

            expect(newRoot).toBe(right);
            expect(newRoot.left).toBe(root);
            expect(newRoot.left?.left).toBe(left);
            expect(newRoot.left?.right).toBe(rightLeft);

            expect(newRoot.left?.left?.left).toBe(leftLeft);
            expect(newRoot.left?.left?.right).toBe(leftRight);

            expect(newRoot.right).toBe(rightRight);

            expect(newRoot.balanceFactor).toBe(-2);
            expect(root.balanceFactor).toBe(-1);
        });

        it('rotates an imbalanced tree', () => {
            // Setup simple tree

            //        100        Rotate left     150
            //      /     \                    /     \
            //    50      150      ====>    100      175
            //   /  \    /   \              /  \       \
            // 25   75  125  175          50    125    200
            //                 \         /  \
            //                 200      25  75
            const root = createNode(100);
            const left = setLeft(root, 50);
            const leftLeft = setLeft(left, 25);
            const leftRight = setRight(left, 75);

            const right = setRight(root, 150);
            const rightLeft = setLeft(right, 125);
            const rightRight = setRight(right, 175);
            setRight(rightRight, 200); // 1 extra node compared to previous test case

            setBalanceFactorAndComputeHeight(root);

            const newRoot = rotateLeft(root);

            expect(newRoot).toBe(right);
            expect(newRoot.left).toBe(root);
            expect(newRoot.left?.left).toBe(left);
            expect(newRoot.left?.right).toBe(rightLeft);

            expect(newRoot.left?.left?.left).toBe(leftLeft);
            expect(newRoot.left?.left?.right).toBe(leftRight);

            expect(newRoot.right).toBe(rightRight);

            expect(root.balanceFactor).toBe(-1);
            expect(newRoot.balanceFactor).toBe(-1);
        });

        it('fails if there is no right child', () => {
            const root = createNode(100);
            setLeft(root, 50);
            expect(() => rotateLeft(root)).toThrowError('Cannot rotate left without a right child');
        });
    });

    describe('rotateRight', () => {
        it('rotates a balanced tree', () => {
            // Setup simple tree

            //        100       Rotate right    50
            //      /     \                   /     \
            //    50      150      ====>    25      100
            //   /  \    /   \                     /   \
            // 25   75  125  175                  75   150
            //                                        /   \
            //                                       125  175
            const root = createNode(100);
            const left = setLeft(root, 50);
            const leftLeft = setLeft(left, 25);
            const leftRight = setRight(left, 75);

            const right = setRight(root, 150);
            const rightLeft = setLeft(right, 125);
            const rightRight = setRight(right, 175);

            setBalanceFactorAndComputeHeight(root);

            const newRoot = rotateRight(root);

            expect(newRoot).toBe(left);
            expect(newRoot.left).toBe(leftLeft);

            expect(newRoot.right).toBe(root);
            expect(newRoot.right?.left).toBe(leftRight);
            expect(newRoot.right?.right).toBe(right);
            expect(newRoot.right?.right?.left).toBe(rightLeft);
            expect(newRoot.right?.right?.right).toBe(rightRight);

            expect(newRoot.balanceFactor).toBe(2);
            expect(root.balanceFactor).toBe(1);
        });

        it('rotates an imbalanced tree', () => {
            // Setup simple tree

            //         0                         0
            //          \                         \
            //          100       Rotate right    50
            //        /     \                   /    \
            //      50      150      ====>    25     100
            //     /  \    /   \             /      /   \
            //   25   75  125  175          12     75   150
            //  /                                      /   \
            // 12                                     125  175

            const superRoot = createNode(0);
            const root = setRight(superRoot, 100);
            const left = setLeft(root, 50);
            const leftLeft = setLeft(left, 25);
            const leftRight = setRight(left, 75);

            const right = setRight(root, 150);
            const rightLeft = setLeft(right, 125);
            const rightRight = setRight(right, 175);
            setLeft(leftLeft, 12); // 1 extra node compared to previous test case

            setBalanceFactorAndComputeHeight(superRoot);

            const newRoot = rotateRight(root);

            expect(superRoot.right).toBe(newRoot);
            expect(newRoot.parent).toBe(superRoot);

            expect(newRoot).toBe(left);
            expect(newRoot.left).toBe(leftLeft);

            expect(newRoot.right).toBe(root);
            expect(newRoot.right?.left).toBe(leftRight);
            expect(newRoot.right?.right).toBe(right);
            expect(newRoot.right?.right?.left).toBe(rightLeft);
            expect(newRoot.right?.right?.right).toBe(rightRight);

            expect(newRoot.balanceFactor).toBe(1);
            expect(root.balanceFactor).toBe(1);
        });

        it('fails if there is no left child', () => {
            const root = createNode(100);
            setRight(root, 150);
            expect(() => rotateRight(root)).toThrowError('Cannot rotate right without a left child');
        });
    });

    describe('disconnectChildNode', () => {
        it('disconnects a left child', () => {
            const root = createNode(100);
            const child = setLeft(root, 200);
            const left = setLeft(child, 150);
            const right = setRight(child, 250);

            const parent = disconnectChildNodeFromParent(child);
            expect(parent).toBe(root);
            expect(root.left).toBeUndefined();
            expect(child.parent).toBeUndefined();
            expect(child.left).toBe(left);
            expect(child.right).toBe(right);
        });

        it('disconnects a right child', () => {
            const root = createNode(100);
            const child = setRight(root, 200);
            const left = setLeft(child, 150);
            const right = setRight(child, 250);

            const parent = disconnectChildNodeFromParent(child);
            expect(parent).toBe(root);
            expect(root.right).toBeUndefined();
            expect(child.parent).toBeUndefined();
            expect(child.left).toBe(left);
            expect(child.right).toBe(right);
        });

        it('fails when the node has no parent', () => {
            const child = createNode(100);
            expect(() => disconnectChildNodeFromParent(child)).toThrowError(
                'Cannot disconnect child node because node has no parent'
            );
        });
    });
});

function setLeft(parent: AvlTreeNode<number, number>, num: number): AvlTreeNode<number, number> {
    const newNode = createNode(num);
    newNode.parent = parent;
    parent.left = newNode;
    return newNode;
}

function setRight(parent: AvlTreeNode<number, number>, num: number): AvlTreeNode<number, number> {
    const newNode = createNode(num);
    newNode.parent = parent;
    parent.right = newNode;
    return newNode;
}

function createNode(num: number): AvlTreeNode<number, number> {
    return new AvlTreeNode<number, number>(num, num);
}

function setBalanceFactorAndComputeHeight<K, V>(node: AvlTreeNode<K, V>): number {
    const leftHeight = node.left ? setBalanceFactorAndComputeHeight(node.left) : 0;
    const rightHeight = node.right ? setBalanceFactorAndComputeHeight(node.right) : 0;
    const height = 1 + Math.max(leftHeight, rightHeight);
    const balanceFactor = rightHeight - leftHeight;
    node.balanceFactor = balanceFactor;
    return height;
}

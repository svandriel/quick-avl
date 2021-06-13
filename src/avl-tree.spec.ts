import { AvlTree } from './avl-tree';
import { AvlTreeNode } from './avl-tree-node';
import { checkTree } from './avl-tree-utils';

const PRINT_TREES = false;

describe('AvlTree', () => {
    it('initializes with zero size', () => {
        const tree = new AvlTree<number, string>();
        expect(tree.size).toBe(0);
    });

    describe('insert', () => {
        it('returns the tree node if inserted', () => {
            const tree = new AvlTree<number, string>();
            const node = tree.insert(100, 'Hundred');
            expect(node).toBeDefined();
            expect(node?.key).toBe(100);
            expect(node?.value).toBe('Hundred');
            expect(tree.size).toBe(1);
        });
        it('returns undefined if nothing could be inserted', () => {
            const tree = new AvlTree<number, string>();
            tree.insert(100, 'Hundred');
            const node = tree.insert(100, 'Hundred');
            expect(node).toBeUndefined();
            expect(tree.size).toBe(1);
        });
        it('increments the size', () => {
            const tree = new AvlTree<number, string>();
            tree.insert(100, 'Hundred');
            tree.insert(101, 'Hundred and one');
            tree.insert(102, 'Hundred and two');
            tree.insert(99, 'Ninety-nine');
            tree.insert(150, 'Hundred and fifty');
            tree.insert(200, 'Two hundred');
            tree.insert(130, 'Hundred and thirty');

            expect(tree.size).toBe(7);

            expect(tree.get(100)).toBe('Hundred');
            expect(tree.get(101)).toBe('Hundred and one');
            expect(tree.get(102)).toBe('Hundred and two');
            expect(tree.get(130)).toBe('Hundred and thirty');
            expect(tree.get(150)).toBe('Hundred and fifty');
            expect(tree.get(200)).toBe('Two hundred');
            expect(tree.get(99)).toBe('Ninety-nine');

            expect(tree.get(98)).toBeUndefined();
            expect(tree.get(97)).toBeUndefined();
        });

        it('performs right rotation if necessary', () => {
            /**
             *          100       Rotate right       50
             *        /     \                      /    \
             *      50      150      ====>       25     100
             *     /  \                         /      /   \
             *   25   75                      12      75   150
             *  /
             * 12 (new)
             */
            const tree = new AvlTree<number, number>();
            tree.insert(100, 100);
            tree.insert(50, 50);
            tree.insert(150, 150);
            tree.insert(25, 25);
            tree.insert(75, 75);
            tree.insert(12, 12); // should trigger rotation

            const root = tree.root;
            expect(root?.value).toBe(50);
            expect(root?.left?.key).toBe(25);
            expect(root?.left?.left?.key).toBe(12);
            expect(root?.right?.key).toBe(100);
            expect(root?.right?.left?.key).toBe(75);
            expect(root?.right?.right?.key).toBe(150);
        });

        it('performs left-right rotation if necessary (case 1)', () => {
            /**
             *          100       Rotate left    100*     Rotate right   75
             *        /     \                   /    \                  /  \
             *      50*     150      ====>    75     150     ===>     50   100
             *     /  \                      /  \                    /    /   \
             *   25   75                   50    80                 25   80   150
             *          \                 /
             *          80 (new)         25
             */

            const tree = new AvlTree<number, number>();
            tree.insert(100, 100);
            tree.insert(50, 50);
            tree.insert(150, 150);
            tree.insert(25, 25);
            tree.insert(75, 75);
            tree.insert(80, 80); // should trigger rotation

            const root = tree.root;
            expect(root?.value).toBe(75);
            expect(root?.left?.key).toBe(50);
            expect(root?.left?.left?.key).toBe(25);
            expect(root?.right?.key).toBe(100);
            expect(root?.right?.left?.key).toBe(80);
            expect(root?.right?.right?.key).toBe(150);
        });

        it('performs left-right rotation if necessary (case 2)', () => {
            /**
             *          100       Rotate left    100*     Rotate right    75
             *        /     \                   /    \                  /    \
             *      50*     150      ====>    75     150     ===>     50     100
             *     /  \                      /                       /  \       \
             *   25   75                   50                       25  60      150
             *       /                    /  \
             *      60(new)              25  60
             */
            const tree = new AvlTree<number, number>();
            tree.insert(100, 100);
            tree.insert(50, 50);
            tree.insert(150, 150);
            tree.insert(25, 25);
            tree.insert(75, 75);
            tree.insert(60, 60); // should trigger rotation

            const root = tree.root;
            expect(root?.value).toBe(75);
            expect(root?.left?.key).toBe(50);
            expect(root?.left?.left?.key).toBe(25);
            expect(root?.left?.right?.key).toBe(60);
            expect(root?.right?.key).toBe(100);
            expect(root?.right?.right?.key).toBe(150);
        });

        it('performs left rotation if necessary', () => {
            /**
             *          100*      Rotate left      150
             *        /    \                      /    \
             *      50     150       ====>      100    200
             *            /   \                /   \      \
             *          125   200             50   125    300
             *                  \
             *                  300 (new)
             */
            const tree = new AvlTree<number, number>();
            tree.insert(100, 100);
            tree.insert(50, 50);
            tree.insert(150, 150);
            tree.insert(125, 125);
            tree.insert(200, 200);
            tree.insert(300, 300); // should trigger rotation

            const root = tree.root;
            expect(root?.value).toBe(150);
            expect(root?.left?.key).toBe(100);
            expect(root?.left?.left?.key).toBe(50);
            expect(root?.left?.right?.key).toBe(125);
            expect(root?.right?.key).toBe(200);
            expect(root?.right?.right?.key).toBe(300);
        });

        it('performs right-left rotation if necessary', () => {
            /**
             *          100      Rotate right      100*        Rotate left   125
             *        /    \                      /    \                    /   \
             *      50     150*      ====>       50    125      =====>    100   150
             *            /   \                       /   \              /   \    \
             *          125   200                   110   150          50    110   200
             *         /                                    \
             *        110(new)                              200
             */
            const tree = new AvlTree<number, number>();
            tree.insert(100, 100);
            tree.insert(50, 50);
            tree.insert(150, 150);
            tree.insert(125, 125);
            tree.insert(200, 200);
            tree.insert(110, 110); // should trigger rotation

            const root = tree.root;
            expect(root?.value).toBe(125);
            expect(root?.left?.key).toBe(100);
            expect(root?.left?.left?.key).toBe(50);
            expect(root?.left?.right?.key).toBe(110);
            expect(root?.right?.key).toBe(150);
            expect(root?.right?.right?.key).toBe(200);
        });
    });

    describe('delete', () => {
        it('removes a leaf node', () => {
            /**
             * Make a tree to start with:
             *
             *         40
             *       /    \
             *     20      60
             *    /  \    /  \
             *   10  30  50  70
             *  /
             * 5
             */
            const tree = new AvlTree<number, number>();
            tree.insert(40, 40);
            tree.insert(10, 10);
            tree.insert(50, 50);
            tree.insert(30, 30);
            tree.insert(20, 20);
            tree.insert(60, 60);
            tree.insert(70, 70);
            tree.insert(5, 5);

            // First remove a leaf node
            expect(tree.delete(30)).toBe(true);
            if (PRINT_TREES) {
                tree.print();
            }

            expect(tree.size).toBe(7);
            expect(tree.keyList()).toEqual([5, 10, 20, 40, 50, 60, 70]);
            expect(tree.toJSON()).toMatchSnapshot();

            /**
             * Expected situation:
             *
             *         40     Rotate right         40
             *       /    \                      /    \
             *     20*     60   ===>           10      60
             *    /       /  \                /  \    /  \
             *   10      50  70              5   20  50  70
             *  /
             * 5
             */
        });

        it('removes a root node when left-heavy and predecessor has left child', () => {
            /**
             * Make a tree to start with:
             *
             *         40*
             *       /    \
             *     20      60
             *    /  \    /  \
             *   10  30p 50  70
             *       /
             *      25pl
             */
            const tree = new AvlTree<number, number>();
            tree.insert(40, 40);
            tree.insert(20, 20);
            tree.insert(60, 60);
            tree.insert(10, 10);
            tree.insert(30, 30);
            tree.insert(50, 50);
            tree.insert(70, 70);
            tree.insert(25, 25);

            // Remove the root node
            expect(tree.delete(40)).toBe(true);
            if (PRINT_TREES) {
                tree.print();
            }

            expect(tree.size).toBe(7);
            expect(tree.keyList()).toEqual([10, 20, 25, 30, 50, 60, 70]);
            expect(tree.toJSON()).toMatchSnapshot();

            /**
             * Expected situation:
             *
             *         30p
             *       /    \
             *     20       60
             *    /  \     /  \
             *   10  25pl 50  70
             */
        });

        it('removes a root node when left-heavy and predecessor has no left child', () => {
            /**
             * Make a tree to start with:
             *
             *         40*
             *       /    \
             *     20      60
             *    /  \    /  \
             *   10  30p 50  70
             *    \
             *     15
             */
            const tree = new AvlTree<number, number>();
            tree.insert(40, 40);
            tree.insert(20, 20);
            tree.insert(60, 60);
            tree.insert(10, 10);
            tree.insert(30, 30);
            tree.insert(50, 50);
            tree.insert(70, 70);
            tree.insert(15, 15);

            // Remove the root node
            expect(tree.delete(40)).toBe(true);
            if (PRINT_TREES) {
                tree.print();
            }

            expect(tree.size).toBe(7);
            // expect(tree.keys()).toEqual([10, 15, 20, 30, 50, 60, 70]);
            expect(tree.toJSON()).toMatchSnapshot();

            /**
             * Expected situation:
             *
             *         30
             *       /    \
             *     15     60
             *    /  \    /  \
             *   10  20  50  70
             */
        });

        it('removes a root node when right-heavy', () => {
            /**
             * Make a tree to start with:
             *
             *         40*
             *       /    \
             *     20      60
             *    /  \    /  \
             *   10  30  50  70
             *            \
             *             55
             */
            const tree = new AvlTree<number, number>();
            tree.insert(40, 40);
            tree.insert(20, 20);
            tree.insert(60, 60);
            tree.insert(10, 10);
            tree.insert(30, 30);
            tree.insert(50, 50);
            tree.insert(70, 70);
            tree.insert(55, 55);

            // Remove the root node
            expect(tree.delete(40)).toBe(true);
            if (PRINT_TREES) {
                tree.print();
            }

            expect(tree.size).toBe(7);
            expect(tree.keyList()).toEqual([10, 20, 30, 50, 55, 60, 70]);
            expect(tree.toJSON()).toMatchSnapshot();

            /**
             * Expected situation:
             *
             *         50
             *       /    \
             *     20      60
             *    /  \    /  \
             *   10  30  55  70
             */
        });

        it('removes a node with 2 children where its predecessor is its direct child', () => {
            const items = [4, 2, 6, 1, 3, 5, 9, 0];
            const tree = new AvlTree<number, number>();
            for (const item of items) {
                tree.insert(item, item);
            }

            /**
             * Results in tree:
             *           4
             *         /   \
             *       2*      6
             *      / \     / \
             *     1p  3   5   9
             *    /
             *   0pl
             *
             * Remove 2:
             *           4
             *         /   \
             *       1p      6
             *      / \     / \
             *     0pl 3   5   9
             */

            if (PRINT_TREES) {
                tree.print();
            }

            const removed = tree.delete(2);

            if (PRINT_TREES) {
                tree.print();
            }

            expect(removed).toBe(true);
            expect(tree.size).toBe(7);
            expect(tree.toJSON()).toMatchSnapshot();
        });

        it('removes an intermediate node when left-heavy and predecessor has no right child', () => {
            /**
             * Make a tree to start with:
             *
             *         40
             *       /    \
             *     20      60*
             *    /  \    /  \
             *   10  30  50  70
             *            \
             *            55(pred)
             */
            const tree = new AvlTree<number, number>();
            tree.insert(40, 40);
            tree.insert(20, 20);
            tree.insert(60, 60);
            tree.insert(10, 10);
            tree.insert(30, 30);
            tree.insert(50, 50);
            tree.insert(70, 70);
            tree.insert(55, 55);

            if (PRINT_TREES) {
                tree.print();
            }

            // Remove the root node
            expect(tree.delete(60)).toBe(true);
            if (PRINT_TREES) {
                tree.print();
            }

            expect(tree.size).toBe(7);
            expect(tree.keyList()).toEqual([10, 20, 30, 40, 50, 55, 70]);
            expect(tree.toJSON()).toMatchSnapshot();

            /**
             * Expected situation:
             *
             *         40
             *       /    \
             *     20      55
             *    /  \    /  \
             *   10  30  50  70
             */
        });

        it('removes an intermediate node when right-heavy and successor has no right child', () => {
            /**
             * Make a tree to start with:
             *
             *         40
             *       /    \
             *     20      60*
             *    /  \    /  \
             *   10  30  50  70
             *              /
             *             65
             */
            const tree = new AvlTree<number, number>();
            tree.insert(40, 40);
            tree.insert(20, 20);
            tree.insert(60, 60);
            tree.insert(10, 10);
            tree.insert(30, 30);
            tree.insert(50, 50);
            tree.insert(70, 70);
            tree.insert(65, 65);

            if (PRINT_TREES) {
                tree.print();
            }

            // Remove the root node
            expect(tree.delete(60)).toBe(true);
            if (PRINT_TREES) {
                tree.print();
            }

            expect(tree.size).toBe(7);
            expect(tree.keyList()).toEqual([10, 20, 30, 40, 50, 65, 70]);
            expect(tree.toJSON()).toMatchSnapshot();

            /**
             * Expected situation:
             *
             *         40
             *       /    \
             *     20      65
             *    /  \    /  \
             *   10  30  50  70
             */
        });

        it('removes a node that only has a left child', () => {
            /**
             * Make a tree to start with:
             *
             *         40
             *       /    \
             *     20      60*
             *    /  \    /
             *   10  30  50
             *       /
             *     25
             */
            const tree = new AvlTree<number, number>();
            tree.insert(40, 40);
            tree.insert(20, 20);
            tree.insert(60, 60);
            tree.insert(10, 10);
            tree.insert(30, 30);
            tree.insert(50, 50);
            tree.insert(25, 25);

            if (PRINT_TREES) {
                tree.print();
            }

            // Remove the root node
            expect(tree.delete(60)).toBe(true);
            if (PRINT_TREES) {
                tree.print();
            }

            expect(tree.size).toBe(6);
            expect(tree.keyList()).toEqual([10, 20, 25, 30, 40, 50]);
            expect(tree.toJSON()).toMatchSnapshot();

            /**
             * Expected situation:
             *
             *        30
             *       /  \
             *     20    40
             *    /  \     \
             *   10  25    50
             */
        });

        it('removes a root node that only has a left child', () => {
            /**
             * Make a tree to start with:
             *
             *         1*
             *       /
             *     0
             */
            const tree = new AvlTree<number, number>();
            tree.insert(1, 1);
            tree.insert(0, 0);

            if (PRINT_TREES) {
                tree.print();
            }

            // Remove the root node
            expect(tree.delete(1)).toBe(true);
            if (PRINT_TREES) {
                tree.print();
            }

            expect(tree.size).toBe(1);
            expect(tree.keyList()).toEqual([0]);
            expect(tree.toJSON()).toMatchSnapshot();

            /**
             * Expected situation:
             *
             *        30
             *       /  \
             *     20    40
             *    /  \     \
             *   10  25    50
             */
        });

        it('removes a node that only has a right child', () => {
            /**
             * Make a tree to start with:
             *
             *         40
             *       /    \
             *     20      60*
             *    /  \      \
             *   10  30      70
             *       /
             *     25
             */
            const tree = new AvlTree<number, number>();
            tree.insert(40, 40);
            tree.insert(20, 20);
            tree.insert(60, 60);
            tree.insert(10, 10);
            tree.insert(30, 30);
            tree.insert(70, 70);
            tree.insert(25, 25);

            if (PRINT_TREES) {
                tree.print();
            }

            // Remove the root node
            expect(tree.delete(60)).toBe(true);
            if (PRINT_TREES) {
                tree.print();
            }

            expect(tree.size).toBe(6);
            expect(tree.keyList()).toEqual([10, 20, 25, 30, 40, 70]);
            expect(tree.toJSON()).toMatchSnapshot();

            /**
             * Expected situation:
             *
             *        30
             *       /  \
             *     20    40
             *    /  \     \
             *   10  25    70
             */
        });

        it('removes a balanced internal node', () => {
            /**
             * Tree:
             *        12
             *       /  \
             *      11  18*
             *         /  \
             *        16p 19
             */
            const items = [12, 11, 18, 16, 19];
            const tree = new AvlTree<number, number>();
            for (const item of items) {
                tree.insert(item, item);
                checkTree(tree.root);
            }

            if (PRINT_TREES) {
                tree.print();
            }

            const removed = tree.delete(18);
            expect(removed).toBe(true);
            expect(tree.size).toBe(4);
            if (PRINT_TREES) {
                tree.print();
            }

            checkTree(tree.root);
        });

        it('returns false when node is not found', () => {
            const tree = new AvlTree<number, number>();
            expect(tree.delete(40)).toBe(false);
            tree.insert(40, 40);
            tree.insert(30, 30);
            expect(tree.delete(30)).toBe(true);
            expect(tree.delete(40)).toBe(true);
            expect(tree.delete(0)).toBe(false);
        });
    });

    describe('toJSON', () => {
        it('works for an empty tree', () => {
            expect(new AvlTree<number, number>().toJSON()).toBeUndefined();
        });

        it('returns a simple object tree', () => {
            const tree = new AvlTree<number, number>();
            tree.insert(100, 100);
            tree.insert(50, 50);
            tree.insert(150, 150);
            tree.insert(125, 125);
            tree.insert(200, 200);
            tree.insert(300, 300);

            expect(tree.toJSON()).toMatchSnapshot();
        });

        it('allows for JSON.stringify support', () => {
            const tree = new AvlTree<number, number>();
            tree.insert(100, 100);
            tree.insert(50, 50);
            tree.insert(150, 150);
            tree.insert(125, 125);
            tree.insert(200, 200);
            tree.insert(300, 300);
            expect(JSON.stringify(tree)).toMatchSnapshot();
        });

        it('allows for JSON.stringify support with empty trees', () => {
            const tree = new AvlTree<number, number>();
            expect(JSON.stringify(tree)).toMatchSnapshot();
        });
    });

    describe('has', () => {
        it('checks if a key exists in the tree', () => {
            const tree = new AvlTree<number, string>();
            tree.insert(100, '100');
            tree.insert(50, '50');
            tree.insert(150, '150');
            tree.insert(125, '125');
            tree.insert(200, '200');
            tree.insert(40, '40');

            expect(tree.has(100)).toBe(true);
            expect(tree.has(50)).toBe(true);
            expect(tree.has(150)).toBe(true);
            expect(tree.has(125)).toBe(true);
            expect(tree.has(200)).toBe(true);
            expect(tree.has(40)).toBe(true);

            expect(tree.has(99)).toBe(false);
            expect(tree.has(101)).toBe(false);
        });
    });

    describe('keys', () => {
        it('gets a sorted array of keys', () => {
            const tree = new AvlTree<number, number>();
            tree.insert(100, 100);
            tree.insert(50, 50);
            tree.insert(150, 150);
            tree.insert(125, 125);
            tree.insert(200, 200);
            tree.insert(40, 40);

            expect(Array.from(tree.keys())).toEqual([40, 50, 100, 125, 150, 200]);
        });
    });

    describe('values', () => {
        it('gets a sorted array of values', () => {
            const tree = new AvlTree<number, string>();
            tree.insert(100, '100');
            tree.insert(50, '50');
            tree.insert(150, '150');
            tree.insert(125, '125');
            tree.insert(200, '200');
            tree.insert(40, '40');

            expect(Array.from(tree.values())).toEqual(['40', '50', '100', '125', '150', '200']);
        });
    });

    describe('entries', () => {
        it('gets a sorted array of key-value pairs', () => {
            const tree = new AvlTree<number, string>();
            tree.insert(100, '100');
            tree.insert(50, '50');
            tree.insert(150, '150');
            tree.insert(125, '125');
            tree.insert(200, '200');
            tree.insert(40, '40');
            expect(Array.from(tree.entries())).toEqual([
                [40, '40'],
                [50, '50'],
                [100, '100'],
                [125, '125'],
                [150, '150'],
                [200, '200']
            ]);
        });
    });

    describe('at', () => {
        it('gets a node at an index', () => {
            const tree = new AvlTree<number, string>();
            tree.insert(100, '100');
            tree.insert(50, '50');
            tree.insert(150, '150');
            tree.insert(125, '125');
            tree.insert(200, '200');
            tree.insert(40, '40');

            expect(tree.at(0)?.[0]).toBe(40);
            expect(tree.at(1)?.[0]).toBe(50);
            expect(tree.at(2)?.[0]).toBe(100);
            expect(tree.at(3)?.[0]).toBe(125);
            expect(tree.at(4)?.[0]).toBe(150);
            expect(tree.at(5)?.[0]).toBe(200);
        });

        it('throws an error when out of bounds', () => {
            const tree = new AvlTree<number, string>();
            expect(() => tree.at(0)).toThrow('Index out of bounds: 0');

            tree.insert(100, '100');
            tree.insert(50, '50');
            tree.insert(150, '150');

            expect(() => tree.at(3)).toThrow('Index out of bounds: 3');
        });
    });

    describe('minNode', () => {
        it('gets the node with the lowest key', () => {
            const tree = new AvlTree<number, string>();
            tree.insert(100, '100');
            tree.insert(50, '50');
            tree.insert(150, '150');
            tree.insert(125, '125');
            tree.insert(200, '200');
            tree.insert(40, '40');

            expect(tree.minNode()?.key).toBe(40);
            expect(tree.minKey()).toBe(40);
            expect(tree.minValue()).toBe('40');
        });

        it('handles the empty tree case', () => {
            const tree = new AvlTree<number, string>();

            expect(tree.minNode()).toBeUndefined();
            expect(tree.minKey()).toBeUndefined();
            expect(tree.minValue()).toBeUndefined();
        });
    });

    describe('maxNode', () => {
        it('gets the node with the highest key', () => {
            const tree = new AvlTree<number, string>();
            tree.insert(100, '100');
            tree.insert(50, '50');
            tree.insert(150, '150');
            tree.insert(125, '125');
            tree.insert(200, '200');
            tree.insert(40, '40');

            expect(tree.maxNode()?.key).toBe(200);
            expect(tree.maxKey()).toBe(200);
            expect(tree.maxValue()).toBe('200');
        });

        it('handles the empty tree case', () => {
            const tree = new AvlTree<number, string>();

            expect(tree.maxNode()).toBeUndefined();
            expect(tree.maxKey()).toBeUndefined();
            expect(tree.maxValue()).toBeUndefined();
        });
    });

    describe('iterator', () => {
        it('iterates over all of the nodes', () => {
            const tree = new AvlTree<number, string>();
            tree.insert(100, '100');
            tree.insert(50, '50');
            tree.insert(150, '150');
            tree.insert(125, '125');
            tree.insert(200, '200');
            tree.insert(40, '40');

            const results: [number, string][] = [];
            for (const entry of tree) {
                results.push(entry);
            }

            expect(results).toHaveLength(6);
            expect(results.map(([key]) => key)).toEqual([40, 50, 100, 125, 150, 200]);
        });
    });

    describe('predecessor', () => {
        it('finds the predecessor', () => {
            const tree = new AvlTree<number, string>();

            const node100 = tree.insert(100, '100') as AvlTreeNode<number, string>;
            const node50 = tree.insert(50, '50') as AvlTreeNode<number, string>;
            const node150 = tree.insert(150, '150') as AvlTreeNode<number, string>;
            const node125 = tree.insert(125, '125') as AvlTreeNode<number, string>;
            const node200 = tree.insert(200, '200') as AvlTreeNode<number, string>;
            const node40 = tree.insert(40, '40') as AvlTreeNode<number, string>;
            const node220 = tree.insert(220, '220') as AvlTreeNode<number, string>;
            const node110 = tree.insert(110, '110') as AvlTreeNode<number, string>;
            const node75 = tree.insert(75, '75') as AvlTreeNode<number, string>;

            if (PRINT_TREES) {
                tree.print();
            }

            expect(tree.predecessor(node40)?.key).toBeUndefined();
            expect(tree.predecessor(node50)?.key).toBe(40);
            expect(tree.predecessor(node75)?.key).toBe(50);
            expect(tree.predecessor(node100)?.key).toBe(75);
            expect(tree.predecessor(node110)?.key).toBe(100);
            expect(tree.predecessor(node125)?.key).toBe(110);
            expect(tree.predecessor(node150)?.key).toBe(125);
            expect(tree.predecessor(node200)?.key).toBe(150);
            expect(tree.predecessor(node220)?.key).toBe(200);
        });

        it('works in big cases', () => {
            const tree = new AvlTree<number, number>();
            repeat(100, i => {
                tree.insert(i, i);
            });
            repeat(99, i => {
                const node = tree.getNode(i + 1) as AvlTreeNode<number, number>;
                expect(tree.predecessor(node)?.key).toBe(i);
            });
        });
    });

    describe('successor', () => {
        it('finds the successor', () => {
            const tree = new AvlTree<number, string>();

            const node100 = tree.insert(100, '100') as AvlTreeNode<number, string>;
            const node50 = tree.insert(50, '50') as AvlTreeNode<number, string>;
            const node150 = tree.insert(150, '150') as AvlTreeNode<number, string>;
            const node125 = tree.insert(125, '125') as AvlTreeNode<number, string>;
            const node200 = tree.insert(200, '200') as AvlTreeNode<number, string>;
            const node40 = tree.insert(40, '40') as AvlTreeNode<number, string>;
            const node220 = tree.insert(220, '220') as AvlTreeNode<number, string>;
            const node110 = tree.insert(110, '110') as AvlTreeNode<number, string>;
            const node75 = tree.insert(75, '75') as AvlTreeNode<number, string>;

            if (PRINT_TREES) {
                tree.print();
            }

            expect(tree.successor(node40)?.key).toBe(50);
            expect(tree.successor(node50)?.key).toBe(75);
            expect(tree.successor(node75)?.key).toBe(100);
            expect(tree.successor(node100)?.key).toBe(110);
            expect(tree.successor(node110)?.key).toBe(125);
            expect(tree.successor(node125)?.key).toBe(150);
            expect(tree.successor(node150)?.key).toBe(200);
            expect(tree.successor(node200)?.key).toBe(220);
            expect(tree.successor(node220)?.key).toBeUndefined();
        });

        it('works in big cases', () => {
            const tree = new AvlTree<number, number>();
            repeat(100, i => {
                tree.insert(i, i);
            });
            repeat(99, i => {
                const node = tree.getNode(i) as AvlTreeNode<number, number>;
                expect(tree.successor(node)?.key).toBe(i + 1);
            });
        });
    });

    describe('toString', () => {
        it('prints out a tree', () => {
            const tree = new AvlTree<number, string>();
            tree.insert(100, '100');
            tree.insert(50, '50');
            tree.insert(150, '150');
            tree.insert(125, '125');
            tree.insert(200, '200');
            tree.insert(40, '40');

            expect(`${tree.toString()}`).toMatchSnapshot();
        });

        it('prints out an empty tree', () => {
            const tree = new AvlTree<number, string>();

            expect(`${tree.toString()}`).toMatchSnapshot();
        });
    });

    describe('map', () => {
        it('maps the tree nodes onto a list', () => {
            const tree = new AvlTree<number, number>();
            tree.insert(1, 1);
            tree.insert(2, 2);
            tree.insert(4, 4);
            tree.insert(8, 8);
            tree.insert(16, 16);

            expect(tree.map(([, value]) => value * value)).toEqual([1, 4, 16, 64, 256]);
        });
    });
    describe('forEach', () => {
        it('executes a function on each node', () => {
            const tree = new AvlTree<number, string>();
            tree.insert(1, '1');
            tree.insert(2, '2');
            tree.insert(4, '4');
            tree.insert(8, '8');
            tree.insert(16, '16');

            const iter = jest.fn();
            tree.forEach(iter);

            expect(iter).toHaveBeenCalledTimes(5);

            expect(iter).toHaveBeenNthCalledWith(1, '1', 1, tree);
            expect(iter).toHaveBeenNthCalledWith(2, '2', 2, tree);
            expect(iter).toHaveBeenNthCalledWith(3, '4', 4, tree);
            expect(iter).toHaveBeenNthCalledWith(4, '8', 8, tree);
            expect(iter).toHaveBeenNthCalledWith(5, '16', 16, tree);
        });
    });

    it('works with random case', () => {
        // Create shuffled list
        const insertCount = 200;
        const items: number[] = [];
        for (let i = 0; i < insertCount; i += 1) {
            items.push(i);
        }
        shuffleList(items);

        const tree = new AvlTree<number, number>();
        for (const item of items) {
            tree.insert(item, item);
            checkTree(tree.root);
        }

        if (PRINT_TREES) {
            tree.print();
        }

        // Shuffle list again for removal
        shuffleList(items);

        for (const item of items) {
            // console.log(`Removing ${item}`);
            const removed = tree.delete(item);
            // console.log(`After removing ${item}:\n${tree}`);
            expect(removed).toBe(true);
            checkTree(tree.root);
        }
        expect(tree.size).toBe(0);
    });

    it.skip('is fast', () => {
        // Create shuffled list
        const insertCount = 400000;
        const items: number[] = [];
        for (let i = 0; i < insertCount; i += 1) {
            items.push(i);
        }
        shuffleList(items);
        // console.log(JSON.stringify(items));

        const tree = new AvlTree<number, number>();
        let start = new Date().getTime();
        for (const item of items) {
            tree.insert(item, item);
        }
        let elapsed = new Date().getTime() - start;
        console.log(`Inserted ${insertCount} items in ${elapsed} ms`);

        start = new Date().getTime();
        for (const item of items) {
            tree.get(item);
        }
        elapsed = new Date().getTime() - start;
        console.log(`Found ${insertCount} items in ${elapsed} ms`);

        start = new Date().getTime();
        for (const item of items) {
            tree.delete(item);
        }
        elapsed = new Date().getTime() - start;
        console.log(`Removed ${insertCount} items in ${elapsed} ms`);
    });
});

function shuffleList<T>(array: T[]): T[] {
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex > 0) {
        // Pick a remaining element...
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        const temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function repeat<T>(times: number, fn: (iteration: number) => T): T[] {
    const results: T[] = [];
    for (let i = 0; i < times; i++) {
        results.push(fn(i));
    }
    return results;
}

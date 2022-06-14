export interface AvlTreeNodeJson<K, V> {
    readonly key: K;
    readonly value: V;
    left?: AvlTreeNodeJson<K, V>;
    right?: AvlTreeNodeJson<K, V>;
    balanceFactor: number;
}

export class AvlTreeNode<K, V> implements AvlTreeNodeJson<K, V> {
    left?: AvlTreeNode<K, V>;
    right?: AvlTreeNode<K, V>;
    balanceFactor = 0;

    constructor(public readonly key: K, public readonly value: V, public parent?: AvlTreeNode<K, V>) {}

    successor(): AvlTreeNode<K, V> | undefined {
        if (this.right) {
            // Find leftmost child
            let current = this.right;
            while (current.left) {
                current = current.left;
            }
            return current;
        }

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let child: AvlTreeNode<K, V> = this;
        let parent = this.parent;

        // Travel up until the current node is no longer the right child of its parent
        while (parent?.right === child) {
            child = parent;
            parent = child.parent;
        }

        return parent;
    }

    predecessor(): AvlTreeNode<K, V> | undefined {
        if (this.left) {
            // Find rightmost child
            let current = this.left;
            while (current.right) {
                current = current.right;
            }
            return current;
        }

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let child: AvlTreeNode<K, V> = this;
        let parent = this.parent;

        // Travel up until the current node is no longer the left child of its parent
        while (parent?.left === child) {
            child = parent;
            parent = child.parent;
        }

        return parent;
    }

    toJSON(): AvlTreeNodeJson<K, V> {
        const json: AvlTreeNodeJson<K, V> = {
            key: this.key,
            value: this.value,
            balanceFactor: this.balanceFactor
        };
        if (this.left) {
            json.left = this.left.toJSON();
        }
        if (this.right) {
            json.right = this.right.toJSON();
        }
        return json;
    }
}

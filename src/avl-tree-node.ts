export interface AvlTreeNode<K, V> {
    readonly key: K;
    readonly value: V;
    parent?: AvlTreeNode<K, V>;
    left?: AvlTreeNode<K, V>;
    right?: AvlTreeNode<K, V>;
    balanceFactor: number;
}

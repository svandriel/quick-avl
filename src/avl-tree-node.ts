export interface AvlTreeNode<K, V> {
    key: K;
    value: V;
    parent?: AvlTreeNode<K, V>;
    left?: AvlTreeNode<K, V>;
    right?: AvlTreeNode<K, V>;
    balanceFactor: number;
}

export type ExprNode = NullLiteral | BoolLiteral | NumberLiteral | StringLiteral | ArrayLiteral | ObjectLiteral | Identifier | MemberAccess | IndexAccess | UnaryOp | BinaryOp | LogicalOp | Ternary | CallExpr;
export type UnaryOperator = '!' | '-' | '+';
export type BinaryOperator = '+' | '-' | '*' | '/' | '%' | '==' | '!=' | '<' | '<=' | '>' | '>=';
export type LogicalOperator = '&&' | '||' | '??';
export interface NullLiteral {
    readonly kind: 'Null';
}
export interface BoolLiteral {
    readonly kind: 'Bool';
    readonly value: boolean;
}
export interface NumberLiteral {
    readonly kind: 'Number';
    readonly value: number;
}
export interface StringLiteral {
    readonly kind: 'String';
    readonly value: string;
}
export interface ArrayLiteral {
    readonly kind: 'Array';
    readonly elements: readonly ExprNode[];
}
export interface ObjectLiteral {
    readonly kind: 'Object';
    readonly entries: readonly ObjectEntry[];
}
export interface ObjectEntry {
    readonly key: string;
    readonly value: ExprNode;
}
export interface Identifier {
    readonly kind: 'Identifier';
    readonly name: string;
}
export interface MemberAccess {
    readonly kind: 'Member';
    readonly object: ExprNode;
    readonly property: string;
}
export interface IndexAccess {
    readonly kind: 'Index';
    readonly object: ExprNode;
    readonly index: ExprNode;
}
export interface UnaryOp {
    readonly kind: 'Unary';
    readonly op: UnaryOperator;
    readonly argument: ExprNode;
}
export interface BinaryOp {
    readonly kind: 'Binary';
    readonly op: BinaryOperator;
    readonly left: ExprNode;
    readonly right: ExprNode;
}
export interface LogicalOp {
    readonly kind: 'Logical';
    readonly op: LogicalOperator;
    readonly left: ExprNode;
    readonly right: ExprNode;
}
export interface Ternary {
    readonly kind: 'Ternary';
    readonly test: ExprNode;
    readonly consequent: ExprNode;
    readonly alternate: ExprNode;
}
export interface CallExpr {
    readonly kind: 'Call';
    readonly callee: string;
    readonly args: readonly ExprNode[];
}
//# sourceMappingURL=ast.d.ts.map
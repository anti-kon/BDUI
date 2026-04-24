export const EXPR_PATTERN = /^\{\{([\s\S]+)\}\}$/;
export function isExprRef(value) {
    return (typeof value === 'object' &&
        value !== null &&
        value.__bduiExpr === true &&
        typeof value.code === 'string');
}
export function exprRef(code) {
    if (typeof code !== 'string' || code.trim().length === 0) {
        throw new Error('ExprRef code must be a non-empty string');
    }
    return { __bduiExpr: true, code };
}
/** Wire-format: serialize `ExprRef` into the `{{...}}` string. */
export function encodeExpr(ref) {
    return `{{${ref.code}}}`;
}
/** Wire-format: detect and extract the code part of `{{...}}` strings. */
export function decodeExpr(value) {
    if (typeof value !== 'string')
        return null;
    const match = EXPR_PATTERN.exec(value);
    return match ? (match[1] ?? null) : null;
}
//# sourceMappingURL=expr.js.map
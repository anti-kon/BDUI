export type TokenType = 'number' | 'string' | 'identifier' | 'punct' | 'eof';
export interface Token {
    readonly type: TokenType;
    readonly value: string;
    readonly position: number;
}
export declare function tokenize(source: string): Token[];
//# sourceMappingURL=lexer.d.ts.map
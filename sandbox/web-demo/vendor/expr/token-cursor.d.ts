import { type Token } from './lexer.js';
/**
 * Mutable cursor over the token stream produced by the lexer. The recursive
 * descent grammar in `parser.ts` advances this cursor while building the AST.
 */
export interface ParserState {
    readonly tokens: readonly Token[];
    index: number;
}
export declare function peek(state: ParserState): Token;
export declare function consume(state: ParserState): Token;
export declare function match(state: ParserState, type: Token['type'], value?: string): boolean;
export declare function expect(state: ParserState, type: Token['type'], value?: string): Token;
export declare function assertIdentAllowed(name: string, position: number): void;
//# sourceMappingURL=token-cursor.d.ts.map
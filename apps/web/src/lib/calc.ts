/**
 * A tiny, safe arithmetic evaluator for the notepad calculator. Supports
 * + - * / % ( ), unary minus, and decimals — no `eval`, no globals. Pure.
 */

type Token =
  | { type: 'num'; value: number }
  | { type: 'op'; value: string }
  | { type: 'paren'; value: '(' | ')' };

const BINARY: Record<string, { precedence: number; apply: (a: number, b: number) => number }> = {
  '+': { precedence: 1, apply: (a, b) => a + b },
  '-': { precedence: 1, apply: (a, b) => a - b },
  '*': { precedence: 2, apply: (a, b) => a * b },
  '/': { precedence: 2, apply: (a, b) => a / b },
  '%': { precedence: 2, apply: (a, b) => a % b },
};

// Unary minus binds tighter than any binary operator and is right-associative.
const UNARY_MINUS = 'u-';
const UNARY_PRECEDENCE = 3;

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const ch = input[i]!;
    if (ch === ' ' || ch === '\t') {
      i++;
    } else if (/[0-9.]/.test(ch)) {
      let num = '';
      while (i < input.length && /[0-9.]/.test(input[i]!)) num += input[i++]!;
      if (!/^\d*\.?\d+$|^\d+\.$/.test(num)) throw new Error(`Bad number: ${num}`);
      tokens.push({ type: 'num', value: Number(num) });
    } else if (ch in BINARY) {
      tokens.push({ type: 'op', value: ch });
      i++;
    } else if (ch === '(' || ch === ')') {
      tokens.push({ type: 'paren', value: ch });
      i++;
    } else {
      throw new Error(`Unexpected character: ${ch}`);
    }
  }
  return tokens;
}

/** Evaluate a single arithmetic expression. Throws on invalid input. */
export function evaluate(expression: string): number {
  const tokens = tokenize(expression);
  const output: number[] = [];
  const ops: string[] = [];

  const applyTop = () => {
    const op = ops.pop()!;
    if (op === UNARY_MINUS) {
      const a = output.pop();
      if (a === undefined) throw new Error('Malformed expression');
      output.push(-a);
      return;
    }
    const b = output.pop();
    const a = output.pop();
    if (a === undefined || b === undefined) throw new Error('Malformed expression');
    output.push(BINARY[op]!.apply(a, b));
  };

  const precedenceOf = (op: string) =>
    op === UNARY_MINUS ? UNARY_PRECEDENCE : BINARY[op]!.precedence;

  let prev: Token | undefined;
  for (const token of tokens) {
    if (token.type === 'num') {
      output.push(token.value);
    } else if (token.type === 'op') {
      const isUnary = !prev || prev.type === 'op' || (prev.type === 'paren' && prev.value === '(');
      if (isUnary) {
        if (token.value === '-') ops.push(UNARY_MINUS);
        // a leading unary '+' is a no-op; anything else here is an error
        else if (token.value !== '+') throw new Error('Malformed expression');
      } else {
        while (
          ops.length &&
          ops[ops.length - 1] !== '(' &&
          precedenceOf(ops[ops.length - 1]!) >= BINARY[token.value]!.precedence
        ) {
          applyTop();
        }
        ops.push(token.value);
      }
    } else if (token.value === '(') {
      ops.push('(');
    } else {
      while (ops.length && ops[ops.length - 1] !== '(') applyTop();
      if (ops.pop() !== '(') throw new Error('Mismatched parentheses');
    }
    prev = token;
  }

  while (ops.length) {
    if (ops[ops.length - 1] === '(') throw new Error('Mismatched parentheses');
    applyTop();
  }

  if (output.length !== 1) throw new Error('Malformed expression');
  return output[0]!;
}

export interface CalcLine {
  input: string;
  result: number | null;
  error: boolean;
}

/** Evaluate each non-empty line independently. Blank lines pass through. */
export function evaluateLines(text: string): CalcLine[] {
  return text.split('\n').map((raw) => {
    const input = raw.trim();
    if (input === '') return { input: raw, result: null, error: false };
    try {
      const result = evaluate(input);
      const finite = Number.isFinite(result);
      return { input: raw, result: finite ? result : null, error: !finite };
    } catch {
      return { input: raw, result: null, error: true };
    }
  });
}

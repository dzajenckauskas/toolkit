import { describe, expect, it } from 'vitest';
import { convertCase, words } from './case-convert';

describe('case-convert', () => {
  it('splits words across separators and camel boundaries', () => {
    expect(words('myXMLFile name-here')).toEqual(['my', 'XML', 'File', 'name', 'here']);
  });

  it('produces each case', () => {
    const input = 'hello world';
    expect(convertCase(input, 'upper')).toBe('HELLO WORLD');
    expect(convertCase(input, 'title')).toBe('Hello World');
    expect(convertCase(input, 'camel')).toBe('helloWorld');
    expect(convertCase(input, 'pascal')).toBe('HelloWorld');
    expect(convertCase(input, 'snake')).toBe('hello_world');
    expect(convertCase(input, 'kebab')).toBe('hello-world');
    expect(convertCase(input, 'constant')).toBe('HELLO_WORLD');
  });

  it('makes a sentence from mixed input', () => {
    expect(convertCase('the QUICK brown-fox', 'sentence')).toBe('The quick brown fox');
  });

  it('handles empty input', () => {
    expect(convertCase('', 'camel')).toBe('');
    expect(convertCase('   ', 'sentence')).toBe('');
  });
});

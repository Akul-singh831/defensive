declare module "bun:test" {
  export function describe(name: string, fn: () => void | Promise<void>): void;
  export function it(name: string, fn: () => void | Promise<void>): void;
  export function test(name: string, fn: () => void | Promise<void>): void;
  export function expect(actual: any): {
    toBe(expected: any): void;
    toEqual(expected: any): void;
    toBeUndefined(): void;
    not: {
      toThrow(error?: any): void;
      toBe(expected: any): void;
    };
    toThrow(error?: any): void;
    toContain(expected: string): void;
  };
}

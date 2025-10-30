// Lightweight facade to avoid pulling full Convex server types into the web TS build
// at compile time. Runtime references still use the generated API names.
// Types are intentionally 'any' to prevent typecheck coupling to server code.
export const api: any = {} as any;
export const internal: any = {} as any;

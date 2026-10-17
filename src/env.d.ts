// Bundlers replace `process.env.NODE_ENV` at build time; declare it so dev-only
// warnings type-check without pulling @types/node into the library.
declare const process: { env: { NODE_ENV?: string } } | undefined;

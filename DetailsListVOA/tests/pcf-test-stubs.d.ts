/**
 * Minimal stub declarations for the PCF ComponentFramework global namespace,
 * used only in the Jest test environment. These stubs silence TypeScript errors
 * when test files import from service modules (e.g. DataService.ts) that
 * reference PCF types. They do NOT need to be accurate — they just need to
 * satisfy the type-checker so the pure functions under test can compile.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
declare namespace ComponentFramework {
  type Context<T = any> = any;
  namespace PropertyHelper {
    namespace DataSetApi {
      type EntityRecord = any;
    }
  }
}

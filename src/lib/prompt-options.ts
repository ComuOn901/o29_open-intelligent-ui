import type { PromptOptions } from "@openuidev/react-lang";

/**
 * The OpenUI Lang 1.0 features the library uses: $variables with @Set and
 * @Reset, and the built-in functions. No tools yet. Examples and extra rules
 * for the primitives wait until the language variant is decided.
 */
export const promptOptions: PromptOptions = { bindings: true };

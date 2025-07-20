# Copilot Instructions: General
- Don't use inline if statements
```ts
// Prefer this:
if (earlyExitCondition) {
  return;
}
// Avoid this:
if (earlyExitCondition) return;
```
- Do not add new code to an existing file at the top of the file, unless that's where it's intended to go.

# Copilot Instructions: Client

## Project Context
- Vue 3 project using Vite and Naive UI.
- TypeScript is used for all new code.

## Rules & Best Practices
Follow the rules below for all code suggestions.
- Use composition API (`<script setup>`) for Vue components.
- Use Naive UI components for UI elements.
- Keep components small and focused.
- Style with scoped CSS in each component.
- Use rem units for sizing and spacing instead of px.
- Use async/await for API calls.
- Follow existing code style and naming conventions.
- Do not include backend logic in client code.
- Do not hardcode sensitive data or API keys.


# Copilot Instructions: Backend

## Project Context
- Node.js backend using Express.
- TypeScript is used for all new code.

## Rules & Best Practices
- Use async/await for asynchronous operations.
- Organize code by feature.
- Do not include frontend logic in backend code.
- Use environment variables for secrets and configuration.
- Follow existing code style and naming conventions.
- Write tests for new features.
- Do not expose sensitive information in logs or errors.

/**
 * Public API for the SSE module.
 * This file exports only the components, hooks, utilities and types that should be
 * accessible to other parts of the application.
 */

// Main service for sending SSE events
export { sseService } from "./services/sse-service";

// Manager for direct SSE connection management (advanced usage)
export { sseManager } from "./services/sse-manager";

// Utilities for SSE implementation
export * from "./utils/sse-helpers";

// Public types
export * from "./types";
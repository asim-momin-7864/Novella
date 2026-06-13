// src/config/zod.config.ts
import * as z from 'zod';
import { createErrorMap } from 'zod-validation-error';

// This overrides the global error map for every schema across your entire codebase
z.config({
  customError: createErrorMap(),
});

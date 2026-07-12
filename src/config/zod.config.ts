//* zod config file

import * as z from 'zod';
import { createErrorMap } from 'zod-validation-error';

// change zod error with zod-validatrion-error pkg
z.config({
  customError: createErrorMap(),
});

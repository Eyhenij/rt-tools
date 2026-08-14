import { backendConfig } from '../../../../eslint/backend.config.mjs';
import baseConfig from '../../../../eslint.config.mjs';

export default [...baseConfig, ...backendConfig];

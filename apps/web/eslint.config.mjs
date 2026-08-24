import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettier,
  {
    ignores: ['node_modules/**', '.next/**', 'playwright-report/**', 'test-results/**'],
  },
  {
    // eslint-config-next 16 ships a much stricter, React Compiler-era
    // eslint-plugin-react-hooks (v6) that newly flags ~20 pre-existing
    // patterns across 13 files (setState-in-effect, ref access during
    // render, purity). None of these are regressions from this upgrade —
    // downgraded to warn here so the Next 16 bump doesn't have to carry a
    // 13-file behavioral cleanup. Tracked as follow-up; see PROJECT-STATE.
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/purity': 'warn',
    },
  },
];

export default eslintConfig;

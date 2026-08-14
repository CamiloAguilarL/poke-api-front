import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['dist/**', 'coverage/**', 'playwright-report/**', 'test-results/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/require-default-prop': 'off',
      'vue/no-v-html': 'off',
    },
  },
  {
    files: ['**/*.{ts,vue}'],
    rules: {
      'no-undef': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['src/**/*.{ts,vue}'],
    ignores: ['src/components/ui/**/*.{ts,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'vue-router',
              importNames: ['RouterLink'],
              message: 'Usa el componente Link de @/components/ui/link.',
            },
            {
              name: 'vue-sonner',
              message: 'Usa la capa centralizada @/components/ui/sonner.',
            },
          ],
        },
      ],
      'vue/no-restricted-html-elements': [
        'error',
        {
          element: ['button', 'input', 'select', 'textarea', 'a', 'label'],
          message: 'Usa un primitive de @/components/ui; los controles nativos solo viven allí.',
        },
      ],
    },
  },
  eslintConfigPrettier,
)

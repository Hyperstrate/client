/* eslint-disable @typescript-eslint/ban-ts-comment */
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
//@ts-ignore
import pluginVuePug from 'eslint-plugin-vue-pug'
import { globalIgnores } from 'eslint/config'

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
    rules: {
      complexity: ['error', 18],
      'no-template-curly-in-string': 'warn',
      '@typescript-eslint/no-use-before-define': ['error', { functions: false }],
      '@typescript-eslint/unbound-method': ['off'],
      'max-len': ['error', { code: 160, tabWidth: 2 }],
    },
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**', 'src/__generated__/*']),

  pluginVue.configs['flat/recommended'],
  pluginVuePug.configs['flat/recommended'],
  vueTsConfigs.recommendedTypeChecked,
  {
    files: ['**/*.{ts,vue}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
    },
  },
  {
    files: ['**/*.{ts,tsx,vue}'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: true,
          allowConciseArrowFunctionExpressionsStartingWithVoid: true,
        },
      ],
      '@typescript-eslint/parameter-properties': [
        'error',
        {
          allow: ['private', 'protected', 'public', 'private readonly', 'protected readonly', 'public readonly'],
        },
      ],
      '@typescript-eslint/require-await': 'off',
    },
  },
  eslintPluginPrettierRecommended,
)

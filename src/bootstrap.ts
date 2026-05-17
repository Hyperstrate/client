import container from '@/util/container'
import { once } from 'lodash-es'
import { type Builder } from './util/container/builder'

export default once(() => container(import.meta.glob('./features/**/*.builder.ts') as Record<string, () => Promise<{ default: Builder }>>))

import { AGENTS } from '@/features/core/container'
import type { Agent } from '@/features/core/model'
import { Mixins } from '@/util/mixin'
import { Component } from 'vue-facing-decorator'
import ContainerMixin from './container.mixin'

const UNKNOWN_AGENT: Agent = {
  name: 'unknown',
  label: 'Unknown agent',
  shortLabel: 'Unknown',
  category: 'agent',
}

function normalizeAgent(value: string | undefined): string {
  return (value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s.-]+/g, '_')
}

@Component
export default class AgentsMixin extends Mixins(ContainerMixin) {
  protected get agents(): Agent[] {
    try {
      return this.container(AGENTS)
    } catch {
      return []
    }
  }

  protected resolveAgent(agent: string | undefined): Agent {
    const normalized = normalizeAgent(agent)
    const fallback = this.agents.find((candidate) => normalizeAgent(candidate.name) === UNKNOWN_AGENT.name) ?? UNKNOWN_AGENT
    if (!normalized) return fallback

    const known = this.agents.find((candidate) => {
      const names = [candidate.name, ...(candidate.aliases ?? [])].map(normalizeAgent)
      return names.includes(normalized)
    })

    return (
      known ?? {
        ...fallback,
        name: normalized,
        label: agent || fallback.label,
        shortLabel: agent || fallback.shortLabel,
      }
    )
  }
}

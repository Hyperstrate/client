import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { definition as claudeCode } from '@/features/agents/claude-code/claude-code.builder'
import { definition as githubCopilot } from '@/features/agents/github-copilot/github-copilot.builder'
import { definition as openclaw } from '@/features/agents/openclaw/openclaw.builder'
import { definition as unknown } from '@/features/agents/unknown/unknown.builder'
import { AGENTS, CONTAINER } from '@/features/core/container'
import AgentBadge from './AgentBadge.global.vue'

const agents = [claudeCode, githubCopilot, openclaw, unknown]

const global = {
  provide: {
    [CONTAINER]: (name: string) => {
      if (name === AGENTS) return agents
      throw new Error(`${name} not found`)
    },
  },
  stubs: {
    UiTooltip: { props: ['content'], template: '<div :data-content="content"><slot /></div>' },
    UiIcon: { props: ['icon'], template: '<span data-test="icon" />' },
  },
}

describe('AgentBadge', () => {
  it('renders only the icon for a known alias', () => {
    const wrapper = mount(AgentBadge, { props: { agent: 'copilot' }, global })

    expect(wrapper.find('[data-test="icon"]').exists()).toBe(true)
    expect(wrapper.text()).toBe('')
    expect(wrapper.attributes('data-content')).toBe('GitHub Copilot (copilot)')
  })

  it('resolves dashed and underscored aliases without visible text', () => {
    const wrapper = mount(AgentBadge, { props: { agent: 'open_claw' }, global })

    expect(wrapper.find('[data-test="icon"]').exists()).toBe(true)
    expect(wrapper.text()).toBe('')
    expect(wrapper.attributes('data-content')).toBe('OpenClaw (open_claw)')
  })

  it('uses the unknown icon for new agents', () => {
    const wrapper = mount(AgentBadge, { props: { agent: 'new_agent' }, global })

    expect(wrapper.find('[data-test="icon"]').exists()).toBe(true)
    expect(wrapper.text()).toBe('')
    expect(wrapper.attributes('data-content')).toBe('new_agent (new_agent)')
  })
})

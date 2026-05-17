<template lang="pug">
story(title="SectionCard")
  variant(title="All colors")
    div(class="grid grid-cols-2 gap-4 p-4")
      domain-ui-section-card(
        to="/models"
        icon="cogs"
        title="Models"
        description="Manage your AI model registrations and API keys."
        pill-label="Admin"
        :pill-variant="Variant.Gray"
        color="gray"
      )
      domain-ui-section-card(
        to="/routers"
        icon="arrow-right"
        title="Routers"
        description="Create intelligent routing pipelines for inference."
        pill-label="Core"
        :pill-variant="Variant.Blue"
        color="blue"
      )
      domain-ui-section-card(
        to="/auth"
        icon="key"
        title="Auth"
        description="Teams, API keys and virtual keys."
        pill-label="Security"
        :pill-variant="Variant.Green"
        color="green"
      )
      domain-ui-section-card(
        to="/analytics"
        icon="bar-chart"
        title="Analytics"
        description="Inference logs, latency, and cost breakdowns."
        pill-label="Insights"
        :pill-variant="Variant.Indigo"
        color="indigo"
      )
      domain-ui-section-card(
        to="/prompts"
        icon="document-text"
        title="Prompts"
        description="Manage versioned prompt templates."
        pill-label="Templates"
        :pill-variant="Variant.Purple"
        color="purple"
      )
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'
import { Variant } from '@/features/ui/clickables/model'

@Component
export default class SectionCardStory extends Vue {
  private Variant = Variant
}
</script>

<template lang="pug">
story(title="EmptyState")
  variant(title="Heading only")
    ui-empty-state(heading="No results found")
  variant(title="With subheading")
    ui-empty-state(heading="No models registered" subheading="Add a model to get started")
  variant(title="Long text")
    ui-empty-state(heading="No inference logs available" subheading="Logs will appear here once you start sending requests through a router")
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class EmptyStateStory extends Vue {}
</script>

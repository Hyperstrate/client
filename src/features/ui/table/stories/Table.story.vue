<template lang="pug">
story(title="Table")
  variant(title="Default")
    ui-table(:rows="users" :columns="columns")
  variant(title="Empty state")
    ui-table(:rows="[]" :columns="columns" empty-message="No users found")
  variant(title="Loading")
    ui-table(:rows="[]" :columns="columns" :loading="true")
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class TableStory extends Vue {
  users = [
    { id: '1', name: 'Alice Martin', email: 'alice@example.com', role: 'Admin' },
    { id: '2', name: 'Bob Chen', email: 'bob@example.com', role: 'Editor' },
    { id: '3', name: 'Carol Smith', email: 'carol@example.com', role: 'Viewer' },
  ]

  columns = [
    { name: 'name', label: 'Name' },
    { name: 'email', label: 'Email' },
    { name: 'role', label: 'Role' },
  ]
}
</script>

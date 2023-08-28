<template>
  <v-card
    :title="application.name"
    :prepend-avatar="application.logo"
  ></v-card>

  <v-list>
    <v-list-item
      v-for="need of authorization.accessNeedGroup.needs"
      :title="need.shapeTree.label"
      :subtitle="need.label"
      lines="three"
    >
      <v-list v-if="need.children">
        <v-list-item
          v-for="child in need.children"
          :title="child.shapeTree.label"
          :subtitle="child.label"
        > </v-list-item>
      </v-list>
    </v-list-item>
  </v-list>
</template>

<script lang="ts" setup>
import { Application, AuthorizationData } from '@janeirodigital/sai-api-messages';

defineProps<{
  application: Partial<Application>
  authorization: AuthorizationData
}>()

</script>

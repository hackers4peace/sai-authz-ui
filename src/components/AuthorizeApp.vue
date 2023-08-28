<template>
  <v-card
    :title="application.name"
    :prepend-avatar="application.logo"
  >
    <v-card-text>
      <v-list>
        <v-list-item
          v-for="need of authorizationData.accessNeedGroup.needs"
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
    </v-card-text>
    <div class="px-2 d-flex justify-space-between">
      <v-btn
        color="error"
        variant="tonal"
        :loading="loadingDeny"
        :disabled="loadingAuthorize"
        @click="authorize(false)"
      >Deny</v-btn>
      <v-btn
        color="primary"
        variant="flat"
        size="large"
        :loading="loadingAuthorize"
        :disabled="loadingDeny"
        @click="authorize()"
      >Authorize</v-btn>
    </div>
  </v-card>
</template>

<script lang="ts" setup>
import { AccessNeed, Application, Authorization, AuthorizationData, BaseAuthorization, DataAuthorization } from '@janeirodigital/sai-api-messages';
import { ref, watch } from 'vue';
import { useAppStore } from '@/store/app'

const appStore = useAppStore()

const props = defineProps<{
  application: Partial<Application>
  authorizationData: AuthorizationData
}>()

const loadingAuthorize = ref(false)
const loadingDeny = ref(false)

function getScope(accessNeed: AccessNeed): string {
  if (accessNeed.parent) return 'Inherited'
  // TODO based on user input
  return 'All'
}

// TODO use case when there is a `parent` access need
function createDataAuthorizations(accessNeed: AccessNeed, parent?: AccessNeed): DataAuthorization[] {
  const dataAuthorization = {
    accessNeed: accessNeed.id,
    scope: getScope(accessNeed),
  } as DataAuthorization
  let children: DataAuthorization[] = []
  if (accessNeed.children) {
    children = accessNeed.children.flatMap(childAccessNeed => createDataAuthorizations(childAccessNeed, accessNeed))
  }

  return [ dataAuthorization, ...children]
}

function authorize(granted = true) {
  loadingAuthorize.value = granted
  loadingDeny.value = !granted
  if (props.authorizationData) {
    let authorization: Authorization
    const baseAuthorization = {
      grantee: props.authorizationData.id,
      accessNeedGroup: props.authorizationData.accessNeedGroup.id,
    } as BaseAuthorization;
    if (granted) {
      authorization =  {
        ...baseAuthorization,
        dataAuthorizations: props.authorizationData.accessNeedGroup.needs.flatMap(accessNeed => createDataAuthorizations(accessNeed)),
        granted: true,
      }
    } else {
      authorization =  {
        ...baseAuthorization,
        granted: false,
      }
    }
    appStore.authorizeApp(authorization)
  }
}

watch(
  () => appStore.accessAuthorization,
  accessAuthorization => {
    if (accessAuthorization) window.location.href = accessAuthorization.callbackEndpoint
  }
)
</script>

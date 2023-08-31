<template>
  <v-card
    :title="application.name"
    :prepend-avatar="application.logo"
  >
    <v-card-text>
      <v-list
        v-for="need of authorizationData.accessNeedGroup.needs"
      >
        <v-list-item
          lines="three"
          @click="toggleSelect(need.id)"
        >
          <v-list-item-title>
            <v-icon :icon="chooseIcon(need.access)"></v-icon>
            {{ need.shapeTree.label}}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ need.label }}
          </v-list-item-subtitle>
          <template v-slot:append>
            <v-list-item-action end>
              <v-checkbox-btn
                :model-value="isSelected(need.id)"
                :disabled="need.required"
                @click.prevent
              ></v-checkbox-btn>
            </v-list-item-action>
          </template>
        </v-list-item>
        <v-list-item
          class="ml-3"
          v-if="need.children"
          v-for="child in need.children"
          lines="three"
          @click="toggleSelect(need.id, child.id)"
        >
          <v-list-item-title>
            <v-icon :icon="chooseIcon(child.access)"></v-icon>
            {{ child.shapeTree.label}}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ child.label }}
          </v-list-item-subtitle>
        <template v-slot:append>
          <v-list-item-action end>
            <v-checkbox-btn
              :model-value="isSelected(need.id, child.id)"
              :disabled="child.required"
              @click.prevent
            ></v-checkbox-btn>
          </v-list-item-action>
        </template>
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
import { AccessModes, AccessNeed, Application, Authorization, AuthorizationData, BaseAuthorization, DataAuthorization } from '@janeirodigital/sai-api-messages';
import { reactive, ref, watch } from 'vue';
import { useAppStore } from '@/store/app'

const appStore = useAppStore()

const props = defineProps<{
  application: Partial<Application>
  authorizationData: AuthorizationData
}>()

const loadingAuthorize = ref(false)
const loadingDeny = ref(false)
const selection = reactive({
  needs: props.authorizationData.accessNeedGroup.needs.map(n => ({
    id: n.id,
    required: n.required,
    selected: true,
    children: n.children?.map(c => ({
      id: c.id,
      required: c.required,
      selected: true
    }))
  }))
})

function toggleSelect(needId: string, childId?: string): void {
  const need = selection.needs.find(n => n.id == needId)!
  if (childId) {
    const child = need.children?.find(n => n.id == childId)!
    if (child.required) return
    child.selected = !child.selected
  } else {
    if (need.required) return
    need.selected = !need.selected
  }
}

function isSelected(needId: string, childId?: string): boolean {
  const need = selection.needs.find(n => n.id == needId)!
  if (childId) {
    const child = need.children?.find(n => n.id == childId)!
    return child.selected
  } else {
    return need.selected
  }
}

function chooseIcon(access: string[]): string {
  if(access.includes(AccessModes.Update)) {
    return 'mdi-square-edit-outline'
  } else {
    return 'mdi-euey-outline'
  }
}

function getScope(accessNeed: AccessNeed): string {
  if (accessNeed.parent) return 'Inherited'
  // TODO based on user input
  return 'All'
}

// TODO use case when there is a `parent` access need
function createDataAuthorizations(accessNeed: AccessNeed, parent?: AccessNeed): DataAuthorization[] {
  if (parent) {
    if (!isSelected(parent.id, accessNeed.id)) return []
  } else {
    if (!isSelected(accessNeed.id)) return []
  }
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

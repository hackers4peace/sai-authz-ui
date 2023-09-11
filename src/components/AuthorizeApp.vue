<style>
#panel-hell .v-expansion-panel-text__wrapper {
  padding: 8px 0px 16px;
}

#panel-hell .v-expansion-panel-title {
  padding: 16px 16px;
}

span.label {
  padding-left: 6px;
}
</style>
<template>
  <v-card
    :title="application.name"
    :prepend-avatar="application.logo"
  >
    <v-card-text>
      <v-list-item
        lines="three"
        @click="toggleSelect(accessNeed.id)"
      >
        <v-list-item-title>
          <v-icon :icon="chooseIcon(accessNeed.access)"></v-icon>
          {{ accessNeed.shapeTree.label}}
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ accessNeed.label }}
        </v-list-item-subtitle>
        <template v-slot:append>
          <v-list-item-action end>
            <v-checkbox-btn
              :model-value="isSelected(accessNeed.id)"
              :disabled="accessNeed.required"
              @click.prevent
            ></v-checkbox-btn>
          </v-list-item-action>
        </template>
      </v-list-item>
      <v-list>
        <v-list-item
          class="ml-3"
          v-for="child in accessNeed.children"
          lines="three"
          @click="toggleSelect(accessNeed.id, child.id)"
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
                :model-value="isSelected(accessNeed.id, child.id)"
                :disabled="child.required"
                @click.prevent
              ></v-checkbox-btn>
            </v-list-item-action>
          </template>
        </v-list-item>
      </v-list>
      <v-expansion-panels id="panel-hell" variant="popout">
        <v-expansion-panel>
        <v-expansion-panel-title class="d-flex flex-row">
          <span class="flex-grow-1">All</span>
          <v-chip
            color="agent"
            label
          >{{ agentsSharingWithMe.length }}</v-chip>
          <template v-slot:actions>
            <v-badge
              color="agent"
              :content="statsForTopLevel()"
              :model-value="topLevelScope === 'some'"
            >
              <v-checkbox-btn
                disabled
                :indeterminate="topLevelScope === 'some'"
                :model-value="topLevelScope === 'all'"
                @click.prevent
              ></v-checkbox-btn>
            </v-badge>
          </template>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-btn-toggle
            v-model="topLevelScope"
            rounded="false"
            variant="outlined"
            mandatory
            class="d-flex flex-row"
            >
            <v-btn class="flex-grow-1" icon="mdi-checkbox-blank-outline" value="none"></v-btn>
            <v-btn class="flex-grow-1" icon="mdi-minus-box-outline" value="some"></v-btn>
            <v-btn class="flex-grow-1" icon="mdi-checkbox-outline" value="all"></v-btn>
          </v-btn-toggle>
          <v-expansion-panels variant="popout">
            <v-expansion-panel
              v-for="agent in agentsSharingWithMe"
              :disabled="topLevelScope !== 'some'"
            >
            <v-expansion-panel-title class="d-flex flex-row">
              <template v-if="agent.id === coreStore.userId">
                <v-icon  color="agent" icon="mdi-account-circle"></v-icon>
                <span class="label flex-grow-1">Me</span>
              </template>
              <template v-else>
                <v-icon color="agent" icon="mdi-account-circle-outline"></v-icon>
                <span class="label flex-grow-1">{{ agent.label }}</span>
              </template>
              <v-chip
                color="primary"
                label
              >{{ agent.registrations.length }}</v-chip>
              <template v-slot:actions>
                <v-badge
                  color="primary"
                  :content="statsForAgent(agent.id)"
                  :model-value="agentsIndex[agent.id].scope === 'some'"
                >
                  <v-checkbox-btn
                    disabled
                    :indeterminate="agentsIndex[agent.id].scope === 'some'"
                    :model-value="agentsIndex[agent.id].scope === 'all'"
                    @click.prevent
                  ></v-checkbox-btn>
                </v-badge>
              </template>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-btn-toggle
                :model-value="agentsIndex[agent.id].scope"
                @update:model-value="agentScopeChanged(agent.id, $event)"
                rounded="false"
                variant="outlined"
                mandatory
                class="d-flex flex-row"
                >
                <v-btn class="flex-grow-1" icon="mdi-checkbox-blank-outline" value="none"></v-btn>
                <v-btn class="flex-grow-1" icon="mdi-minus-box-outline" value="some"></v-btn>
                <v-btn class="flex-grow-1" icon="mdi-checkbox-outline" value="all"></v-btn>
              </v-btn-toggle>
              <v-expansion-panels variant="popout">
                <v-expansion-panel
                  v-for="registration in agent.registrations"
                  :disabled="agentsIndex[agent.id].scope !== 'some'"
                >
                <v-expansion-panel-title class="d-flex flex-row">
                  <v-icon  color="primary" icon="mdi-hexagon-outline"></v-icon>
                  <span class="label flex-grow-1">{{ registration.label }}</span>
                  <v-chip
                    color="secondary"
                    label
                  >{{ registration.count }}</v-chip>
                  <template v-slot:actions>
                    <v-badge
                      color="secondary"
                      :content="statsForRegistration(registration.id)"
                      :model-value="registrationsIndex[registration.id].scope === 'some'"
                    >
                      <v-checkbox-btn
                        disabled
                        :indeterminate="registrationsIndex[registration.id].scope === 'some'"
                        :model-value="registrationsIndex[registration.id].scope === 'all'"
                        @click.prevent
                      ></v-checkbox-btn>
                    </v-badge>
                  </template>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-btn-toggle
                    :model-value="registrationsIndex[registration.id].scope"
                    @update:model-value="registrationScopeChanged(agent.id, registration.id, $event)"
                    rounded="false"
                    variant="outlined"
                    mandatory
                    class="d-flex flex-row"
                    >
                    <v-btn class="flex-grow-1" icon="mdi-checkbox-blank-outline" value="none"></v-btn>
                    <v-btn class="flex-grow-1" icon="mdi-minus-box-outline" value="some"></v-btn>
                    <v-btn class="flex-grow-1" icon="mdi-checkbox-outline" value="all"></v-btn>
                  </v-btn-toggle>
                  <template v-if="registrationsIndex[registration.id].scope === 'some'">
                    <v-list v-if="dataInstancesLoaded(registration.id)">
                      <v-list-item
                        v-for="dataInstance of loadedDataInstances[registration.id]"
                        :key="dataInstance.id"
                        :disabled="registrationsIndex[registration.id].scope !== 'some'"
                        @click="toggleOneInstance(dataInstance.id)"
                        >
                        <v-list-item-title>
                          <v-icon color="secondary" icon="mdi-star-three-points-outline"></v-icon>
                          {{ dataInstance.label }}
                        </v-list-item-title>
                        <template v-slot:append>
                          <v-list-item-action>
                            <v-checkbox-btn
                              v-model="dataInstancesIndex[dataInstance.id].selected"
                              :disabled="registrationsIndex[registration.id].scope !== 'some'"
                              @click.prevent
                            ></v-checkbox-btn>
                          </v-list-item-action>
                        </template>
                      </v-list-item>
                    </v-list>
                    <v-skeleton-loader
                      v-else
                      type="list-item@2"
                    ></v-skeleton-loader>
                  </template>
                </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
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
        color="success"
        variant="flat"
        size="large"
        :loading="loadingAuthorize"
        :disabled="loadingDeny || statsForTopLevel() === 0"
        @click="authorize()"
      >Authorize</v-btn>
    </div>
  </v-card>
</template>

<script lang="ts" setup>
import { AccessModes, AccessNeed, Application, Authorization, AuthorizationData, BaseAuthorization, DataAuthorization } from '@janeirodigital/sai-api-messages';
import { reactive, ref, watch } from 'vue';
import { useCoreStore } from '@/store/core'
import { useAppStore } from '@/store/app'

const coreStore = useCoreStore()
const appStore = useAppStore()

const agentsSharingWithMe = [
  {
    id: 'http://localhost:3000/alice/profile/card#me',
    label: 'Alice',
    registrations: [
      {
        id: 'https://home.alice.example',
        label: 'Home',
        count: 1,
        dataInstances: [
          {
            id: 'https://home.alice.example/project-b',
            label: 'Project X'
          }
        ]
      }
    ]
  },
  {
    id: 'https://acme.example',
    label: 'ACME',
    registrations: [
      {
        id: 'https://rnd.acme.example',
        label: 'RnD',
        count: 2,
        dataInstances: [
          {
            id: 'https://rnd.acme.example/project-1',
            label: 'Project 1'
          },
          {
            id: 'https://rnd.acme.example/project-2',
            label: 'Project 2'
          }
        ]
      },
      {
        id: 'https://hr.acme.example',
        label: 'Human Resources',
        count:  2,
        dataInstances: [
          {
            id: 'https://hr.acme.example/project-a',
            label: 'Project A'
          },
          {
            id: 'https://hr.acme.example/project-b',
            label: 'Project B'
          }
        ]
      }
    ]
  },
  {
    id: 'https://bob.example',
    label: 'Bob',
    registrations: [
      {
        id: 'https://work.bob.example',
        label: 'Work',
        count: 1,
        dataInstances: [
          {
            id: 'https://work.bob.example/project-b',
            label: 'Project X'
          }
        ]
      }
    ]
  },
  {
    id: 'https://kim.example',
    label: 'Kim',
    registrations: [
      {
        id: 'https://home.kim.example',
        label: 'Home',
        count: 1,
        dataInstances: [
          {
            id: 'https://home.kim.example/project-b',
            label: 'Project Z'
          }
        ]
      }
    ]
  }
]

const loadedDataInstances: Record<string, {id: string, label: string}[]> = {}

// TODO: remove once data comes from API
async function fetchDataInstances(registrationId: string): Promise<{ id: string, label: string }[]> {
  await new Promise(resolve => setTimeout(resolve, 1000))
  for (const agent of agentsSharingWithMe) {
    for (const registration of agent.registrations) {
      if (registration.id === registrationId) return registration.dataInstances
    }
  }
  return []
}

type PropagatingScope =  'none' | 'all'
type Scope = PropagatingScope | 'some'

interface Agent {
  id: string
  scope: Scope
}

// TODO: add proper type from sai-api-messages
function buildAgentsIndex(data: typeof agentsSharingWithMe): Record<string, Agent> {
  const index: Record<string, Agent> = {}
  for (const agent of data) {
    index[agent.id] = {
      id: agent.id,
      scope: 'all',
    }
  }
  return index
}

const agentsIndex = reactive<Record<string, Agent>>(buildAgentsIndex(agentsSharingWithMe))

interface Registration {
  id: string
  agent: string
  scope: Scope,
  count: number
}

// TODO: add proper type from sai-api-messages
function buildRegistrationsIndex(data: typeof agentsSharingWithMe): Record<string, Registration> {
  const index: Record<string, Registration> = {}
  for (const agent of data) {
    for (const registration of agent.registrations) {
      index[registration.id] = {
        id: registration.id,
        agent: agent.id,
        scope: 'all',
        count: registration.count
      }
    }
  }
  return index
}

const registrationsIndex = reactive<Record<string, Registration>>(buildRegistrationsIndex(agentsSharingWithMe))

interface DataInstance {
  id: string
  registration: string
  agent: string
  selected:boolean
}

const dataInstancesIndex = reactive<Record<string, DataInstance>>({})

// TODO: add proper type from sai-api-messages
function addDataInstancesToIndex(
  agentId: string,
  registrationId: string,
  dataInstances: { id: string, label: string }[],
  selected: boolean
  ): void {
      for (const dataInstance of dataInstances) {
        dataInstancesIndex[dataInstance.id] = {
          id: dataInstance.id,
          registration: registrationId,
          agent: agentId,
          selected
        }
  }
}

function findAgentRegistrations(agentId: string): Registration[] {
  return Object.values(registrationsIndex).filter(registration => registration.agent === agentId)
}
function findRegistrationDataInstances(registrationId: string): DataInstance[] {
  return Object.values(dataInstancesIndex).filter(dataInstance => dataInstance.registration === registrationId)
}

const topLevelScope = ref<Scope>('all')

watch(topLevelScope, (newScope) => {
  if (newScope !== 'some') {
    setScopeForAgents(newScope)
  }
})

function setScopeForAgents(scope: PropagatingScope): void {
  for (const agent of Object.values(agentsIndex)) {
    agent.scope = scope
  }
}

function agentScopeChanged(agentId: string, scope: Scope) {
  if (scope !== 'some') {
    setScopeForAgentRegistrations(agentId, scope)
  }
  agentsIndex[agentId].scope = scope
}

function setScopeForAgentRegistrations(agentId: string, scope: PropagatingScope): void {
  const registrations = findAgentRegistrations(agentId)
  for (const registration of registrations) {
    registration.scope = scope
  }
}

// TODO optimise for empty data registrations
function dataInstancesLoaded(registrationId: string): boolean {
  return Object.values(dataInstancesIndex).some(i => i.registration == registrationId)
}

function registrationScopeChanged(agentId: string, registrationId: string, scope: Scope) {
  if (scope !== 'some') {
    setSelectedForRegistrationInstances(registrationId, scope === 'all')
  } else if (!dataInstancesLoaded(registrationId)) {
    const previousScope = registrationsIndex[registrationId].scope
    loadDataInstances(agentId, registrationId, previousScope === 'all')
  }
  registrationsIndex[registrationId].scope = scope
}

async function loadDataInstances(agentId: string, registrationId:string, selected:boolean): Promise<void> {
  const dataInstances = await fetchDataInstances(registrationId)
  loadedDataInstances[registrationId] = dataInstances
  addDataInstancesToIndex(agentId, registrationId, dataInstances, selected)
}

function setSelectedForRegistrationInstances(registrationId: string, selected: boolean): void {
  const dataInstances = findRegistrationDataInstances(registrationId)
  for (const dataInstance of dataInstances) {
    if (dataInstance.registration === registrationId) {
      dataInstance.selected = selected
    }
  }
}

function toggleOneInstance(instanceId: string) {
  const instance = dataInstancesIndex[instanceId]
  const registration = registrationsIndex[instance.registration]
  if (registration.scope === 'some') { // UI is also disabling the element
    dataInstancesIndex[instanceId].selected = !dataInstancesIndex[instanceId].selected
  }
}

function statsForTopLevel(): number {
  if (topLevelScope.value === 'none') {
    return 0
  } else {
    const agents = Object.values(agentsIndex)
    if (topLevelScope.value === 'all') {
      return agents.length
    } else {
      return agents.filter(agent => statsForAgent(agent.id)).length
    }
  }
}

function statsForAgent(agentId: string): number {
  const agent = agentsIndex[agentId]
  if (agent.scope === 'none') {
    return 0
  } else {
    const registrations = findAgentRegistrations(agentId)
    if (agent.scope === 'all') {
      return registrations.length
    } else {
      return registrations.filter(registration => statsForRegistration(registration.id)).length
    }
  }
}

function statsForRegistration(registrationId: string): number {
  const registration = registrationsIndex[registrationId]
  if (registration.scope === 'none') {
    return 0
  } else {
    const dataInstances = findRegistrationDataInstances(registration.id)
    if (registration.scope === 'all') {
      return dataInstances.length
    } else {
      return dataInstances.filter(dataInstance => dataInstance.selected).length
    }
  }
}

const props = defineProps<{
  application: Partial<Application>
  authorizationData: AuthorizationData
}>()

// TODO add stepper to support multiple top level access needs
const accessNeed = props.authorizationData.accessNeedGroup.needs[0]

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
  if (!parent && !isSelected(accessNeed.id)) return []
  if (parent && !isSelected(parent.id, accessNeed.id)) return []
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

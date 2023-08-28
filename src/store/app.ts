// Utilities
import { useBackend } from '@/backend'
import { Resource, AuthorizationData, SocialAgent, Application, ShareAuthorization, ShareAuthorizationConfirmation } from '@janeirodigital/sai-api-messages'
import { defineStore } from 'pinia'
import { ref } from 'vue'


export const useAppStore = defineStore('app', () => {
  const lang = ref('en')
  const resource = ref<Resource | null>(null)
  const shareAuthorizationConfirmation = ref<ShareAuthorizationConfirmation | null>(null)
  const authorization = ref<AuthorizationData | null>(null)
  const socialAgents = ref<SocialAgent[]>([])
  const application = ref<Partial<Application> | null>(null)

  const backend = useBackend()

  async function getResource (resourceId: string) {
    resource.value = await backend.getResource(resourceId, lang.value)
  }

  async function shareResource (shareAuthorization: ShareAuthorization) {
    shareAuthorizationConfirmation.value = await backend.shareResource(shareAuthorization)
  }

  async function getAuthoriaztion (clientId: string) {
    authorization.value = await backend.getAuthorization(clientId, lang.value)
  }

  async function getSocialAgents () {
    socialAgents.value = await backend.getSocialAgents()
  }

  async function getApplication (applicationId: string) {
    application.value = await backend.getApplication(applicationId)
  }

  return {
    lang,
    resource,
    authorization,
    socialAgents,
    application,
    shareAuthorizationConfirmation,
    getResource,
    shareResource,
    getAuthoriaztion,
    getSocialAgents,
    getApplication
  }
})

import { getDefaultSession } from "@inrupt/solid-client-authn-browser";
import { Application, AuthorizationData, DescriptionsRequest, DescriptionsResponse, DescriptionsResponseMessage, IRI, Request, Resource, ResourceRequest, ResourceResponse, ResponseMessage, ShareAuthorization, ShareAuthorizationConfirmation, ShareAuthorizationRequest, ShareAuthorizationResponse, ShareAuthorizationResponseMessage, SocialAgent, SocialAgentsRequest, SocialAgentsResponse, SocialAgentsResponseMessage, UnregisteredApplicationProfileRequest, UnregisteredApplicationProfileResponse } from "@janeirodigital/sai-api-messages";

const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL
const authnFetch = getDefaultSession().fetch;

export function useBackend() {

  return {
    checkServerSession,
    getResource,
    shareResource,
    getAuthorization,
    getSocialAgents,
    getApplication
  }
}

async function checkServerSession(): Promise<{isLoggedIn: boolean, redirectUrl?: string}> {
  const options = {
    method: 'POST'
  }
  const result = await authnFetch(`${backendBaseUrl}/login`, options)

  if (result.status === 204) {
    return {isLoggedIn: true}
  } else if (result.status === 200) {
    const {redirectUrl} = await result.json()
    return  {isLoggedIn: false, redirectUrl}
  } else {
    throw new Error(`login check failed, status = ${result.status}`)
  }
}

async function getDataFromApi<T extends ResponseMessage>(request: Request): Promise<T> {
  const commonOptions = {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        }
  }
  const options = {
    ...commonOptions,
    body: request.stringify()
  }
  const response = await authnFetch(`${backendBaseUrl}/api`, options)
  return (await response.json()) as T
}

async function getResource(resourceId: IRI, lang: string): Promise<Resource> {
  const request = new ResourceRequest(resourceId, lang)
  const data = await getDataFromApi<ResourceResponse>(request)
  const response = new ResourceResponse(data)
  return response.payload
}

async function getAuthorization(clientId: IRI, lang: string): Promise<AuthorizationData> {
  const request = new DescriptionsRequest(clientId, lang)
  const data = await getDataFromApi<DescriptionsResponseMessage>(request)
  const response = new DescriptionsResponse(data)
  return response.payload
}

async function getSocialAgents(): Promise<SocialAgent[]> {
  const request = new SocialAgentsRequest()
  const data = await getDataFromApi<SocialAgentsResponseMessage>(request)
  const response = new SocialAgentsResponse(data)
  return response.payload
}

async function getApplication(applicationId: IRI): Promise<Partial<Application>> {
  const request = new UnregisteredApplicationProfileRequest(applicationId)
  const data = await getDataFromApi<UnregisteredApplicationProfileResponse>(request)
  const response = new UnregisteredApplicationProfileResponse(data)
  return response.payload
}

async function shareResource(shareAuthorization: ShareAuthorization): Promise<ShareAuthorizationConfirmation> {
  const request = new ShareAuthorizationRequest(shareAuthorization)
  const data = await getDataFromApi<ShareAuthorizationResponseMessage>(request)
  const response = new ShareAuthorizationResponse(data)
  return response.payload
}

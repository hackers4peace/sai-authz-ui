import { getDefaultSession } from "@inrupt/solid-client-authn-browser";

const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL
const authnFetch = getDefaultSession().fetch;

export function useBackend() {

  return {
    checkServerSession
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

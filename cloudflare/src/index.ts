import { Container } from '@cloudflare/containers'

// Single global instance -- this backend is stateless-ish, not per-user/session,
// so there's no need for session affinity via getByName(userId).
const INSTANCE_NAME = 'singleton'

export class BackendContainer extends Container {
  defaultPort = 8080
  requiredPorts = [8080]
  sleepAfter = '10m'
  enableInternet = true
  pingEndpoint = '/healthz'
}

interface Env {
  BACKEND: DurableObjectNamespace<BackendContainer>
  ASSETS: Fetcher
  DATABASE_URL: string
  WEATHER_USER_AGENT: string
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const container = env.BACKEND.getByName(INSTANCE_NAME)

    // DATABASE_URL/WEATHER_USER_AGENT are Worker secrets, only readable here
    // at request time -- passed into the container's process env on start.
    // start() is idempotent if already running; startAndWaitForPorts() then
    // just waits for the port without re-issuing a start with default envVars.
    await container.start({
      envVars: {
        PORT: '8080',
        DATABASE_URL: env.DATABASE_URL,
        WEATHER_USER_AGENT: env.WEATHER_USER_AGENT,
      },
    })
    await container.startAndWaitForPorts()

    return container.fetch(request)
  },
}

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

  // Single entry point for starting with secrets -- setting this.envVars then
  // calling startAndWaitForPorts() means exactly one start() ever fires
  // (its own internal one). Calling start() explicitly first, then
  // startAndWaitForPorts() separately (which also calls start() internally),
  // risked two concurrent start attempts both binding :8080 in the same
  // container -- the loser crashing with "address already in use" (exit 1).
  async startWithEnv(envVars: Record<string, string>): Promise<void> {
    this.envVars = envVars
    await this.startAndWaitForPorts()
  }
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
    await container.startWithEnv({
      PORT: '8080',
      DATABASE_URL: env.DATABASE_URL,
      WEATHER_USER_AGENT: env.WEATHER_USER_AGENT,
    })

    return container.fetch(request)
  },
}

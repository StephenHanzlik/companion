export type TripStatus = 'planning' | 'active' | 'debriefed'

export interface Trip {
  id: string
  owner_id: string
  title: string
  zone: string | null
  status: TripStatus
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
}

export interface Plan {
  id: string
  trip_id: string
  objectives: string | null
  route: string | null
  avalanche_forecast: unknown
  weather_forecast: unknown
  hazards: unknown
  checklist: unknown
  signed_off_at: string | null
  created_at: string
  updated_at: string
}

export type ObservationType = 'weather' | 'terrain' | 'avalanche' | 'red_flag' | 'general'

export interface Observation {
  id: string
  trip_id: string
  created_by: string
  observation_type: ObservationType
  observed_at: string
  latitude: number | null
  longitude: number | null
  elevation_m: number | null
  notes: string | null
  data: unknown
  created_at: string
}

export type SnowTestType =
  | 'compression_test'
  | 'extended_column_test'
  | 'propagation_saw_test'
  | 'pit_profile'
  | 'other'

export interface SnowProfileTest {
  id: string
  trip_id: string
  observation_id: string | null
  created_by: string
  test_type: SnowTestType
  recorded_at: string
  latitude: number | null
  longitude: number | null
  elevation_m: number | null
  aspect: string | null
  slope_angle_deg: number | null
  results: unknown
  notes: string | null
  created_at: string
}

export interface Debrief {
  id: string
  trip_id: string
  summary: string | null
  decision_reflections: unknown
  lessons_learned: string | null
  submitted_at: string | null
  created_at: string
  updated_at: string
}

export interface ForecastPeriod {
  name: string
  temperature: number
  temperature_unit: string
  wind_speed: string
  wind_direction: string
  short_forecast: string
}

export interface WeatherSummary {
  city: string
  state: string
  elevation_m: number | null
  elevation_ft: number | null
  elevation_source: string
  station_id: string
  station_distance_mi: number | null
  observed_at: string
  conditions: string
  temp_c: number | null
  temp_f: number | null
  wind_kph: number | null
  relative_humidity_pct: number | null
  forecast: ForecastPeriod[]
}

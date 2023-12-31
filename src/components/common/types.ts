export enum PowerStationState {
  Working = 'WORKING',
  Stopped = 'STOPPED',
  Damaged = 'DAMAGED',
  Maintenance = 'MAINTENANCE'
}

export enum PowerStationType {
  WindTurbine = 'WIND_TURBINE',
  SolarPanel = 'SOLAR_PANEL'
}

export enum AggregationPeriodType {
  Minute = 'MINUTE',
  Hour = 'HOUR',
  Day = 'DAY'
}

export enum PowerStationCreationStatus {
  Success = 'success',
  Loading = 'loading',
  Error = 'error',
}

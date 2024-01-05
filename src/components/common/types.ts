export enum PowerStationState {
  Working = 'WORKING',
  Stopped = 'STOPPED',
  Damaged = 'DAMAGED',
  Maintenance = 'MAINTENANCE'
}

export const powerStationStateToString = (powerStationState: PowerStationState, capitalize?: boolean): string => {
  switch (powerStationState) {
    case PowerStationState.Working:
      return capitalize === true ? 'Uruchomiona' : 'uruchomiona'
    case PowerStationState.Stopped:
      return capitalize === true ? 'Zatrzymana' : 'zatrzymana'
    case PowerStationState.Damaged:
      return capitalize === true ? 'Uszkodzona' : 'uszkodzona'
    case PowerStationState.Maintenance:
      return capitalize === true ? 'W naprawie' : 'w naprawie'
  }
}

export enum PowerStationType {
  WindTurbine = 'WIND_TURBINE',
  SolarPanel = 'SOLAR_PANEL'
}

export const powerStationTypeToString = (powerStationType: PowerStationType, capitalize?: boolean): string => {
  switch (powerStationType) {
    case PowerStationType.WindTurbine:
      return capitalize === true ? 'wiatrowa' : 'Wiatrowa'
    case PowerStationType.SolarPanel:
      return capitalize === true ? 'Słoneczna' : 'słoneczna'
  }
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

export enum UserRole {
  Admin = 'ADMIN',
  User = 'USER',
  UserChangePassword = 'USER_SET_PASSWORD'
}

export const userRoleToString = (userRole: UserRole, capitalize?: boolean): string => {
  switch (userRole) {
    case UserRole.Admin:
      return capitalize === true ? 'Administrator' : 'administrator'
    case UserRole.User:
      return capitalize === true ? 'Pracownik' : 'pracownik'
    case UserRole.UserChangePassword:
      return ''
  }
}

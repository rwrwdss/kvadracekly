import * as migration_20260904_104126_initial from './20260904_104126_initial';
import * as migration_20260907_063800_tariffs_fleet from './20260907_063800_tariffs_fleet';
import * as migration_20260907_070102_calendar_stops from './20260907_070102_calendar_stops';

export const migrations = [
  {
    up: migration_20260904_104126_initial.up,
    down: migration_20260904_104126_initial.down,
    name: '20260904_104126_initial',
  },
  {
    up: migration_20260907_063800_tariffs_fleet.up,
    down: migration_20260907_063800_tariffs_fleet.down,
    name: '20260907_063800_tariffs_fleet',
  },
  {
    up: migration_20260907_070102_calendar_stops.up,
    down: migration_20260907_070102_calendar_stops.down,
    name: '20260907_070102_calendar_stops'
  },
];

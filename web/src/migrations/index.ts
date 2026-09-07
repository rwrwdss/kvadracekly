import * as migration_20260904_104126_initial from './20260904_104126_initial';
import * as migration_20260907_063800_tariffs_fleet from './20260907_063800_tariffs_fleet';
import * as migration_20260907_070102_calendar_stops from './20260907_070102_calendar_stops';
import * as migration_20260907_111500_voice_booking from './20260907_111500_voice_booking';
import * as migration_20260907_131500_catalog_layout from './20260907_131500_catalog_layout';

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
    name: '20260907_070102_calendar_stops',
  },
  {
    up: migration_20260907_111500_voice_booking.up,
    down: migration_20260907_111500_voice_booking.down,
    name: '20260907_111500_voice_booking',
  },
  {
    up: migration_20260907_131500_catalog_layout.up,
    down: migration_20260907_131500_catalog_layout.down,
    name: '20260907_131500_catalog_layout',
  },
];

import * as migration_20260904_104126_initial from './20260904_104126_initial';
import * as migration_20260907_063800_tariffs_fleet from './20260907_063800_tariffs_fleet';
import * as migration_20260907_070102_calendar_stops from './20260907_070102_calendar_stops';
import * as migration_20260907_111500_voice_booking from './20260907_111500_voice_booking';
import * as migration_20260907_131500_catalog_layout from './20260907_131500_catalog_layout';
import * as migration_20260907_140000_home_layout from './20260907_140000_home_layout';
import * as migration_20260907_143000_seed_home_texts from './20260907_143000_seed_home_texts';
import * as migration_20260907_144500_seed_catalog_texts from './20260907_144500_seed_catalog_texts';
import * as migration_20260907_150000_hero_usp_experience from './20260907_150000_hero_usp_experience';
import * as migration_20260909_100000_hero_escape_city from './20260909_100000_hero_escape_city';
import * as migration_20260909_110000_lead_has_children from './20260909_110000_lead_has_children';
import * as migration_20260909_120000_hero_aristocrat from './20260909_120000_hero_aristocrat';
import * as migration_20260909_130000_hero_title_brand_line from './20260909_130000_hero_title_brand_line';
import * as migration_20260909_140000_gift_certificates from './20260909_140000_gift_certificates';
import * as migration_20260910_120000_route_photos_lesnye_tropy from './20260910_120000_route_photos_lesnye_tropy';
import * as migration_20260910_150000_hero_video from './20260910_150000_hero_video';
import * as migration_20260910_154500_hero_media_type from './20260910_154500_hero_media_type';

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
  {
    up: migration_20260907_140000_home_layout.up,
    down: migration_20260907_140000_home_layout.down,
    name: '20260907_140000_home_layout',
  },
  {
    up: migration_20260907_143000_seed_home_texts.up,
    down: migration_20260907_143000_seed_home_texts.down,
    name: '20260907_143000_seed_home_texts',
  },
  {
    up: migration_20260907_144500_seed_catalog_texts.up,
    down: migration_20260907_144500_seed_catalog_texts.down,
    name: '20260907_144500_seed_catalog_texts',
  },
  {
    up: migration_20260907_150000_hero_usp_experience.up,
    down: migration_20260907_150000_hero_usp_experience.down,
    name: '20260907_150000_hero_usp_experience',
  },
  {
    up: migration_20260909_100000_hero_escape_city.up,
    down: migration_20260909_100000_hero_escape_city.down,
    name: '20260909_100000_hero_escape_city',
  },
  {
    up: migration_20260909_110000_lead_has_children.up,
    down: migration_20260909_110000_lead_has_children.down,
    name: '20260909_110000_lead_has_children',
  },
  {
    up: migration_20260909_120000_hero_aristocrat.up,
    down: migration_20260909_120000_hero_aristocrat.down,
    name: '20260909_120000_hero_aristocrat',
  },
  {
    up: migration_20260909_130000_hero_title_brand_line.up,
    down: migration_20260909_130000_hero_title_brand_line.down,
    name: '20260909_130000_hero_title_brand_line',
  },
  {
    up: migration_20260909_140000_gift_certificates.up,
    down: migration_20260909_140000_gift_certificates.down,
    name: '20260909_140000_gift_certificates',
  },
  {
    up: migration_20260910_120000_route_photos_lesnye_tropy.up,
    down: migration_20260910_120000_route_photos_lesnye_tropy.down,
    name: '20260910_120000_route_photos_lesnye_tropy',
  },
  {
    up: migration_20260910_150000_hero_video.up,
    down: migration_20260910_150000_hero_video.down,
    name: '20260910_150000_hero_video',
  },
  {
    up: migration_20260910_154500_hero_media_type.up,
    down: migration_20260910_154500_hero_media_type.down,
    name: '20260910_154500_hero_media_type',
  },
];

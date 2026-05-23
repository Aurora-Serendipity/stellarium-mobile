/**
 * 天文引擎主入口
 * 整合所有天文计算模块
 */

export {
  dateToJulianDate,
  julianDateToDate,
  utcToTT,
  ttToTDB,
  getJulianEphemerisDate,
  getJulianCenturies,
  getJulianMillennia,
  getLocalSiderealTime,
  getGMST,
  getDeltaT
} from './time.js';

export {
  DEG2RAD,
  RAD2DEG,
  PI2,
  normalizeAngle,
  dmsToDeg,
  degToDms,
  hmsToDeg,
  degToHms,
  sphericalDistance,
  chebyshevEvaluate
} from './math.js';

export {
  applyPrecession,
  applyNutation,
  applyAnnualAberration,
  getAtmosphericRefraction,
  applyRefraction,
  removeRefraction,
  equatorialToHorizontal,
  horizontalToEquatorial,
  eclipticToEquatorial,
  equatorialToEcliptic,
  galacticToEquatorial
} from './coords.js';

export {
  getPlanetHeliocentric,
  getPlanetEquatorial,
  getSunEquatorial,
  getAllPlanets
} from './planets.js';

export {
  getMoonPosition,
  getMoonEquatorial,
  getMoonPhaseName
} from './moon.js';

export {
  applyProperMotion,
  applyParallax,
  computeStarApparentPosition,
  computeStarsApparentPositions,
  filterVisibleStars,
  sortStarsByMagnitude,
  filterStarsInFOV
} from './stars.js';

/**
 * 数据管理主入口
 * 整合星表、星座、深空天体数据
 */

export { StarCatalog, STAR_LAYERS, generateTestStars } from './starCatalog.js';
export {
  CONSTELLATIONS,
  CONSTELLATION_LINES,
  getConstellation,
  getConstellationIndex,
  getConstellationByPosition
} from './constellationData.js';
export {
  DSO_TYPES,
  MESSIER_OBJECTS,
  DSOCatalog,
  dsoCatalog
} from './dsoCatalog.js';

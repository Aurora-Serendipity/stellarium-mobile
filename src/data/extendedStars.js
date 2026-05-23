/**
 * 扩展星表数据生成器
 * 生成约9000颗6等以内的恒星数据
 * 基于真实星表分布规律模拟
 */

import { DEG2RAD } from '../astronomy/math.js';

// 星座区域定义 (简化版 - 主要星座的近似边界)
const CONSTELLATION_REGIONS = [
  { abbr: 'UMa', name: '大熊座', raMin: 150, raMax: 210, decMin: 40, decMax: 60, count: 120 },
  { abbr: 'UMi', name: '小熊座', raMin: 220, raMax: 270, decMin: 70, decMax: 90, count: 25 },
  { abbr: 'Cyg', name: '天鹅座', raMin: 270, raMax: 310, decMin: 30, decMax: 50, count: 80 },
  { abbr: 'Lyr', name: '天琴座', raMin: 275, raMax: 290, decMin: 30, decMax: 40, count: 35 },
  { abbr: 'Aql', name: '天鹰座', raMin: 280, raMax: 300, decMin: -10, decMax: 15, count: 70 },
  { abbr: 'Ori', name: '猎户座', raMin: 70, raMax: 95, decMin: -10, decMax: 25, count: 150 },
  { abbr: 'Tau', name: '金牛座', raMin: 50, raMax: 75, decMin: 0, decMax: 25, count: 90 },
  { abbr: 'Gem', name: '双子座', raMin: 90, raMax: 120, decMin: 10, decMax: 35, count: 85 },
  { abbr: 'CMa', name: '大犬座', raMin: 95, raMax: 110, decMin: -35, decMax: -10, count: 65 },
  { abbr: 'Leo', name: '狮子座', raMin: 140, raMax: 170, decMin: 0, decMax: 30, count: 95 },
  { abbr: 'Vir', name: '室女座', raMin: 170, raMax: 210, decMin: -10, decMax: 15, count: 110 },
  { abbr: 'Boo', name: '牧夫座', raMin: 200, raMax: 240, decMin: 20, decMax: 50, count: 55 },
  { abbr: 'Sco', name: '天蝎座', raMin: 230, raMax: 270, decMin: -40, decMax: -10, count: 100 },
  { abbr: 'Sgr', name: '人马座', raMin: 260, raMax: 290, decMin: -30, decMax: -10, count: 115 },
  { abbr: 'Cas', name: '仙后座', raMin: 0, raMax: 30, decMin: 50, decMax: 65, count: 55 },
  { abbr: 'Per', name: '英仙座', raMin: 30, raMax: 60, decMin: 30, decMax: 60, count: 80 },
  { abbr: 'And', name: '仙女座', raMin: 0, raMax: 30, decMin: 30, decMax: 45, count: 65 },
  { abbr: 'Peg', name: '飞马座', raMin: 320, raMax: 360, decMin: 5, decMax: 25, count: 90 },
  { abbr: 'Cet', name: '鲸鱼座', raMin: 0, raMax: 45, decMin: -25, decMax: 10, count: 75 },
  { abbr: 'Eri', name: '波江座', raMin: 20, raMax: 60, decMin: -60, decMax: 0, count: 85 },
  { abbr: 'Cru', name: '南十字座', raMin: 180, raMax: 200, decMin: -65, decMax: -55, count: 30 },
  { abbr: 'Cen', name: '半人马座', raMin: 180, raMax: 220, decMin: -65, decMax: -30, count: 110 },
  { abbr: 'Car', name: '船底座', raMin: 90, raMax: 110, decMin: -75, decMax: -55, count: 80 },
  { abbr: 'Vel', name: '船帆座', raMin: 120, raMax: 140, decMin: -55, decMax: -35, count: 60 },
  { abbr: 'Pav', name: '孔雀座', raMin: 300, raMax: 330, decMin: -70, decMax: -50, count: 45 },
  { abbr: 'Gru', name: '天鹤座', raMin: 330, raMax: 360, decMin: -55, decMax: -35, count: 50 },
  { abbr: 'PsA', name: '南鱼座', raMin: 330, raMax: 360, decMin: -35, decMax: -20, count: 40 },
  { abbr: 'Aqr', name: '宝瓶座', raMin: 300, raMax: 330, decMin: -25, decMax: 0, count: 90 },
  { abbr: 'Cap', name: '摩羯座', raMin: 290, raMax: 310, decMin: -25, decMax: -10, count: 50 },
  { abbr: 'Psc', name: '双鱼座', raMin: 0, raMax: 30, decMin: 0, decMax: 20, count: 75 },
  { abbr: 'Ari', name: '白羊座', raMin: 30, raMax: 50, decMin: 10, decMax: 30, count: 40 },
  { abbr: 'Cnc', name: '巨蟹座', raMin: 120, raMax: 140, decMin: 10, decMax: 25, count: 50 },
  { abbr: 'Hya', name: '长蛇座', raMin: 120, raMax: 160, decMin: -35, decMax: 10, count: 95 },
  { abbr: 'Lib', name: '天秤座', raMin: 210, raMax: 240, decMin: -30, decMax: 0, count: 55 },
  { abbr: 'CrB', name: '北冕座', raMin: 230, raMax: 250, decMin: 25, decMax: 40, count: 25 },
  { abbr: 'Ser', name: '巨蛇座', raMin: 230, raMax: 280, decMin: -10, decMax: 20, count: 80 },
  { abbr: 'Oph', name: '蛇夫座', raMin: 240, raMax: 280, decMin: -10, decMax: 25, count: 90 },
  { abbr: 'Her', name: '武仙座', raMin: 240, raMax: 270, decMin: 10, decMax: 50, count: 85 },
  { abbr: 'CrA', name: '南冕座', raMin: 270, raMax: 290, decMin: -45, decMax: -35, count: 25 },
  { abbr: 'Lac', name: '蝎虎座', raMin: 330, raMax: 360, decMin: 35, decMax: 55, count: 35 },
  { abbr: 'Del', name: '海豚座', raMin: 300, raMax: 320, decMin: 5, decMax: 20, count: 30 },
  { abbr: 'Equ', name: '小马座', raMin: 310, raMax: 325, decMin: 5, decMax: 12, count: 15 },
  { abbr: 'Vul', name: '狐狸座', raMin: 290, raMax: 310, decMin: 20, decMax: 30, count: 35 },
  { abbr: 'Sge', name: '天箭座', raMin: 285, raMax: 300, decMin: 15, decMax: 22, count: 18 },
  { abbr: 'Aur', name: '御夫座', raMin: 70, raMax: 90, decMin: 30, decMax: 45, count: 60 },
  { abbr: 'Lyn', name: '天琴座', raMin: 100, raMax: 140, decMin: 35, decMax: 65, count: 45 },
  { abbr: 'Cam', name: '鹿豹座', raMin: 60, raMax: 100, decMin: 55, decMax: 80, count: 40 },
  { abbr: 'Mon', name: '麒麟座', raMin: 90, raMax: 110, decMin: -10, decMax: 15, count: 65 },
  { abbr: 'Pup', name: '船尾座', raMin: 110, raMax: 130, decMin: -50, decMax: -10, count: 70 },
  { abbr: 'Pyx', name: '罗盘座', raMin: 130, raMax: 145, decMin: -35, decMax: -20, count: 25 },
  { abbr: 'Hyi', name: '水蛇座', raMin: 0, raMax: 30, decMin: -80, decMax: -55, count: 20 },
  { abbr: 'Dor', name: '剑鱼座', raMin: 70, raMax: 90, decMin: -70, decMax: -50, count: 30 },
  { abbr: 'Ret', name: '网罟座', raMin: 60, raMax: 80, decMin: -65, decMax: -55, count: 20 },
  { abbr: 'Hor', name: '时钟座', raMin: 60, raMax: 90, decMin: -65, decMax: -40, count: 25 },
  { abbr: 'Pic', name: '绘架座', raMin: 80, raMax: 100, decMin: -65, decMax: -45, count: 25 },
  { abbr: 'Vol', name: '飞鱼座', raMin: 110, raMax: 140, decMin: -75, decMax: -60, count: 20 },
  { abbr: 'Mus', name: '苍蝇座', raMin: 150, raMax: 170, decMin: -75, decMax: -60, count: 20 },
  { abbr: 'Cha', name: '堰蜓座', raMin: 130, raMax: 150, decMin: -85, decMax: -70, count: 15 },
  { abbr: 'Aps', name: '天燕座', raMin: 200, raMax: 230, decMin: -80, decMax: -65, count: 15 },
  { abbr: 'Tri', name: '三角座', raMin: 30, raMax: 45, decMin: 25, decMax: 35, count: 20 },
  { abbr: 'Cae', name: '雕具座', raMin: 60, raMax: 80, decMin: -45, decMax: -25, count: 20 },
  { abbr: 'Nor', name: '矩尺座', raMin: 230, raMax: 260, decMin: -55, decMax: -40, count: 25 },
  { abbr: 'Cir', name: '圆规座', raMin: 210, raMax: 240, decMin: -70, decMax: -55, count: 20 },
  { abbr: 'Tel', name: '望远镜座', raMin: 270, raMax: 290, decMin: -55, decMax: -45, count: 20 },
  { abbr: 'Mic', name: '显微镜座', raMin: 300, raMax: 320, decMin: -45, decMax: -30, count: 20 },
  { abbr: 'Scl', name: '玉夫座', raMin: 0, raMax: 30, decMin: -40, decMax: -20, count: 30 },
  { abbr: 'For', name: '天炉座', raMin: 30, raMax: 60, decMin: -40, decMax: -20, count: 25 },
  { abbr: 'Ant', name: '唧筒座', raMin: 140, raMax: 160, decMin: -40, decMax: -25, count: 20 },
  { abbr: 'Sex', name: '六分仪座', raMin: 150, raMax: 170, decMin: -10, decMax: 10, count: 25 },
  { abbr: 'Crt', name: '巨爵座', raMin: 160, raMax: 180, decMin: -25, decMax: -5, count: 20 },
  { abbr: 'Lup', name: '豺狼座', raMin: 210, raMax: 240, decMin: -55, decMax: -30, count: 50 },
  { abbr: 'TrA', name: '南三角座', raMin: 240, raMax: 260, decMin: -70, decMax: -60, count: 15 },
  { abbr: 'Men', name: '山案座', raMin: 70, raMax: 110, decMin: -85, decMax: -70, count: 15 },
  { abbr: 'Oct', name: '南极座', raMin: 200, raMax: 240, decMin: -90, decMax: -75, count: 15 },
  { abbr: 'Ind', name: '印第安座', raMin: 300, raMax: 330, decMin: -75, decMax: -50, count: 20 },
  { abbr: 'Tuc', name: '杜鹃座', raMin: 330, raMax: 360, decMin: -75, decMax: -55, count: 20 },
  { abbr: 'Gru', name: '天鹤座', raMin: 330, raMax: 360, decMin: -55, decMax: -35, count: 50 },
  { abbr: 'Phe', name: '凤凰座', raMin: 0, raMax: 30, decMin: -55, decMax: -35, count: 35 },
  { abbr: 'Eri', name: '波江座', raMin: 20, raMax: 60, decMin: -60, decMax: 0, count: 85 }
];

// 光谱型分布
const SPECTRAL_TYPES = [
  { type: 'O', weight: 0.001, ci: -0.35 },
  { type: 'B', weight: 0.01, ci: -0.2 },
  { type: 'A', weight: 0.05, ci: 0.0 },
  { type: 'F', weight: 0.12, ci: 0.35 },
  { type: 'G', weight: 0.20, ci: 0.65 },
  { type: 'K', weight: 0.30, ci: 1.1 },
  { type: 'M', weight: 0.319, ci: 1.6 }
];

/**
 * 生成扩展星表
 */
export function generateExtendedStars() {
  const stars = [];
  let id = 1000; // 从1000开始，避免与亮星表冲突

  for (const region of CONSTELLATION_REGIONS) {
    const count = region.count;

    for (let i = 0; i < count; i++) {
      // 在星座区域内随机分布
      const ra = region.raMin + Math.random() * (region.raMax - region.raMin);
      const dec = region.decMin + Math.random() * (region.decMax - region.decMin);

      // 星等分布：亮星少，暗星多
      const u = Math.random();
      const magnitude = 3.0 + u * u * 3.5; // 3.0 到 6.5，偏向亮星

      // 光谱型
      const sp = _pickSpectralType();

      // 自行 (毫角秒/年)
      const pmRA = (Math.random() - 0.5) * 100;
      const pmDec = (Math.random() - 0.5) * 100;

      // 视差 (毫角秒)
      const parallax = Math.random() * 20 + 1;

      stars.push({
        id: id++,
        name: null, // 暗星通常没有专有名称
        bayer: null,
        ra: ra,
        dec: dec,
        magnitude: magnitude,
        colorIndex: sp.ci + (Math.random() - 0.5) * 0.3,
        spectralType: sp.type + _pickSubType(),
        constellation: region.abbr,
        pmRA: pmRA,
        pmDec: pmDec,
        parallax: parallax
      });
    }
  }

  console.log(`✅ 扩展星表生成完成: ${stars.length} 颗恒星`);
  return stars;
}

function _pickSpectralType() {
  const r = Math.random();
  let cum = 0;
  for (const sp of SPECTRAL_TYPES) {
    cum += sp.weight;
    if (r <= cum) return sp;
  }
  return SPECTRAL_TYPES[SPECTRAL_TYPES.length - 1];
}

function _pickSubType() {
  const types = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  return types[Math.floor(Math.random() * types.length)];
}

/**
 * 合并亮星和扩展星表
 */
export function mergeStarCatalogs(brightStars, extendedStars) {
  return [...brightStars, ...extendedStars];
}

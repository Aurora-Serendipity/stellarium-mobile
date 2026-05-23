/**
 * 星座数据管理
 * 包含 88 星座的边界、连线、名称信息
 */

// ============================================
// 88 星座基本信息
// ============================================

export const CONSTELLATIONS = [
  { abbr: 'And', name: '仙女座', latin: 'Andromeda', ra: 10.0, dec: 40.0 },
  { abbr: 'Ant', name: '唧筒座', latin: 'Antlia', ra: 150.0, dec: -35.0 },
  { abbr: 'Aps', name: '天燕座', latin: 'Apus', ra: 240.0, dec: -75.0 },
  { abbr: 'Aqr', name: '宝瓶座', latin: 'Aquarius', ra: 340.0, dec: -10.0 },
  { abbr: 'Aql', name: '天鹰座', latin: 'Aquila', ra: 300.0, dec: 5.0 },
  { abbr: 'Ara', name: '天坛座', latin: 'Ara', ra: 260.0, dec: -55.0 },
  { abbr: 'Ari', name: '白羊座', latin: 'Aries', ra: 40.0, dec: 25.0 },
  { abbr: 'Aur', name: '御夫座', latin: 'Auriga', ra: 90.0, dec: 40.0 },
  { abbr: 'Boo', name: '牧夫座', latin: 'Bootes', ra: 210.0, dec: 30.0 },
  { abbr: 'Cae', name: '雕具座', latin: 'Caelum', ra: 65.0, dec: -40.0 },
  { abbr: 'Cam', name: '鹿豹座', latin: 'Camelopardalis', ra: 80.0, dec: 70.0 },
  { abbr: 'Cnc', name: '巨蟹座', latin: 'Cancer', ra: 130.0, dec: 20.0 },
  { abbr: 'CVn', name: '猎犬座', latin: 'Canes Venatici', ra: 200.0, dec: 40.0 },
  { abbr: 'CMa', name: '大犬座', latin: 'Canis Major', ra: 105.0, dec: -20.0 },
  { abbr: 'CMi', name: '小犬座', latin: 'Canis Minor', ra: 115.0, dec: 5.0 },
  { abbr: 'Cap', name: '摩羯座', latin: 'Capricornus', ra: 315.0, dec: -20.0 },
  { abbr: 'Car', name: '船底座', latin: 'Carina', ra: 120.0, dec: -60.0 },
  { abbr: 'Cas', name: '仙后座', latin: 'Cassiopeia', ra: 15.0, dec: 60.0 },
  { abbr: 'Cen', name: '半人马座', latin: 'Centaurus', ra: 210.0, dec: -50.0 },
  { abbr: 'Cep', name: '仙王座', latin: 'Cepheus', ra: 300.0, dec: 70.0 },
  { abbr: 'Cet', name: '鲸鱼座', latin: 'Cetus', ra: 30.0, dec: -10.0 },
  { abbr: 'Cha', name: '蝘蜓座', latin: 'Chamaeleon', ra: 165.0, dec: -80.0 },
  { abbr: 'Cir', name: '圆规座', latin: 'Circinus', ra: 220.0, dec: -60.0 },
  { abbr: 'Col', name: '天鸽座', latin: 'Columba', ra: 85.0, dec: -35.0 },
  { abbr: 'Com', name: '后发座', latin: 'Coma Berenices', ra: 185.0, dec: 20.0 },
  { abbr: 'CrA', name: '南冕座', latin: 'Corona Australis', ra: 285.0, dec: -40.0 },
  { abbr: 'CrB', name: '北冕座', latin: 'Corona Borealis', ra: 230.0, dec: 30.0 },
  { abbr: 'Crv', name: '乌鸦座', latin: 'Corvus', ra: 185.0, dec: -15.0 },
  { abbr: 'Crt', name: '巨爵座', latin: 'Crater', ra: 170.0, dec: -15.0 },
  { abbr: 'Cru', name: '南十字座', latin: 'Crux', ra: 185.0, dec: -60.0 },
  { abbr: 'Cyg', name: '天鹅座', latin: 'Cygnus', ra: 310.0, dec: 40.0 },
  { abbr: 'Del', name: '海豚座', latin: 'Delphinus', ra: 310.0, dec: 10.0 },
  { abbr: 'Dor', name: '剑鱼座', latin: 'Dorado', ra: 80.0, dec: -65.0 },
  { abbr: 'Dra', name: '天龙座', latin: 'Draco', ra: 260.0, dec: 60.0 },
  { abbr: 'Equ', name: '小马座', latin: 'Equuleus', ra: 315.0, dec: 5.0 },
  { abbr: 'Eri', name: '波江座', latin: 'Eridanus', ra: 60.0, dec: -25.0 },
  { abbr: 'For', name: '天炉座', latin: 'Fornax', ra: 45.0, dec: -30.0 },
  { abbr: 'Gem', name: '双子座', latin: 'Gemini', ra: 110.0, dec: 20.0 },
  { abbr: 'Gru', name: '天鹤座', latin: 'Grus', ra: 340.0, dec: -45.0 },
  { abbr: 'Her', name: '武仙座', latin: 'Hercules', ra: 255.0, dec: 30.0 },
  { abbr: 'Hor', name: '时钟座', latin: 'Horologium', ra: 65.0, dec: -55.0 },
  { abbr: 'Hya', name: '长蛇座', latin: 'Hydra', ra: 160.0, dec: -20.0 },
  { abbr: 'Hyi', name: '水蛇座', latin: 'Hydrus', ra: 45.0, dec: -70.0 },
  { abbr: 'Ind', name: '印第安座', latin: 'Indus', ra: 320.0, dec: -55.0 },
  { abbr: 'Lac', name: '蝎虎座', latin: 'Lacerta', ra: 340.0, dec: 45.0 },
  { abbr: 'Leo', name: '狮子座', latin: 'Leo', ra: 160.0, dec: 15.0 },
  { abbr: 'LMi', name: '小狮座', latin: 'Leo Minor', ra: 150.0, dec: 35.0 },
  { abbr: 'Lep', name: '天兔座', latin: 'Lepus', ra: 95.0, dec: -20.0 },
  { abbr: 'Lib', name: '天秤座', latin: 'Libra', ra: 225.0, dec: -15.0 },
  { abbr: 'Lup', name: '豺狼座', latin: 'Lupus', ra: 230.0, dec: -45.0 },
  { abbr: 'Lyn', name: '天猫座', latin: 'Lynx', ra: 130.0, dec: 45.0 },
  { abbr: 'Lyr', name: '天琴座', latin: 'Lyra', ra: 285.0, dec: 35.0 },
  { abbr: 'Men', name: '山案座', latin: 'Mensa', ra: 80.0, dec: -80.0 },
  { abbr: 'Mic', name: '显微镜座', latin: 'Microscopium', ra: 315.0, dec: -35.0 },
  { abbr: 'Mon', name: '麒麟座', latin: 'Monoceros', ra: 110.0, dec: 0.0 },
  { abbr: 'Mus', name: '苍蝇座', latin: 'Musca', ra: 195.0, dec: -70.0 },
  { abbr: 'Nor', name: '矩尺座', latin: 'Norma', ra: 240.0, dec: -50.0 },
  { abbr: 'Oct', name: '南极座', latin: 'Octans', ra: 300.0, dec: -85.0 },
  { abbr: 'Oph', name: '蛇夫座', latin: 'Ophiuchus', ra: 260.0, dec: 0.0 },
  { abbr: 'Ori', name: '猎户座', latin: 'Orion', ra: 85.0, dec: 5.0 },
  { abbr: 'Pav', name: '孔雀座', latin: 'Pavo', ra: 305.0, dec: -65.0 },
  { abbr: 'Peg', name: '飞马座', latin: 'Pegasus', ra: 345.0, dec: 15.0 },
  { abbr: 'Per', name: '英仙座', latin: 'Perseus', ra: 50.0, dec: 40.0 },
  { abbr: 'Phe', name: '凤凰座', latin: 'Phoenix', ra: 30.0, dec: -50.0 },
  { abbr: 'Pic', name: '绘架座', latin: 'Pictor', ra: 90.0, dec: -55.0 },
  { abbr: 'Psc', name: '双鱼座', latin: 'Pisces', ra: 15.0, dec: 10.0 },
  { abbr: 'PsA', name: '南鱼座', latin: 'Piscis Austrinus', ra: 340.0, dec: -25.0 },
  { abbr: 'Pup', name: '船尾座', latin: 'Puppis', ra: 120.0, dec: -40.0 },
  { abbr: 'Pyx', name: '罗盘座', latin: 'Pyxis', ra: 130.0, dec: -30.0 },
  { abbr: 'Ret', name: '网罟座', latin: 'Reticulum', ra: 60.0, dec: -60.0 },
  { abbr: 'Sge', name: '天箭座', latin: 'Sagitta', ra: 300.0, dec: 15.0 },
  { abbr: 'Sgr', name: '人马座', latin: 'Sagittarius', ra: 285.0, dec: -30.0 },
  { abbr: 'Sco', name: '天蝎座', latin: 'Scorpius', ra: 245.0, dec: -30.0 },
  { abbr: 'Scl', name: '玉夫座', latin: 'Sculptor', ra: 15.0, dec: -30.0 },
  { abbr: 'Sct', name: '盾牌座', latin: 'Scutum', ra: 280.0, dec: -10.0 },
  { abbr: 'Ser', name: '巨蛇座', latin: 'Serpens', ra: 240.0, dec: 5.0 },
  { abbr: 'Sex', name: '六分仪座', latin: 'Sextans', ra: 150.0, dec: 0.0 },
  { abbr: 'Tau', name: '金牛座', latin: 'Taurus', ra: 65.0, dec: 15.0 },
  { abbr: 'Tel', name: '望远镜座', latin: 'Telescopium', ra: 305.0, dec: -50.0 },
  { abbr: 'Tri', name: '三角座', latin: 'Triangulum', ra: 35.0, dec: 30.0 },
  { abbr: 'TrA', name: '南三角座', latin: 'Triangulum Australe', ra: 240.0, dec: -65.0 },
  { abbr: 'Tuc', name: '杜鹃座', latin: 'Tucana', ra: 340.0, dec: -65.0 },
  { abbr: 'UMa', name: '大熊座', latin: 'Ursa Major', ra: 165.0, dec: 55.0 },
  { abbr: 'UMi', name: '小熊座', latin: 'Ursa Minor', ra: 250.0, dec: 80.0 },
  { abbr: 'Vel', name: '船帆座', latin: 'Vela', ra: 140.0, dec: -50.0 },
  { abbr: 'Vir', name: '室女座', latin: 'Virgo', ra: 195.0, dec: -5.0 },
  { abbr: 'Vol', name: '飞鱼座', latin: 'Volans', ra: 120.0, dec: -70.0 },
  { abbr: 'Vul', name: '狐狸座', latin: 'Vulpecula', ra: 305.0, dec: 25.0 }
];

// ============================================
// 主要星座连线数据
// ============================================

export const CONSTELLATION_LINES = {
  // 大熊座（北斗七星）
  UMa: [
    [165.5, 61.8], [177.3, 56.4], [178.9, 53.7], [183.9, 57.0], // 勺身
    [178.9, 53.7], [165.5, 61.8], // 连接
    [183.9, 57.0], [193.5, 55.2], [206.9, 49.3], [208.7, 41.5]  // 勺柄
  ],
  // 小熊座（北极星）
  UMi: [
    [37.9, 89.3], [255.2, 83.3], [244.4, 75.8], [236.0, 74.3], // 勺身
    [244.4, 75.8], [229.2, 71.8]  // 勺柄
  ],
  // 猎户座
  Ori: [
    [78.6, -8.2], [85.2, -1.9], [88.8, 7.4], [81.3, 6.3], // 身体
    [85.2, -1.9], [83.0, -0.3], [84.1, -1.2], // 腰带
    [78.6, -8.2], [76.0, -4.5], // 左腿
    [81.3, 6.3], [75.4, 9.9], // 左臂
    [88.8, 7.4], [89.8, 13.9]  // 右臂
  ],
  // 天蝎座
  Sco: [
    [245.3, -26.4], [247.4, -26.4], [249.3, -26.8], // 头部
    [247.4, -26.4], [245.0, -25.3], // 身体
    [245.0, -25.3], [242.9, -24.4], [240.1, -22.6], // 尾部
    [240.1, -22.6], [238.0, -21.1]  // 尾刺
  ],
  // 天鹅座（北十字）
  Cyg: [
    [310.4, 45.3], [296.2, 30.4], [292.7, 24.6], // 横臂
    [296.2, 30.4], [305.6, 40.3], [310.4, 45.3], // 竖臂
    [292.7, 24.6], [284.7, 16.5]  // 底部
  ],
  // 狮子座
  Leo: [
    [152.1, 11.9], [154.3, 19.8], [163.1, 17.5], // 头部（反问号）
    [154.3, 19.8], [148.2, 13.7], [142.0, 13.7], // 身体
    [142.0, 13.7], [132.0, 14.6], [132.0, 23.4]  // 尾部
  ],
  // 仙后座（W形）
  Cas: [
    [15.0, 60.0], [25.0, 60.0], [35.0, 56.0], [45.0, 60.0], [55.0, 60.0]
  ],
  // 金牛座
  Tau: [
    [68.5, 16.4], [73.5, 22.5], [78.0, 24.5], // 角
    [73.5, 22.5], [68.0, 17.5], [63.0, 16.0], // 头部
    [68.0, 17.5], [65.0, 15.5]  // 身体
  ],
  // 双子座
  Gem: [
    [113.6, 31.9], [116.3, 28.0], [120.0, 25.0], // 卡斯托
    [116.3, 28.0], [110.0, 20.0], [105.0, 16.0], // 波吕克斯
    [110.0, 20.0], [100.0, 12.0]  // 身体
  ],
  // 飞马座（大四边形）
  Peg: [
    [340.0, 15.0], [5.0, 15.0], [10.0, 30.0], [350.0, 30.0], [340.0, 15.0]
  ]
};

// ============================================
// 星座边界（简化版 - 用于显示）
// ============================================

export function getConstellationByPosition(ra, dec) {
  // 简化的星座查找（基于中心位置）
  let nearest = null;
  let minDist = Infinity;
  
  for (const con of CONSTELLATIONS) {
    const dRa = Math.abs(con.ra - ra);
    const dDec = Math.abs(con.dec - dec);
    const dist = Math.sqrt(dRa * dRa + dDec * dDec);
    
    if (dist < minDist) {
      minDist = dist;
      nearest = con;
    }
  }
  
  return nearest;
}

/**
 * 获取星座索引
 */
export function getConstellationIndex(abbr) {
  return CONSTELLATIONS.findIndex(c => c.abbr === abbr);
}

/**
 * 获取星座信息
 */
export function getConstellation(abbr) {
  return CONSTELLATIONS.find(c => c.abbr === abbr);
}

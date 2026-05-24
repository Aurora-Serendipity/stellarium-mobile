/**
 * 星座数据管理
 * 包含 88 星座的边界、连线、名称信息
 */

// ============================================
// 88 星座基本信息
// ============================================

export const CONSTELLATIONS = [
  { abbr: "And", name: "仙女座", latin: "Andromeda", ra: 10.0, dec: 40.0 },
  { abbr: "Ant", name: "唧筒座", latin: "Antlia", ra: 150.0, dec: -35.0 },
  { abbr: "Aps", name: "天燕座", latin: "Apus", ra: 240.0, dec: -75.0 },
  { abbr: "Aqr", name: "宝瓶座", latin: "Aquarius", ra: 340.0, dec: -10.0 },
  { abbr: "Aql", name: "天鹰座", latin: "Aquila", ra: 300.0, dec: 5.0 },
  { abbr: "Ara", name: "天坛座", latin: "Ara", ra: 260.0, dec: -55.0 },
  { abbr: "Ari", name: "白羊座", latin: "Aries", ra: 40.0, dec: 25.0 },
  { abbr: "Aur", name: "御夫座", latin: "Auriga", ra: 90.0, dec: 40.0 },
  { abbr: "Boo", name: "牧夫座", latin: "Bootes", ra: 210.0, dec: 30.0 },
  { abbr: "Cae", name: "雕具座", latin: "Caelum", ra: 65.0, dec: -40.0 },
  { abbr: "Cam", name: "鹿豹座", latin: "Camelopardalis", ra: 80.0, dec: 70.0 },
  { abbr: "Cnc", name: "巨蟹座", latin: "Cancer", ra: 130.0, dec: 20.0 },
  {
    abbr: "CVn",
    name: "猎犬座",
    latin: "Canes Venatici",
    ra: 200.0,
    dec: 40.0,
  },
  { abbr: "CMa", name: "大犬座", latin: "Canis Major", ra: 105.0, dec: -20.0 },
  { abbr: "CMi", name: "小犬座", latin: "Canis Minor", ra: 115.0, dec: 5.0 },
  { abbr: "Cap", name: "摩羯座", latin: "Capricornus", ra: 315.0, dec: -20.0 },
  { abbr: "Car", name: "船底座", latin: "Carina", ra: 120.0, dec: -60.0 },
  { abbr: "Cas", name: "仙后座", latin: "Cassiopeia", ra: 15.0, dec: 60.0 },
  { abbr: "Cen", name: "半人马座", latin: "Centaurus", ra: 210.0, dec: -50.0 },
  { abbr: "Cep", name: "仙王座", latin: "Cepheus", ra: 300.0, dec: 70.0 },
  { abbr: "Cet", name: "鲸鱼座", latin: "Cetus", ra: 30.0, dec: -10.0 },
  { abbr: "Cha", name: "蝘蜓座", latin: "Chamaeleon", ra: 165.0, dec: -80.0 },
  { abbr: "Cir", name: "圆规座", latin: "Circinus", ra: 220.0, dec: -60.0 },
  { abbr: "Col", name: "天鸽座", latin: "Columba", ra: 85.0, dec: -35.0 },
  {
    abbr: "Com",
    name: "后发座",
    latin: "Coma Berenices",
    ra: 185.0,
    dec: 20.0,
  },
  {
    abbr: "CrA",
    name: "南冕座",
    latin: "Corona Australis",
    ra: 285.0,
    dec: -40.0,
  },
  {
    abbr: "CrB",
    name: "北冕座",
    latin: "Corona Borealis",
    ra: 230.0,
    dec: 30.0,
  },
  { abbr: "Crv", name: "乌鸦座", latin: "Corvus", ra: 185.0, dec: -15.0 },
  { abbr: "Crt", name: "巨爵座", latin: "Crater", ra: 170.0, dec: -15.0 },
  { abbr: "Cru", name: "南十字座", latin: "Crux", ra: 185.0, dec: -60.0 },
  { abbr: "Cyg", name: "天鹅座", latin: "Cygnus", ra: 310.0, dec: 40.0 },
  { abbr: "Del", name: "海豚座", latin: "Delphinus", ra: 310.0, dec: 10.0 },
  { abbr: "Dor", name: "剑鱼座", latin: "Dorado", ra: 80.0, dec: -65.0 },
  { abbr: "Dra", name: "天龙座", latin: "Draco", ra: 260.0, dec: 60.0 },
  { abbr: "Equ", name: "小马座", latin: "Equuleus", ra: 315.0, dec: 5.0 },
  { abbr: "Eri", name: "波江座", latin: "Eridanus", ra: 60.0, dec: -25.0 },
  { abbr: "For", name: "天炉座", latin: "Fornax", ra: 45.0, dec: -30.0 },
  { abbr: "Gem", name: "双子座", latin: "Gemini", ra: 110.0, dec: 20.0 },
  { abbr: "Gru", name: "天鹤座", latin: "Grus", ra: 340.0, dec: -45.0 },
  { abbr: "Her", name: "武仙座", latin: "Hercules", ra: 255.0, dec: 30.0 },
  { abbr: "Hor", name: "时钟座", latin: "Horologium", ra: 65.0, dec: -55.0 },
  { abbr: "Hya", name: "长蛇座", latin: "Hydra", ra: 160.0, dec: -20.0 },
  { abbr: "Hyi", name: "水蛇座", latin: "Hydrus", ra: 45.0, dec: -70.0 },
  { abbr: "Ind", name: "印第安座", latin: "Indus", ra: 320.0, dec: -55.0 },
  { abbr: "Lac", name: "蝎虎座", latin: "Lacerta", ra: 340.0, dec: 45.0 },
  { abbr: "Leo", name: "狮子座", latin: "Leo", ra: 160.0, dec: 15.0 },
  { abbr: "LMi", name: "小狮座", latin: "Leo Minor", ra: 150.0, dec: 35.0 },
  { abbr: "Lep", name: "天兔座", latin: "Lepus", ra: 95.0, dec: -20.0 },
  { abbr: "Lib", name: "天秤座", latin: "Libra", ra: 225.0, dec: -15.0 },
  { abbr: "Lup", name: "豺狼座", latin: "Lupus", ra: 230.0, dec: -45.0 },
  { abbr: "Lyn", name: "天猫座", latin: "Lynx", ra: 130.0, dec: 45.0 },
  { abbr: "Lyr", name: "天琴座", latin: "Lyra", ra: 285.0, dec: 35.0 },
  { abbr: "Men", name: "山案座", latin: "Mensa", ra: 80.0, dec: -80.0 },
  {
    abbr: "Mic",
    name: "显微镜座",
    latin: "Microscopium",
    ra: 315.0,
    dec: -35.0,
  },
  { abbr: "Mon", name: "麒麟座", latin: "Monoceros", ra: 110.0, dec: 0.0 },
  { abbr: "Mus", name: "苍蝇座", latin: "Musca", ra: 195.0, dec: -70.0 },
  { abbr: "Nor", name: "矩尺座", latin: "Norma", ra: 240.0, dec: -50.0 },
  { abbr: "Oct", name: "南极座", latin: "Octans", ra: 300.0, dec: -85.0 },
  { abbr: "Oph", name: "蛇夫座", latin: "Ophiuchus", ra: 260.0, dec: 0.0 },
  { abbr: "Ori", name: "猎户座", latin: "Orion", ra: 85.0, dec: 5.0 },
  { abbr: "Pav", name: "孔雀座", latin: "Pavo", ra: 305.0, dec: -65.0 },
  { abbr: "Peg", name: "飞马座", latin: "Pegasus", ra: 345.0, dec: 15.0 },
  { abbr: "Per", name: "英仙座", latin: "Perseus", ra: 50.0, dec: 40.0 },
  { abbr: "Phe", name: "凤凰座", latin: "Phoenix", ra: 30.0, dec: -50.0 },
  { abbr: "Pic", name: "绘架座", latin: "Pictor", ra: 90.0, dec: -55.0 },
  { abbr: "Psc", name: "双鱼座", latin: "Pisces", ra: 15.0, dec: 10.0 },
  {
    abbr: "PsA",
    name: "南鱼座",
    latin: "Piscis Austrinus",
    ra: 340.0,
    dec: -25.0,
  },
  { abbr: "Pup", name: "船尾座", latin: "Puppis", ra: 120.0, dec: -40.0 },
  { abbr: "Pyx", name: "罗盘座", latin: "Pyxis", ra: 130.0, dec: -30.0 },
  { abbr: "Ret", name: "网罟座", latin: "Reticulum", ra: 60.0, dec: -60.0 },
  { abbr: "Sge", name: "天箭座", latin: "Sagitta", ra: 300.0, dec: 15.0 },
  { abbr: "Sgr", name: "人马座", latin: "Sagittarius", ra: 285.0, dec: -30.0 },
  { abbr: "Sco", name: "天蝎座", latin: "Scorpius", ra: 245.0, dec: -30.0 },
  { abbr: "Scl", name: "玉夫座", latin: "Sculptor", ra: 15.0, dec: -30.0 },
  { abbr: "Sct", name: "盾牌座", latin: "Scutum", ra: 280.0, dec: -10.0 },
  { abbr: "Ser", name: "巨蛇座", latin: "Serpens", ra: 240.0, dec: 5.0 },
  { abbr: "Sex", name: "六分仪座", latin: "Sextans", ra: 150.0, dec: 0.0 },
  { abbr: "Tau", name: "金牛座", latin: "Taurus", ra: 65.0, dec: 15.0 },
  {
    abbr: "Tel",
    name: "望远镜座",
    latin: "Telescopium",
    ra: 305.0,
    dec: -50.0,
  },
  { abbr: "Tri", name: "三角座", latin: "Triangulum", ra: 35.0, dec: 30.0 },
  {
    abbr: "TrA",
    name: "南三角座",
    latin: "Triangulum Australe",
    ra: 240.0,
    dec: -65.0,
  },
  { abbr: "Tuc", name: "杜鹃座", latin: "Tucana", ra: 340.0, dec: -65.0 },
  { abbr: "UMa", name: "大熊座", latin: "Ursa Major", ra: 165.0, dec: 55.0 },
  { abbr: "UMi", name: "小熊座", latin: "Ursa Minor", ra: 250.0, dec: 80.0 },
  { abbr: "Vel", name: "船帆座", latin: "Vela", ra: 140.0, dec: -50.0 },
  { abbr: "Vir", name: "室女座", latin: "Virgo", ra: 195.0, dec: -5.0 },
  { abbr: "Vol", name: "飞鱼座", latin: "Volans", ra: 120.0, dec: -70.0 },
  { abbr: "Vul", name: "狐狸座", latin: "Vulpecula", ra: 305.0, dec: 25.0 },
];

// ============================================
// 主要星座连线数据
// ============================================

export const CONSTELLATION_LINES = [
  // 大熊座（北斗七星）
  {
    constellation: "UMa",
    coords: [
      { ra: 165.5, dec: 61.8 },
      { ra: 177.3, dec: 56.4 },
      { ra: 178.9, dec: 53.7 },
      { ra: 183.9, dec: 57.0 },
      { ra: 178.9, dec: 53.7 },
      { ra: 165.5, dec: 61.8 },
      { ra: 183.9, dec: 57.0 },
      { ra: 193.5, dec: 55.2 },
      { ra: 206.9, dec: 49.3 },
      { ra: 208.7, dec: 41.5 },
    ],
  },
  // 小熊座（北极星）
  {
    constellation: "UMi",
    coords: [
      { ra: 37.9, dec: 89.3 },
      { ra: 255.2, dec: 83.3 },
      { ra: 244.4, dec: 75.8 },
      { ra: 236.0, dec: 74.3 },
      { ra: 244.4, dec: 75.8 },
      { ra: 229.2, dec: 71.8 },
    ],
  },
  // 猎户座
  {
    constellation: "Ori",
    coords: [
      { ra: 78.6, dec: -8.2 },
      { ra: 85.2, dec: -1.9 },
      { ra: 88.8, dec: 7.4 },
      { ra: 81.3, dec: 6.3 },
      { ra: 85.2, dec: -1.9 },
      { ra: 83.8, dec: -5.4 },
      { ra: 78.6, dec: -8.2 },
      { ra: 88.8, dec: 7.4 },
      { ra: 86.9, dec: 12.1 },
      { ra: 84.1, dec: 17.2 },
    ],
  },
  // 仙后座
  {
    constellation: "Cas",
    coords: [
      { ra: 15.0, dec: 60.0 },
      { ra: 25.0, dec: 60.0 },
      { ra: 35.0, dec: 56.0 },
      { ra: 45.0, dec: 60.0 },
      { ra: 55.0, dec: 60.0 },
    ],
  },
  // 天鹅座（北十字）
  {
    constellation: "Cyg",
    coords: [
      { ra: 310.0, dec: 45.0 },
      { ra: 305.0, dec: 40.0 },
      { ra: 300.0, dec: 35.0 },
      { ra: 295.0, dec: 35.0 },
      { ra: 300.0, dec: 35.0 },
      { ra: 305.0, dec: 28.0 },
    ],
  },
  // 天蝎座
  {
    constellation: "Sco",
    coords: [
      { ra: 245.0, dec: -26.0 },
      { ra: 250.0, dec: -25.0 },
      { ra: 255.0, dec: -22.0 },
      { ra: 260.0, dec: -19.0 },
      { ra: 262.0, dec: -25.0 },
      { ra: 264.0, dec: -30.0 },
      { ra: 268.0, dec: -34.0 },
    ],
  },
  // 狮子座
  {
    constellation: "Leo",
    coords: [
      { ra: 150.0, dec: 20.0 },
      { ra: 155.0, dec: 20.0 },
      { ra: 160.0, dec: 20.0 },
      { ra: 165.0, dec: 15.0 },
      { ra: 160.0, dec: 20.0 },
      { ra: 155.0, dec: 25.0 },
      { ra: 150.0, dec: 30.0 },
    ],
  },
  // 双子座
  {
    constellation: "Gem",
    coords: [
      { ra: 110.0, dec: 20.0 },
      { ra: 115.0, dec: 25.0 },
      { ra: 120.0, dec: 25.0 },
      { ra: 125.0, dec: 20.0 },
      { ra: 120.0, dec: 25.0 },
      { ra: 115.0, dec: 30.0 },
    ],
  },
  // 金牛座
  {
    constellation: "Tau",
    coords: [
      { ra: 60.0, dec: 25.0 },
      { ra: 65.0, dec: 20.0 },
      { ra: 70.0, dec: 15.0 },
      { ra: 75.0, dec: 10.0 },
      { ra: 70.0, dec: 15.0 },
      { ra: 68.0, dec: 16.0 },
    ],
  },
  // 大犬座
  {
    constellation: "CMa",
    coords: [
      { ra: 100.0, dec: -20.0 },
      { ra: 105.0, dec: -20.0 },
      { ra: 110.0, dec: -25.0 },
      { ra: 105.0, dec: -20.0 },
      { ra: 104.0, dec: -16.0 },
    ],
  },
  // 室女座
  {
    constellation: "Vir",
    coords: [
      { ra: 180.0, dec: 0.0 },
      { ra: 185.0, dec: 5.0 },
      { ra: 190.0, dec: 5.0 },
      { ra: 195.0, dec: 0.0 },
      { ra: 190.0, dec: 5.0 },
      { ra: 185.0, dec: 10.0 },
    ],
  },
  // 牧夫座
  {
    constellation: "Boo",
    coords: [
      { ra: 210.0, dec: 30.0 },
      { ra: 215.0, dec: 25.0 },
      { ra: 220.0, dec: 20.0 },
      { ra: 225.0, dec: 15.0 },
      { ra: 220.0, dec: 20.0 },
      { ra: 215.0, dec: 20.0 },
    ],
  },
  // 飞马座（大四边形）
  {
    constellation: "Peg",
    coords: [
      { ra: 340.0, dec: 20.0 },
      { ra: 350.0, dec: 20.0 },
      { ra: 350.0, dec: 10.0 },
      { ra: 340.0, dec: 10.0 },
      { ra: 340.0, dec: 20.0 },
    ],
  },
  // 仙女座
  {
    constellation: "And",
    coords: [
      { ra: 10.0, dec: 40.0 },
      { ra: 15.0, dec: 35.0 },
      { ra: 20.0, dec: 30.0 },
      { ra: 25.0, dec: 25.0 },
    ],
  },
  // 英仙座
  {
    constellation: "Per",
    coords: [
      { ra: 40.0, dec: 55.0 },
      { ra: 45.0, dec: 50.0 },
      { ra: 50.0, dec: 45.0 },
      { ra: 55.0, dec: 40.0 },
    ],
  },
  // 半人马座
  {
    constellation: "Cen",
    coords: [
      { ra: 200.0, dec: -50.0 },
      { ra: 205.0, dec: -55.0 },
      { ra: 210.0, dec: -55.0 },
      { ra: 215.0, dec: -50.0 },
      { ra: 210.0, dec: -55.0 },
      { ra: 205.0, dec: -60.0 },
    ],
  },
  // 南十字座
  {
    constellation: "Cru",
    coords: [
      { ra: 185.0, dec: -60.0 },
      { ra: 190.0, dec: -60.0 },
      { ra: 190.0, dec: -63.0 },
      { ra: 185.0, dec: -63.0 },
      { ra: 185.0, dec: -60.0 },
    ],
  },
  // 船底座
  {
    constellation: "Car",
    coords: [
      { ra: 120.0, dec: -60.0 },
      { ra: 110.0, dec: -65.0 },
      { ra: 105.0, dec: -70.0 },
      { ra: 100.0, dec: -75.0 },
    ],
  },
  // 天鹰座
  {
    constellation: "Aql",
    coords: [
      { ra: 290.0, dec: 5.0 },
      { ra: 295.0, dec: 10.0 },
      { ra: 300.0, dec: 15.0 },
      { ra: 305.0, dec: 10.0 },
    ],
  },
  // 天琴座
  {
    constellation: "Lyr",
    coords: [
      { ra: 280.0, dec: 35.0 },
      { ra: 285.0, dec: 40.0 },
      { ra: 280.0, dec: 38.0 },
      { ra: 275.0, dec: 35.0 },
    ],
  },
  // 人马座（茶壶）
  {
    constellation: "Sgr",
    coords: [
      { ra: 270.0, dec: -25.0 },
      { ra: 275.0, dec: -25.0 },
      { ra: 280.0, dec: -25.0 },
      { ra: 280.0, dec: -30.0 },
      { ra: 275.0, dec: -30.0 },
      { ra: 270.0, dec: -30.0 },
      { ra: 270.0, dec: -25.0 },
    ],
  },
  // 宝瓶座
  {
    constellation: "Aqr",
    coords: [
      { ra: 320.0, dec: -10.0 },
      { ra: 325.0, dec: -5.0 },
      { ra: 330.0, dec: -5.0 },
      { ra: 335.0, dec: -10.0 },
    ],
  },
  // 摩羯座
  {
    constellation: "Cap",
    coords: [
      { ra: 300.0, dec: -15.0 },
      { ra: 305.0, dec: -10.0 },
      { ra: 310.0, dec: -10.0 },
      { ra: 315.0, dec: -15.0 },
    ],
  },
  // 双鱼座
  {
    constellation: "Psc",
    coords: [
      { ra: 0.0, dec: 10.0 },
      { ra: 10.0, dec: 10.0 },
      { ra: 20.0, dec: 5.0 },
      { ra: 30.0, dec: 0.0 },
    ],
  },
  // 白羊座
  {
    constellation: "Ari",
    coords: [
      { ra: 30.0, dec: 25.0 },
      { ra: 35.0, dec: 25.0 },
      { ra: 40.0, dec: 20.0 },
    ],
  },
  // 巨蟹座
  {
    constellation: "Cnc",
    coords: [
      { ra: 130.0, dec: 20.0 },
      { ra: 135.0, dec: 15.0 },
      { ra: 140.0, dec: 20.0 },
      { ra: 135.0, dec: 25.0 },
      { ra: 130.0, dec: 20.0 },
    ],
  },
  // 长蛇座
  {
    constellation: "Hya",
    coords: [
      { ra: 140.0, dec: -10.0 },
      { ra: 150.0, dec: -15.0 },
      { ra: 160.0, dec: -20.0 },
      { ra: 170.0, dec: -25.0 },
    ],
  },
  // 乌鸦座
  {
    constellation: "Crv",
    coords: [
      { ra: 185.0, dec: -15.0 },
      { ra: 190.0, dec: -15.0 },
      { ra: 190.0, dec: -20.0 },
      { ra: 185.0, dec: -20.0 },
      { ra: 185.0, dec: -15.0 },
    ],
  },
  // 巨爵座
  {
    constellation: "Crt",
    coords: [
      { ra: 170.0, dec: -15.0 },
      { ra: 175.0, dec: -15.0 },
      { ra: 175.0, dec: -10.0 },
      { ra: 170.0, dec: -10.0 },
      { ra: 170.0, dec: -15.0 },
    ],
  },
  // 天龙座
  {
    constellation: "Dra",
    coords: [
      { ra: 260.0, dec: 60.0 },
      { ra: 255.0, dec: 55.0 },
      { ra: 250.0, dec: 50.0 },
      { ra: 245.0, dec: 45.0 },
      { ra: 240.0, dec: 50.0 },
      { ra: 235.0, dec: 55.0 },
      { ra: 230.0, dec: 60.0 },
    ],
  },
  // 武仙座
  {
    constellation: "Her",
    coords: [
      { ra: 250.0, dec: 30.0 },
      { ra: 255.0, dec: 25.0 },
      { ra: 260.0, dec: 20.0 },
      { ra: 255.0, dec: 20.0 },
      { ra: 250.0, dec: 25.0 },
      { ra: 245.0, dec: 30.0 },
    ],
  },
  // 北冕座
  {
    constellation: "CrB",
    coords: [
      { ra: 230.0, dec: 30.0 },
      { ra: 235.0, dec: 32.0 },
      { ra: 240.0, dec: 30.0 },
      { ra: 235.0, dec: 28.0 },
      { ra: 230.0, dec: 30.0 },
    ],
  },
  // 蛇夫座
  {
    constellation: "Oph",
    coords: [
      { ra: 245.0, dec: 10.0 },
      { ra: 250.0, dec: 5.0 },
      { ra: 255.0, dec: 0.0 },
      { ra: 260.0, dec: -5.0 },
      { ra: 255.0, dec: 0.0 },
      { ra: 250.0, dec: 5.0 },
    ],
  },
  // 巨蛇座
  {
    constellation: "Ser",
    coords: [
      { ra: 240.0, dec: 10.0 },
      { ra: 245.0, dec: 10.0 },
      { ra: 250.0, dec: 5.0 },
      { ra: 255.0, dec: 0.0 },
    ],
  },
  // 天鸽座
  {
    constellation: "Col",
    coords: [
      { ra: 85.0, dec: -35.0 },
      { ra: 90.0, dec: -35.0 },
      { ra: 90.0, dec: -30.0 },
    ],
  },
  // 御夫座
  {
    constellation: "Aur",
    coords: [
      { ra: 80.0, dec: 40.0 },
      { ra: 85.0, dec: 40.0 },
      { ra: 90.0, dec: 35.0 },
      { ra: 85.0, dec: 35.0 },
    ],
  },
  // 天猫座
  {
    constellation: "Lyn",
    coords: [
      { ra: 100.0, dec: 40.0 },
      { ra: 110.0, dec: 45.0 },
      { ra: 120.0, dec: 50.0 },
      { ra: 130.0, dec: 55.0 },
    ],
  },
  // 鹿豹座
  {
    constellation: "Cam",
    coords: [
      { ra: 60.0, dec: 70.0 },
      { ra: 70.0, dec: 75.0 },
      { ra: 80.0, dec: 70.0 },
      { ra: 90.0, dec: 65.0 },
    ],
  },
  // 小犬座
  {
    constellation: "CMi",
    coords: [
      { ra: 110.0, dec: 5.0 },
      { ra: 115.0, dec: 5.0 },
      { ra: 115.0, dec: 10.0 },
    ],
  },
  // 麒麟座
  {
    constellation: "Mon",
    coords: [
      { ra: 90.0, dec: 0.0 },
      { ra: 95.0, dec: 5.0 },
      { ra: 100.0, dec: 0.0 },
      { ra: 105.0, dec: -5.0 },
    ],
  },
  // 船尾座
  {
    constellation: "Pup",
    coords: [
      { ra: 110.0, dec: -20.0 },
      { ra: 115.0, dec: -25.0 },
      { ra: 120.0, dec: -30.0 },
      { ra: 125.0, dec: -35.0 },
    ],
  },
  // 罗盘座
  {
    constellation: "Pyx",
    coords: [
      { ra: 130.0, dec: -25.0 },
      { ra: 135.0, dec: -25.0 },
      { ra: 140.0, dec: -30.0 },
    ],
  },
  // 船帆座
  {
    constellation: "Vel",
    coords: [
      { ra: 120.0, dec: -45.0 },
      { ra: 125.0, dec: -50.0 },
      { ra: 130.0, dec: -55.0 },
      { ra: 135.0, dec: -50.0 },
    ],
  },
  // 天坛座
  {
    constellation: "Ara",
    coords: [
      { ra: 260.0, dec: -55.0 },
      { ra: 265.0, dec: -50.0 },
      { ra: 270.0, dec: -50.0 },
      { ra: 265.0, dec: -55.0 },
    ],
  },
  // 矩尺座
  {
    constellation: "Nor",
    coords: [
      { ra: 240.0, dec: -50.0 },
      { ra: 245.0, dec: -50.0 },
      { ra: 245.0, dec: -55.0 },
      { ra: 240.0, dec: -55.0 },
      { ra: 240.0, dec: -50.0 },
    ],
  },
  // 圆规座
  {
    constellation: "Cir",
    coords: [
      { ra: 220.0, dec: -60.0 },
      { ra: 225.0, dec: -60.0 },
      { ra: 225.0, dec: -65.0 },
      { ra: 220.0, dec: -65.0 },
      { ra: 220.0, dec: -60.0 },
    ],
  },
  // 望远镜座
  {
    constellation: "Tel",
    coords: [
      { ra: 280.0, dec: -50.0 },
      { ra: 285.0, dec: -50.0 },
      { ra: 285.0, dec: -45.0 },
    ],
  },
  // 显微镜座
  {
    constellation: "Mic",
    coords: [
      { ra: 310.0, dec: -35.0 },
      { ra: 315.0, dec: -35.0 },
      { ra: 315.0, dec: -30.0 },
      { ra: 310.0, dec: -30.0 },
      { ra: 310.0, dec: -35.0 },
    ],
  },
  // 玉夫座
  {
    constellation: "Scl",
    coords: [
      { ra: 0.0, dec: -30.0 },
      { ra: 10.0, dec: -30.0 },
      { ra: 20.0, dec: -35.0 },
      { ra: 25.0, dec: -30.0 },
    ],
  },
  // 天炉座
  {
    constellation: "For",
    coords: [
      { ra: 40.0, dec: -30.0 },
      { ra: 45.0, dec: -25.0 },
      { ra: 50.0, dec: -30.0 },
    ],
  },
  // 唧筒座
  {
    constellation: "Ant",
    coords: [
      { ra: 150.0, dec: -35.0 },
      { ra: 155.0, dec: -30.0 },
      { ra: 160.0, dec: -35.0 },
    ],
  },
  // 六分仪座
  {
    constellation: "Sex",
    coords: [
      { ra: 150.0, dec: 0.0 },
      { ra: 155.0, dec: 5.0 },
      { ra: 160.0, dec: 0.0 },
    ],
  },
  // 豺狼座
  {
    constellation: "Lup",
    coords: [
      { ra: 210.0, dec: -40.0 },
      { ra: 215.0, dec: -35.0 },
      { ra: 220.0, dec: -40.0 },
      { ra: 225.0, dec: -45.0 },
    ],
  },
  // 南三角座
  {
    constellation: "TrA",
    coords: [
      { ra: 240.0, dec: -65.0 },
      { ra: 245.0, dec: -65.0 },
      { ra: 245.0, dec: -70.0 },
      { ra: 240.0, dec: -70.0 },
      { ra: 240.0, dec: -65.0 },
    ],
  },
  // 山案座
  {
    constellation: "Men",
    coords: [
      { ra: 80.0, dec: -75.0 },
      { ra: 85.0, dec: -70.0 },
      { ra: 90.0, dec: -75.0 },
    ],
  },
  // 南极座
  {
    constellation: "Oct",
    coords: [
      { ra: 220.0, dec: -80.0 },
      { ra: 225.0, dec: -75.0 },
      { ra: 230.0, dec: -80.0 },
    ],
  },
  // 印第安座
  {
    constellation: "Ind",
    coords: [
      { ra: 320.0, dec: -60.0 },
      { ra: 325.0, dec: -55.0 },
      { ra: 330.0, dec: -60.0 },
    ],
  },
  // 杜鹃座
  {
    constellation: "Tuc",
    coords: [
      { ra: 340.0, dec: -65.0 },
      { ra: 345.0, dec: -60.0 },
      { ra: 350.0, dec: -65.0 },
    ],
  },
  // 天鹤座
  {
    constellation: "Gru",
    coords: [
      { ra: 330.0, dec: -40.0 },
      { ra: 335.0, dec: -35.0 },
      { ra: 340.0, dec: -40.0 },
      { ra: 345.0, dec: -45.0 },
    ],
  },
  // 凤凰座
  {
    constellation: "Phe",
    coords: [
      { ra: 0.0, dec: -45.0 },
      { ra: 10.0, dec: -45.0 },
      { ra: 15.0, dec: -50.0 },
      { ra: 20.0, dec: -45.0 },
    ],
  },
  // 波江座
  {
    constellation: "Eri",
    coords: [
      { ra: 20.0, dec: -25.0 },
      { ra: 30.0, dec: -30.0 },
      { ra: 40.0, dec: -35.0 },
      { ra: 50.0, dec: -40.0 },
      { ra: 55.0, dec: -45.0 },
      { ra: 60.0, dec: -50.0 },
    ],
  },
  // 水蛇座
  {
    constellation: "Hyi",
    coords: [
      { ra: 0.0, dec: -70.0 },
      { ra: 10.0, dec: -75.0 },
      { ra: 20.0, dec: -70.0 },
    ],
  },
  // 剑鱼座
  {
    constellation: "Dor",
    coords: [
      { ra: 80.0, dec: -60.0 },
      { ra: 85.0, dec: -65.0 },
      { ra: 90.0, dec: -60.0 },
    ],
  },
  // 网罟座
  {
    constellation: "Ret",
    coords: [
      { ra: 60.0, dec: -60.0 },
      { ra: 65.0, dec: -65.0 },
      { ra: 70.0, dec: -60.0 },
      { ra: 65.0, dec: -55.0 },
      { ra: 60.0, dec: -60.0 },
    ],
  },
  // 时钟座
  {
    constellation: "Hor",
    coords: [
      { ra: 60.0, dec: -50.0 },
      { ra: 65.0, dec: -55.0 },
      { ra: 70.0, dec: -50.0 },
    ],
  },
  // 绘架座
  {
    constellation: "Pic",
    coords: [
      { ra: 80.0, dec: -50.0 },
      { ra: 85.0, dec: -55.0 },
      { ra: 90.0, dec: -50.0 },
    ],
  },
  // 飞鱼座
  {
    constellation: "Vol",
    coords: [
      { ra: 120.0, dec: -70.0 },
      { ra: 125.0, dec: -65.0 },
      { ra: 130.0, dec: -70.0 },
    ],
  },
  // 苍蝇座
  {
    constellation: "Mus",
    coords: [
      { ra: 150.0, dec: -70.0 },
      { ra: 155.0, dec: -65.0 },
      { ra: 160.0, dec: -70.0 },
      { ra: 155.0, dec: -75.0 },
      { ra: 150.0, dec: -70.0 },
    ],
  },
  // 蝘蜓座
  {
    constellation: "Cha",
    coords: [
      { ra: 130.0, dec: -80.0 },
      { ra: 135.0, dec: -75.0 },
      { ra: 140.0, dec: -80.0 },
    ],
  },
  // 天燕座
  {
    constellation: "Aps",
    coords: [
      { ra: 200.0, dec: -70.0 },
      { ra: 205.0, dec: -75.0 },
      { ra: 210.0, dec: -70.0 },
    ],
  },
  // 三角座
  {
    constellation: "Tri",
    coords: [
      { ra: 30.0, dec: 30.0 },
      { ra: 35.0, dec: 35.0 },
      { ra: 40.0, dec: 30.0 },
      { ra: 35.0, dec: 25.0 },
      { ra: 30.0, dec: 30.0 },
    ],
  },
  // 雕具座
  {
    constellation: "Cae",
    coords: [
      { ra: 60.0, dec: -40.0 },
      { ra: 65.0, dec: -35.0 },
      { ra: 70.0, dec: -40.0 },
    ],
  },
  // 后发座
  {
    constellation: "Com",
    coords: [
      { ra: 180.0, dec: 20.0 },
      { ra: 185.0, dec: 25.0 },
      { ra: 190.0, dec: 20.0 },
    ],
  },
  // 南冕座
  {
    constellation: "CrA",
    coords: [
      { ra: 280.0, dec: -40.0 },
      { ra: 285.0, dec: -35.0 },
      { ra: 290.0, dec: -40.0 },
      { ra: 285.0, dec: -45.0 },
      { ra: 280.0, dec: -40.0 },
    ],
  },
  // 小马座
  {
    constellation: "Equ",
    coords: [
      { ra: 310.0, dec: 5.0 },
      { ra: 315.0, dec: 10.0 },
      { ra: 320.0, dec: 5.0 },
    ],
  },
  // 狐狸座
  {
    constellation: "Vul",
    coords: [
      { ra: 290.0, dec: 25.0 },
      { ra: 295.0, dec: 25.0 },
      { ra: 300.0, dec: 20.0 },
    ],
  },
  // 天箭座
  {
    constellation: "Sge",
    coords: [
      { ra: 285.0, dec: 15.0 },
      { ra: 290.0, dec: 20.0 },
      { ra: 295.0, dec: 15.0 },
    ],
  },
  // 海豚座
  {
    constellation: "Del",
    coords: [
      { ra: 305.0, dec: 10.0 },
      { ra: 310.0, dec: 15.0 },
      { ra: 315.0, dec: 10.0 },
      { ra: 310.0, dec: 5.0 },
      { ra: 305.0, dec: 10.0 },
    ],
  },
  // 蝎虎座
  {
    constellation: "Lac",
    coords: [
      { ra: 330.0, dec: 45.0 },
      { ra: 335.0, dec: 50.0 },
      { ra: 340.0, dec: 45.0 },
      { ra: 335.0, dec: 40.0 },
    ],
  },
  // 猎犬座
  {
    constellation: "CVn",
    coords: [
      { ra: 200.0, dec: 40.0 },
      { ra: 205.0, dec: 35.0 },
      { ra: 210.0, dec: 40.0 },
    ],
  },
];

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
  return CONSTELLATIONS.findIndex((c) => c.abbr === abbr);
}

/**
 * 获取星座信息
 */
export function getConstellation(abbr) {
  return CONSTELLATIONS.find((c) => c.abbr === abbr);
}

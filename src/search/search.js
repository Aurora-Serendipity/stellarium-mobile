/**
 * 天体搜索功能
 * 支持恒星、星座、深空天体搜索
 */

export class SearchEngine {
  constructor(stars, constellations, dsoObjects) {
    this.stars = stars || [];
    this.constellations = constellations || [];
    this.dsoObjects = dsoObjects || [];

    // 构建搜索索引
    this._buildIndex();
  }

  _buildIndex() {
    this.index = [];

    // 索引恒星
    for (const star of this.stars) {
      if (star.name) {
        this.index.push({
          type: 'star',
          name: star.name,
          aliases: [star.bayer, star.name].filter(Boolean),
          data: star,
          ra: star.ra,
          dec: star.dec
        });
      }
    }

    // 索引星座
    for (const con of this.constellations) {
      this.index.push({
        type: 'constellation',
        name: con.name,
        aliases: [con.name, con.latin, con.abbr].filter(Boolean),
        data: con,
        ra: con.ra,
        dec: con.dec
      });
    }

    // 索引深空天体
    for (const obj of this.dsoObjects) {
      const names = [obj.m, obj.name, obj.ngc].filter(Boolean);
      if (names.length > 0) {
        this.index.push({
          type: 'dso',
          name: obj.name || obj.m,
          aliases: names,
          data: obj,
          ra: obj.ra,
          dec: obj.dec
        });
      }
    }
  }

  /**
   * 搜索
   */
  search(query, limit = 10) {
    if (!query || query.length < 2) return [];

    const lowerQuery = query.toLowerCase();
    const results = [];

    for (const item of this.index) {
      let score = 0;

      // 精确匹配名称
      if (item.name.toLowerCase() === lowerQuery) {
        score = 100;
      }
      // 开头匹配
      else if (item.name.toLowerCase().startsWith(lowerQuery)) {
        score = 80;
      }
      // 包含匹配
      else if (item.name.toLowerCase().includes(lowerQuery)) {
        score = 60;
      }
      // 别名匹配
      else {
        for (const alias of item.aliases) {
          if (alias && alias.toLowerCase().includes(lowerQuery)) {
            score = 50;
            break;
          }
        }
      }

      if (score > 0) {
        results.push({ ...item, score });
      }
    }

    // 按分数排序
    results.sort((a, b) => b.score - a.score);

    return results.slice(0, limit);
  }

  /**
   * 获取天体详细信息
   */
  getObjectDetails(object) {
    const { type, data } = object;

    switch (type) {
      case 'star':
        return this._getStarDetails(data);
      case 'constellation':
        return this._getConstellationDetails(data);
      case 'dso':
        return this._getDSODetails(data);
      default:
        return null;
    }
  }

  _getStarDetails(star) {
    const spectralDesc = {
      'O': '极热蓝巨星', 'B': '热蓝白星', 'A': '白星',
      'F': '黄白星', 'G': '黄星（类似太阳）',
      'K': '橙巨星', 'M': '红矮星/巨星'
    };

    const spType = star.spectralType ? star.spectralType.charAt(0) : '?';

    return {
      title: star.name || star.bayer || `恒星 #${star.id}`,
      subtitle: star.bayer || '',
      type: '恒星',
      details: [
        { label: '视星等', value: star.magnitude.toFixed(2) },
        { label: '光谱型', value: star.spectralType || '未知' },
        { label: '色指数', value: star.colorIndex?.toFixed(2) || '未知' },
        { label: '距离', value: star.parallax > 0 ? `${(1000/star.parallax).toFixed(1)} 光年` : '未知' },
        { label: '赤经', value: `${star.ra.toFixed(2)}°` },
        { label: '赤纬', value: `${star.dec.toFixed(2)}°` },
        { label: '星座', value: star.constellation || '未知' }
      ],
      description: spectralDesc[spType] || '恒星'
    };
  }

  _getConstellationDetails(con) {
    return {
      title: con.name,
      subtitle: con.latin,
      type: '星座',
      details: [
        { label: '缩写', value: con.abbr },
        { label: '中心赤经', value: `${con.ra.toFixed(1)}°` },
        { label: '中心赤纬', value: `${con.dec.toFixed(1)}°` }
      ],
      description: `${con.name}（${con.latin}）是88个现代星座之一。`
    };
  }

  _getDSODetails(obj) {
    const typeNames = {
      'G': '星系', 'N': '发射星云', 'PN': '行星状星云',
      'OC': '疏散星团', 'GC': '球状星团',
      'SNR': '超新星遗迹', 'MUL': '复合天体'
    };

    return {
      title: `${obj.m} ${obj.name || ''}`,
      subtitle: obj.ngc || '',
      type: typeNames[obj.type] || obj.type,
      details: [
        { label: '梅西耶编号', value: obj.m },
        { label: '视星等', value: obj.mag.toString() },
        { label: '角直径', value: obj.size || '未知' },
        { label: '赤经', value: `${obj.ra.toFixed(1)}°` },
        { label: '赤纬', value: `${obj.dec.toFixed(1)}°` },
        { label: '星座', value: obj.con }
      ],
      description: obj.desc || `${typeNames[obj.type] || obj.type}，位于${obj.con}座方向。`
    };
  }
}

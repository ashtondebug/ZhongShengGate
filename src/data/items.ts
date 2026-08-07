import type { ItemDefinition } from '@/types'

export const items: ItemDefinition[] = [
  {
    id: 'linglu',
    name: '灵露',
    icon: 'fa-solid fa-droplet',
    category: 'consumable',
    description: '山间凝成的灵露，饮下可恢复大量生命。',
    sellPrice: 6,
    healHp: 35,
  },
  {
    id: 'ningshenxiang',
    name: '凝神香',
    icon: 'fa-solid fa-fire-flame-curved',
    category: 'consumable',
    description: '点燃后宁神静气，回复灵力的消耗品。',
    sellPrice: 6,
    restoreSpirit: 30,
  },
  {
    id: 'guwen',
    name: '古纹残片',
    icon: 'fa-solid fa-shield-halved',
    category: 'material',
    description: '遗迹中拾得的古纹残片，可换取灵晶。',
    sellPrice: 12,
  },
  {
    id: 'xukongjing',
    name: '虚空结晶',
    icon: 'fa-solid fa-cube',
    category: 'material',
    description: '虚空之力凝结的晶体，价值不菲。',
    sellPrice: 22,
  },
  {
    id: 'xingsui',
    name: '星髓',
    icon: 'fa-solid fa-star',
    category: 'material',
    description: '陨落星辰的内髓，稀有材料。',
    sellPrice: 35,
  },
  {
    id: 'chuanshuo',
    name: '传说余烬',
    icon: 'fa-solid fa-fire',
    category: 'relic',
    description: '只有击败传说存在才能获得的遗物，藏于虚空深处。',
    sellPrice: 60,
  },
]

import type { PathDefinition } from '@/types'

export const paths: PathDefinition[] = [
  {
    id: 'human',
    name: '人类探索者',
    description:
      '依托科技与强适应力行走众生界。初始均衡、生存坚韧，但灵力亲和较弱，能力成长偏慢。',
    icon: 'fa-solid fa-user-gear',
    accent: '#38bdf8',
    stats: { spirit: 6, capacity: 12, perception: 7, control: 6, constitution: 9, luck: 7 },
    startingSkills: ['object-manipulation'],
  },
  {
    id: 'awakened',
    name: '灵能觉醒者',
    description:
      '灵力天赋异禀，能力开发速度极快，但初期体质脆弱。中后期可掌握更强的元素与空间奥义。',
    icon: 'fa-solid fa-hand-sparkles',
    accent: '#a78bfa',
    stats: { spirit: 9, capacity: 9, perception: 8, control: 8, constitution: 5, luck: 6 },
    startingSkills: ['spark'],
  },
  {
    id: 'walker',
    name: '异界行者',
    description:
      '长期穿梭于门与界之间，探索与感知能力出众，对未知空间的适应力异于常人。',
    icon: 'fa-solid fa-route',
    accent: '#22d3ee',
    stats: { spirit: 7, capacity: 8, perception: 10, control: 7, constitution: 7, luck: 8 },
    startingSkills: ['spatial-jump'],
  },
]
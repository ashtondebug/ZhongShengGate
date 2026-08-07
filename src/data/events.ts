import type { ExplorationEvent } from '@/types'

export const events: ExplorationEvent[] = [
  {
    id: 'forest-spring',
    name: '灵泉微光',
    flavor: '林间突然泛起一缕青蓝的微光，一泓灵泉正悄然涌出，灵晶在泉底若隐若现。',
    type: 'resource',
    icon: 'fa-solid fa-droplet',
    options: [
      {
        id: 'take',
        label: '采集灵晶',
        icon: 'fa-solid fa-hand-holding-heart',
        consequence: {
          successText: '你小心地汲取泉水，收获了不少灵晶，也窥得一丝灵力运转的轨迹。',
          rewards: { crystals: 12 },
          exp: 10,
        },
      },
      {
        id: 'observe',
        label: '感知泉眼',
        icon: 'fa-solid fa-eye',
        requires: { stat: 'perception', value: 7 },
        consequence: {
          successText: '你的感知洞悉了灵泉的脉络，灵晶与碎屑尽收囊中，对灵力的理解也更深了一层。',
          failText: '泉水太浅，你并未察觉更多，只得到部分灵晶。',
          rewards: { crystals: 18, shards: 1 },
          exp: 18,
        },
      },
    ],
  },
  {
    id: 'forest-anomaly',
    name: '异常灵力波动',
    flavor: '检测到异常灵力波动……树影深处似有异物穿行，发出低沉的嗡鸣。',
    type: 'battle',
    icon: 'fa-solid fa-triangle-exclamation',
    options: [
      {
        id: 'fight',
        label: '战斗',
        icon: 'fa-solid fa-bolt',
        consequence: { requireBattle: true },
      },
      {
        id: 'retreat',
        label: '撤退',
        icon: 'fa-solid fa-shield',
        consequence: { successText: '你谨慎地后撤，未惊动那个存在。', rewards: { actionPoints: 0 } },
      },
      {
        id: 'scout',
        label: '探查',
        icon: 'fa-solid fa-mercury',
        requires: { stat: 'perception', value: 8 },
        consequence: {
          successText: '你提前窥见了对方的要害，战斗将更为有利。',
          rewards: { shards: 1 },
        },
      },
    ],
  },
  {
    id: 'forest-heart',
    name: '古老的树心',
    flavor: '一棵巨树矗立林中，树心透出柔和的光芒，似乎寄存着某种古老讯息。',
    type: 'story',
    icon: 'fa-solid fa-tree',
    options: [
      {
        id: 'listen',
        label: '倾听',
        icon: 'fa-solid fa-ear-listen',
        requires: { stat: 'perception', value: 6 },
        consequence: {
          successText: '你聆听了树灵的述说，获得一段隐秘世界的碎片，灵识也随之开阔。',
          rewards: { shards: 2 },
          exp: 22,
        },
      },
      {
        id: 'extract',
        label: '抽取灵力',
        icon: 'fa-solid fa-bolt',
        consequence: {
          successText: '你从树心汲取灵力，经脉间传来温热的力量。',
          rewards: { crystals: 8, shards: 1 },
          exp: 12,
        },
      },
    ],
  },
  {
    id: 'ruins-pillar',
    name: '符文残柱',
    flavor: '一根刻满古老符文的石柱斜插于地，符文明灭不定，仿佛还在等待回应。',
    type: 'resource',
    icon: 'fa-solid fa-table-columns',
    options: [
      {
        id: 'decipher',
        label: '解读符文',
        icon: 'fa-solid fa-file-lines',
        requires: { stat: 'perception', value: 8 },
        consequence: {
          successText: '你将符文破译，残缺的阵法稳定，稀有材料随之显现。',
          failText: '翻译出错，符文反震刺痛了你的手臂。',
          rewards: { shards: 3 },
          damage: 4,
        },
      },
      {
        id: 'break',
        label: '强行破除',
        icon: 'fa-solid fa-hammer',
        consequence: { successText: '你砸碎石柱，从碎片中拾得材料。', rewards: { shards: 2 } },
      },
    ],
  },
  {
    id: 'ruins-trap',
    name: '崩陷陷阱',
    flavor: '脚下的石板骤然下沉，机关启动的刺耳声与地底空响接连传来。',
    type: 'battle',
    icon: 'fa-solid fa-earth-americas',
    options: [
      {
        id: 'fight',
        label: '战斗',
        icon: 'fa-solid fa-bolt',
        consequence: { requireBattle: true },
      },
      {
        id: 'jump',
        label: '空间跃迁',
        icon: 'fa-solid fa-arrows-to-dot',
        requires: { stat: 'control', value: 8 },
        consequence: {
          successText: '你精准跃迁，避开了机关的覆盖范围。',
          rewards: { crystals: 6 },
        },
      },
    ],
  },
  {
    id: 'ruins-relic',
    name: '古代遗物',
    flavor: '尘埃中埋着一件古器，灵力纹路仍隐隐流转，带来一阵沉重的压迫感。',
    type: 'story',
    icon: 'fa-solid fa-building-shield',
    options: [
      {
        id: 'inspect',
        label: '研究',
        icon: 'fa-solid fa-magnifying-glass',
        consequence: { rewards: { shards: 3 }, exp: 40 },
      },
      {
        id: 'sell',
        label: '换取资源',
        icon: 'fa-solid fa-money-bill-wave',
        consequence: { rewards: { crystals: 25 } },
      },
    ],
  },
  {
    id: 'void-whisper',
    name: '虚空低语',
    flavor: '耳畔传来不属于此地的低语，你无法判断它来自门内还是门外。',
    type: 'story',
    icon: 'fa-solid fa-volume-high',
    options: [
      {
        id: 'resist',
        label: '坚守本心',
        icon: 'fa-solid fa-socks',
        requires: { stat: 'constitution', value: 8 },
        consequence: {
          successText: '你稳住了心神，从低语中捕捉到空间的碎片。',
          failText: '低语侵入心识，你虚弱地退后了几步。',
          rewards: { cores: 1 },
          damage: 6,
        },
      },
      {
        id: 'flee',
        label: '逃离此地',
        icon: 'fa-solid fa-person-running',
        consequence: { successText: '你果断远离了这片扭曲的空间。' },
      },
    ],
  },
  {
    id: 'void-rift',
    name: '空间裂隙',
    flavor: '一道裂隙正吞吐着幽紫色的能量，空白的裂隙里似乎闯入了某个捕食者。',
    type: 'battle',
    icon: 'fa-solid fa-bolt',
    options: [
      {
        id: 'fight',
        label: '战斗',
        icon: 'fa-solid fa-bolt',
        consequence: { requireBattle: true },
      },
      {
        id: 'seal',
        label: '尝试封印',
        icon: 'fa-solid fa-lock',
        requires: { stat: 'control', value: 9 },
        consequence: {
          successText: '你以强大的控制力封住了裂隙，收获未知核心。',
          failText: '封印反噬，你被虚空之风吹伤。',
          rewards: { cores: 1 },
          damage: 8,
        },
      },
    ],
  },
  {
    id: 'void-orb',
    name: '虚空之晶',
    flavor: '一枚悬浮的暗紫晶核悬在半空，内里流转着肉眼可见的灵力。',
    type: 'resource',
    icon: 'fa-solid fa-spinner',
    options: [
      {
        id: 'grasp',
        label: '夺取',
        icon: 'fa-solid fa-hand',
        requires: { stat: 'control', value: 7 },
        consequence: {
          successText: '你将其摘下，收获了一枚珍贵的核心。',
          failText: '晶核剧烈震颤飞出，你仅抓住几块碎片。',
          rewards: { cores: 1, shards: 2 },
        },
      },
    ],
  },
  {
    id: 'city-market',
    name: '灵市交易',
    flavor: '灵市喧闹，摊主向你招了招手，灵石与材料堆满案台。',
    type: 'resource',
    icon: 'fa-solid fa-bag-shopping',
    options: [
      {
        id: 'buy',
        label: '采买灵能碎片',
        icon: 'fa-solid fa-cart-shopping',
        consequence: {
          successText: '你以灵晶换取了灵能碎片。',
          failText: '灵晶不足，未能成交。',
          rewards: { shards: 2 },
        },
      },
      {
        id: 'yak',
        label: '与摊贩闲聊',
        icon: 'fa-solid fa-comment-dots',
        requires: { stat: 'luck', value: 7 },
        consequence: {
          successText: '摊贩心情大好，多赠你一些灵晶。',
          rewards: { crystals: 15 },
        },
      },
    ],
  },
  {
    id: 'city-bounty',
    name: '悬赏令',
    flavor: '悬赏榜前人声鼎沸，新的狩猎委托悬浮在半空之上。',
    type: 'battle',
    icon: 'fa-solid fa-bullseye',
    options: [
      {
        id: 'take',
        label: '接下悬赏',
        icon: 'fa-solid fa-bullseye',
        consequence: { requireBattle: true },
      },
    ],
  },
  {
    id: 'city-rumor',
    name: '市井传闻',
    flavor: '酒馆里有人压低了声音，谈及门后的诸多禁忌秘辛。',
    type: 'story',
    icon: 'fa-solid fa-mug-saucer',
    options: [
      {
        id: 'listen',
        label: '细听',
        icon: 'fa-solid fa-ear-listening',
        consequence: { rewards: { crystals: 5 }, exp: 25 },
      },
    ],
  },
  {
    id: 'spiritrealm-duel',
    name: '妖灵决斗',
    flavor: '一道高亢的啸声划破长空，一位灵力高强的妖灵正傲立于际半的战场之上。',
    type: 'battle',
    icon: 'fa-solid fa-dragon',
    options: [
      {
        id: 'fight',
        label: '接受挑战',
        icon: 'fa-solid fa-dragon',
        consequence: { requireBattle: true },
      },
    ],
  },
  {
    id: 'spiritrealm-trial',
    name: '灵能试炼',
    icon: 'fa-solid fa-fire-flame-simple',
    flavor: '灵力之环在此环绕，唯有通过试炼者，方能获得其真正的传承。',
    type: 'resource',
    options: [
      {
        id: 'face',
        label: '接受试炼',
        icon: 'fa-solid fa-bolt',
        requires: { stat: 'spirit', value: 8 },
        consequence: {
          successText: '你成功通过试炼，获得一份强大传承。',
          failText: '试炼撕碎的你的防御，你浑身是伤地退出。',
          rewards: { cores: 2, shards: 3 },
          damage: 8,
        },
      },
    ],
  },
  {
    id: 'void-boss',
    name: '深空之影',
    flavor: '阴影猛然凝固成一个庞大的轮廓，一双空洞的眼眸正俯视着你——那是属于门后的寂静。',
    type: 'battle',
    icon: 'fa-solid fa-skull',
    options: [
      {
        id: 'fight',
        label: '迎战',
        icon: 'fa-solid fa-bolt',
        consequence: { requireBattle: true },
      },
      {
        id: 'flee',
        label: '屏息退避',
        icon: 'fa-solid fa-person-running',
        consequence: {
          successText: '你屏住呼吸悄然退离，那个轮廓缓缓消散于虚空。',
          rewards: { actionPoints: 0 },
        },
      },
    ],
  },
]
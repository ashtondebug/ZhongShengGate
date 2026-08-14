import type { EquipmentDefinition, ItemDefinition, PlayerState } from '@/types'
import { items, equipment } from '@/data'
import { payCost } from './resourceSystem'
import { addItem } from './inventorySystem'

/**
 * 获取商城可购消耗品（药品）定义：消耗品且配置了金币价格。
 */
export function shopItemDef(itemId: string): ItemDefinition | undefined {
  const def = items.find((i) => i.id === itemId)
  return def && def.price ? def : undefined
}

/**
 * 获取法宝装备定义。
 */
export function equipmentDef(itemId: string): EquipmentDefinition | undefined {
  return equipment.find((e) => e.id === itemId)
}

/**
 * 查询某商品的金币售价（不可购买的剧情物品返回 0）。
 */
export function shopPriceOf(itemId: string): number {
  const it = shopItemDef(itemId)
  if (it) return it.price ?? 0
  const eq = equipmentDef(itemId)
  if (eq && eq.purchasable) return eq.price
  return 0
}

/**
 * 购买商品：金币充足则扣款并入背包，否则返回 null。
 */
export function buyItem(player: PlayerState, itemId: string): PlayerState | null {
  const price = shopPriceOf(itemId)
  if (price <= 0 || player.resources.coins < price) return null
  return {
    ...player,
    resources: payCost(player.resources, { coins: price }),
    inventory: addItem(player.inventory, itemId, 1),
  }
}

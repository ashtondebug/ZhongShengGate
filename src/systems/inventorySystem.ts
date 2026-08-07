import type { InventoryItem, ItemDefinition, PlayerState } from '@/types'
import { items } from '@/data'

/**
 * 获取物品定义。
 */
export function itemDef(itemId: string): ItemDefinition | undefined {
  return items.find((i) => i.id === itemId)
}

/**
 * 物品入包（堆叠合并）。
 */
export function addItem(
  inventory: InventoryItem[],
  itemId: string,
  quantity = 1,
): InventoryItem[] {
  const existing = inventory.find((it) => it.itemId === itemId)
  if (existing) {
    return inventory.map((it) =>
      it.itemId === itemId ? { ...it, quantity: it.quantity + quantity } : it,
    )
  }
  return [...inventory, { itemId, quantity }]
}

/**
 * 批量加入多个物品。
 */
export function addItems(
  inventory: InventoryItem[],
  entries: { itemId: string; quantity: number }[],
): InventoryItem[] {
  return entries.reduce((acc, e) => addItem(acc, e.itemId, e.quantity), inventory)
}

/**
 * 查询物品持有数量。
 */
export function countOf(inventory: InventoryItem[], itemId: string): number {
  return inventory.find((it) => it.itemId === itemId)?.quantity ?? 0
}

/**
 * 从背包移除指定数量（数量不足则返回 null）。
 */
export function removeItem(
  inventory: InventoryItem[],
  itemId: string,
  quantity = 1,
): InventoryItem[] | null {
  const held = countOf(inventory, itemId)
  if (held < quantity) return null
  const next = inventory
    .map((it) => (it.itemId === itemId ? { ...it, quantity: it.quantity - quantity } : it))
    .filter((it) => it.quantity > 0)
  return next
}

/**
 * 使用消耗品：按物品功效恢复生命/灵力。
 */
export function useItem(player: PlayerState, itemId: string): PlayerState | null {
  const def = itemDef(itemId)
  if (!def || def.category !== 'consumable') return null
  if (!def.healHp && !def.restoreSpirit) return null
  const inventory = removeItem(player.inventory, itemId, 1)
  if (!inventory) return null
  return {
    ...player,
    hp: Math.min(player.maxHp, player.hp + (def.healHp ?? 0)),
    spirit: Math.min(player.maxSpirit, player.spirit + (def.restoreSpirit ?? 0)),
    inventory,
  }
}

/**
 * 出售物品换取灵晶。
 */
export function sellItems(
  player: PlayerState,
  itemId: string,
  quantity = 1,
): PlayerState | null {
  const def = itemDef(itemId)
  if (!def || def.sellPrice <= 0) return null
  const inventory = removeItem(player.inventory, itemId, quantity)
  if (!inventory) return null
  return {
    ...player,
    inventory,
    resources: {
      ...player.resources,
      crystals: player.resources.crystals + def.sellPrice * quantity,
    },
  }
}

"use client"

import { useEffect, useState } from "react"

type CartItem = {
  id: string | number
  name: string
  price?: number
  unit?: string
  quantity: number
  [key: string]: any
}

const ITEMS_KEY = "easyconstruct_cart_items"

function readItems(): CartItem[] {
  try {
    const v = localStorage.getItem(ITEMS_KEY)
    return v ? (JSON.parse(v) as CartItem[]) : []
  } catch {
    return []
  }
}

function writeItems(items: CartItem[]) {
  try {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items))
    const count = items.reduce((s, it) => s + (Number(it.quantity) || 0), 0)
    // notify same-window listeners
    window.dispatchEvent(new CustomEvent("easyconstruct:cart:update", { detail: { count, items } }))
  } catch {
    // ignore
  }
}

export function addItem(item: Omit<CartItem, "quantity">, amount = 1) {
  const items = readItems()
  const existing = items.find((i) => String(i.id) === String(item.id))
  if (existing) {
    existing.quantity = (existing.quantity || 0) + amount
  } else {
    items.push({ ...item, quantity: amount } as CartItem)
  }
  writeItems(items)
  return items
}

export function removeItem(id: string | number) {
  const items = readItems().filter((i) => String(i.id) !== String(id))
  writeItems(items)
  return items
}

export function updateQuantity(id: string | number, quantity: number) {
  const items = readItems()
  const existing = items.find((i) => String(i.id) === String(id))
  if (existing) {
    existing.quantity = quantity
    if (existing.quantity <= 0) {
      return removeItem(id)
    }
  }
  writeItems(items)
  return items
}

export function clearCart() {
  writeItems([])
}

export function getCartItems() {
  return readItems()
}

export function getCartCount() {
  return readItems().reduce((s, it) => s + (Number(it.quantity) || 0), 0)
}

export default function useCart() {
  // Start with an empty cart on the first render so server and client markup
  // stay consistent. Populate from localStorage after mount.
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    setItems(readItems())
  }, [])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === ITEMS_KEY) {
        setItems(readItems())
      }
    }

    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent).detail as any
      if (detail && Array.isArray(detail.items)) setItems(detail.items)
      else setItems(readItems())
    }

    window.addEventListener("storage", onStorage)
    window.addEventListener("easyconstruct:cart:update", onCustom as EventListener)

    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("easyconstruct:cart:update", onCustom as EventListener)
    }
  }, [])

  const add = (item: Omit<CartItem, "quantity">, amt = 1) => {
    const next = addItem(item, amt)
    setItems(next)
    return next
  }

  const remove = (id: string | number) => {
    const next = removeItem(id)
    setItems(next)
    return next
  }

  const update = (id: string | number, qty: number) => {
    const next = updateQuantity(id, qty)
    setItems(next)
    return next
  }

  const clear = () => {
    clearCart()
    setItems([])
  }

  const count = items.reduce((s, it) => s + (Number(it.quantity) || 0), 0)

  return { items, count, add, remove, update, clear }
}

import { useEffect, useRef } from 'react'
import { useOnline } from './useOnline'
import { db } from '@/db'

const API_URL = 'http://localhost:3001/api/sync'

export function useSyncEngine() {
  const isOnline = useOnline()
  const syncInProgress = useRef(false)

  useEffect(() => {
    if (!isOnline || syncInProgress.current) return

    const runSync = async () => {
      const token = localStorage.getItem('token')
      if (!token) return

      syncInProgress.current = true
      try {
        // 1. PUSH (Client -> Server)
        const pendingFood = await db.food_logs.where('syncStatus').equals('pending').toArray()
        const pendingCategories = await db.categories.where('syncStatus').equals('pending').toArray()
        const pendingTransactions = await db.transactions.where('syncStatus').equals('pending').toArray()
        const pendingActivity = await db.activity_logs.where('syncStatus').equals('pending').toArray()
        const pendingSleep = await db.sleep_logs.where('syncStatus').equals('pending').toArray()

        const hasPending = pendingFood.length || pendingCategories.length || 
                           pendingTransactions.length || pendingActivity.length || pendingSleep.length

        if (hasPending) {
          const pushRes = await fetch(`${API_URL}/push`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              changes: {
                foodLogs: pendingFood,
                categories: pendingCategories,
                transactions: pendingTransactions,
                activityLogs: pendingActivity,
                sleepLogs: pendingSleep
              }
            })
          })

          if (pushRes.ok) {
            // Mark as synced
            await db.transaction('rw', [db.food_logs, db.categories, db.transactions, db.activity_logs, db.sleep_logs], async () => {
              for (const item of pendingFood) await db.food_logs.update(item.id!, { syncStatus: 'synced' })
              for (const item of pendingCategories) await db.categories.update(item.id!, { syncStatus: 'synced' })
              for (const item of pendingTransactions) await db.transactions.update(item.id!, { syncStatus: 'synced' })
              for (const item of pendingActivity) await db.activity_logs.update(item.id!, { syncStatus: 'synced' })
              for (const item of pendingSleep) await db.sleep_logs.update(item.id!, { syncStatus: 'synced' })
            })
          }
        }

        // 2. PULL (Server -> Client)
        const lastSync = localStorage.getItem('lastSync') || '1970-01-01T00:00:00.000Z'
        const pullRes = await fetch(`${API_URL}/pull?lastSync=${encodeURIComponent(lastSync)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (pullRes.ok) {
          const { changes, timestamp } = await pullRes.json()
          
          await db.transaction('rw', [db.food_logs, db.categories, db.transactions, db.activity_logs, db.sleep_logs], async () => {
            const upsert = async (table: any, items: any[]) => {
              for (const item of items) {
                // Ensure pulled items are marked synced
                item.syncStatus = 'synced'
                await table.put(item)
              }
            }
            await upsert(db.food_logs, changes.foodLogs || [])
            await upsert(db.categories, changes.categories || [])
            await upsert(db.transactions, changes.transactions || [])
            await upsert(db.activity_logs, changes.activityLogs || [])
            await upsert(db.sleep_logs, changes.sleepLogs || [])
          })

          localStorage.setItem('lastSync', timestamp)
        }

      } catch (err) {
        console.error('Sync failed:', err)
      } finally {
        syncInProgress.current = false
      }
    }

    runSync()
    
    // Optional: set up interval to sync every X minutes if online
    const interval = setInterval(runSync, 1000 * 60 * 5) // 5 minutes
    return () => clearInterval(interval)

  }, [isOnline])
}

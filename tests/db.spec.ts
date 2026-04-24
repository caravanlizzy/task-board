import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock pg to avoid ESM/CJS issues
vi.mock('pg', () => {
  return {
    Pool: vi.fn(() => ({
      query: vi.fn().mockResolvedValue({ rows: [] }),
      on: vi.fn()
    }))
  }
})

import db from '../server/utils/db'
import * as fs from 'fs'

describe('Database Utility', () => {
  const testDbPath = 'test-tasks.db'

  beforeEach(async () => {
    // We are relying on the fact that db.js uses DB_PATH env var if provided
    // or we can just test the existing db instance if it's already initialized to a file.
    // However, db.js initializes immediately on import.
  })

  afterEach(() => {
    // Cleanup test database if we created one
    if (fs.existsSync(testDbPath)) {
      // fs.unlinkSync(testDbPath)
    }
  })

  it('can add and retrieve tasks', async () => {
    const task = await db.addTask('Test Task', 'Test Description', 'High', 'To Do')
    expect(task.id).toBeDefined()
    expect(task.title).toBe('Test Task')

    const tasks = await db.getTasks()
    expect(tasks.some(t => t.id === task.id)).toBe(true)
  })

  it('can update a task', async () => {
    const task = await db.addTask('Old Title', 'Old Desc', 'Low', 'To Do')
    const updated = await db.updateTask(task.id, 'New Title', 'New Desc', 'Medium', 'In Progress')
    
    expect(updated.title).toBe('New Title')
    expect(updated.status).toBe('In Progress')

    const fetched = await db.getTaskById(task.id)
    expect(fetched.title).toBe('New Title')
  })

  it('can delete a task', async () => {
    const task = await db.addTask('To be deleted', '', 'Low', 'To Do')
    const deleted = await db.deleteTask(task.id)
    expect(deleted).toBe(true)

    const fetched = await db.getTaskById(task.id)
    expect(fetched).toBeUndefined()
  })
})

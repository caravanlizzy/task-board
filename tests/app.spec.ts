import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import App from '../app/app.vue'

describe('App', () => {
  it('renders the task board title', async () => {
    const component = await mountSuspended(App)
    expect(component.text()).toContain('Task Board')
  })

  it('contains the Add Task button', async () => {
    const component = await mountSuspended(App)
    // Looking for the button by text instead of just tag, 
    // especially since @nuxt/ui might render buttons differently or there might be multiple.
    const buttons = component.findAll('button')
    const addTaskButton = buttons.find(b => b.text().includes('Add Task'))
    expect(addTaskButton).toBeDefined()
  })
})

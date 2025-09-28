// Unit tests for Payload CMS integration utilities

import { payloadClient, getHomePageContent, getExperiencesPageContent, getCmsStatus } from '../payload'

describe('Payload Client', () => {
  it('has required methods', () => {
    expect(typeof payloadClient.getHomePage).toBe('function')
    expect(typeof payloadClient.getExperiencesPage).toBe('function')
    expect(typeof payloadClient.getSurfWeeksPage).toBe('function')
    expect(typeof payloadClient.getPage).toBe('function')
  })
})

describe('Content Fetching Functions', () => {
  it('getHomePageContent returns valid content', async () => {
    const content = await getHomePageContent()
    expect(content).toBeDefined()
    expect(content.hero).toBeDefined()
    expect(content.featureCards).toBeDefined()
    expect(content.videoEmbed).toBeDefined()
  })

  it('getExperiencesPageContent returns valid content', async () => {
    const content = await getExperiencesPageContent()
    expect(content).toBeDefined()
    expect(Array.isArray(content.experiences)).toBe(true)
    expect(content.experiences.length).toBeGreaterThan(0)
  })

  it('getHomePageContent falls back to static content', async () => {
    // Since CMS is not enabled in test environment, should return static content
    const content = await getHomePageContent()
    expect(content.hero.title).toBe('A Wave Away')
  })

  it('getExperiencesPageContent falls back to static content', async () => {
    const content = await getExperiencesPageContent()
    expect(Array.isArray(content.experiences)).toBe(true)
    expect(content.experiences[0].title).toBe('Hiking')
  })
})

describe('CMS Status Functions', () => {
  it('getCmsStatus returns status object', () => {
    const status = getCmsStatus()
    expect(typeof status.enabled).toBe('boolean')
    expect(typeof status.environment).toBe('string')
    expect(typeof status.hasSecret).toBe('boolean')
    expect(typeof status.hasMongoUri).toBe('boolean')
  })

  it('CMS is disabled in test environment', () => {
    const status = getCmsStatus()
    expect(status.enabled).toBe(false)
  })
})

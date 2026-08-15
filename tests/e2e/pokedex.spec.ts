import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { mockPokeApi, startOnCatalog } from './fixtures/pokeapi'

test.describe('Pokédex experience', () => {
  test.beforeEach(async ({ page }) => {
    await mockPokeApi(page)
  })

  test('offers a visible keyboard shortcut to the main content', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-360', 'One viewport covers the keyboard contract')
    await page.goto('/')
    await page.keyboard.press('Tab')
    const skipLink = page.getByRole('link', { name: 'Saltar al contenido', exact: true })
    await expect(skipLink).toBeFocused()
    await expect(skipLink).toBeVisible()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/#main-content$/)
    await expect(page.getByRole('main')).toHaveAttribute('id', 'main-content')
  })

  test('onboarding follows the Figma two-step flow', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-360', 'The source onboarding frame is mobile')
    await page.goto('/')
    await expect(
      page.getByRole('heading', { name: 'Todos los Pokémon en un solo lugar' }),
    ).toBeVisible()
    await expect(page).toHaveScreenshot('onboarding-01.png')
    await page.getByRole('button', { name: 'Continuar' }).click()
    await expect(page.getByRole('heading', { name: 'Mantén tu Pokédex actualizada' })).toBeVisible()
    await expect(page).toHaveScreenshot('onboarding-02.png')
    await page.getByRole('button', { name: 'Empecemos' }).click()
    await expect(page).toHaveURL('/pokedex')
    await expect(page.getByTestId('pokemon-list')).toBeVisible()
  })

  test('onboarding groups its desktop flow without scaling the source artwork', async ({
    page,
  }, testInfo) => {
    test.skip(!testInfo.project.name.startsWith('desktop-'), 'Desktop viewports own this contract')
    await page.goto('/')
    const main = await page.getByRole('main').boundingBox()
    const artwork = await page.getByAltText('Entrenadora Pokémon').boundingBox()
    const action = await page.getByRole('button', { name: 'Continuar', exact: true }).boundingBox()
    expect(main?.x).toBe(0)
    expect(main?.width).toBe(page.viewportSize()?.width)
    expect(artwork?.width).toBe(257)
    expect(action!.y - (artwork!.y + artwork!.height)).toBeLessThan(280)
    expect(action!.y + action!.height).toBeLessThan(page.viewportSize()!.height - 100)
    await expect(page).toHaveScreenshot('onboarding-desktop.png')

    await page.getByRole('button', { name: 'Continuar', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Mantén tu Pokédex actualizada' })).toBeVisible()
    const secondArtwork = await page.getByAltText('Entrenadora lista para comenzar').boundingBox()
    const secondAction = await page.getByRole('button', { name: 'Empecemos' }).boundingBox()
    expect(secondArtwork!.y).toBeGreaterThan(100)
    expect(secondAction!.y - (secondArtwork!.y + secondArtwork!.height)).toBeLessThan(300)
    expect(secondAction!.y + secondAction!.height).toBeLessThan(page.viewportSize()!.height - 100)
    await expect(page).toHaveScreenshot('onboarding-desktop-02.png')
  })

  test('catalog searches, filters and remains usable at the project viewport', async ({
    page,
  }, testInfo) => {
    const browserErrors: string[] = []
    page.on('pageerror', (error) => browserErrors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') browserErrors.push(message.text())
    })
    await startOnCatalog(page)
    await page.goto('/')
    const bulbasaurCard = page.getByRole('link', { name: 'Ver a Bulbasaur', exact: true })
    await expect(bulbasaurCard).toBeVisible()
    await expect(bulbasaurCard.getByTestId('type-icon')).toHaveCount(2)
    await expect(page).toHaveScreenshot('catalog.png')
    const viewport = page.viewportSize()
    expect(viewport).not.toBeNull()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport!.width)
    expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(viewport!.height)
    await expect(page.locator('img:not([width]), img:not([height])')).toHaveCount(0)

    if (testInfo.project.name === 'desktop-1920') {
      const shell = await page.getByTestId('app-shell').boundingBox()
      const catalog = await page.getByRole('region', { name: 'Catálogo Pokémon' }).boundingBox()
      expect(shell?.x).toBe(0)
      expect(shell?.width).toBe(1920)
      expect(catalog?.x).toBe(104)
      expect(catalog?.width).toBe(1816)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(1920)

      const firstRowCards = await Promise.all(
        ['Bulbasaur', 'Ivysaur', 'Venusaur', 'Charmander', 'Charmeleon'].map((name) =>
          page.getByRole('link', { name: `Ver a ${name}`, exact: true }).boundingBox(),
        ),
      )
      expect(firstRowCards.every((box) => box?.y === firstRowCards[0]?.y)).toBe(true)
    }

    await page.getByPlaceholder('Buscar Pokémon...').fill('pika')
    await expect(page.getByRole('link', { name: 'Ver a Pikachu', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Limpiar búsqueda' })).toHaveCount(1)
    if (testInfo.project.name === 'mobile-360') {
      await expect(page).toHaveScreenshot('search-filled.png')
    }

    await page.getByRole('button', { name: 'Limpiar búsqueda' }).click()
    await page.getByTestId('open-filters').click()
    await expect(
      page.getByRole('group', { name: 'Tipos de Pokémon' }).getByTestId('type-icon'),
    ).toHaveCount(18)
    if (testInfo.project.name === 'mobile-360') await expect(page).toHaveScreenshot('filter.png')
    await page.getByRole('button', { name: 'Fuego', exact: true }).click()
    await page.getByRole('button', { name: 'Aplicar', exact: true }).click()
    await expect(page).toHaveURL(/types=fire/)
    await expect(page.getByRole('link', { name: 'Ver a Charmander', exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Ver a Squirtle', exact: true })).toHaveCount(0)
    if (testInfo.project.name === 'mobile-360') await expect(page).toHaveScreenshot('filtered.png')

    const accessibility = await new AxeBuilder({ page }).analyze()
    expect(
      accessibility.violations.filter(
        ({ impact }) => impact === 'critical' || impact === 'serious',
      ),
    ).toEqual([])
    expect(browserErrors).toEqual([])
  })

  test('detail copies all attributes and persists favorites', async ({ page }, testInfo) => {
    await startOnCatalog(page)
    await page.goto('/pokedex/bulbasaur')
    await expect(
      page.getByTestId('pokemon-detail').getByRole('heading', { name: 'Bulbasaur' }),
    ).toBeVisible()
    await expect(page.getByText('6,9 kg')).toBeVisible()
    await expect(page.getByText('Semilla', { exact: true })).toBeVisible()
    if (testInfo.project.name === 'desktop-1920') {
      const catalog = await page.getByRole('region', { name: 'Catálogo Pokémon' }).boundingBox()
      expect(catalog?.width).toBe(420)
    }
    await expect(page).toHaveScreenshot('detail.png', { fullPage: true })

    await page.getByTestId('share-pokemon').click()
    await expect(page.getByText('Información copiada al portapapeles')).toBeVisible()
    const clipboard = await page.evaluate(() => navigator.clipboard.readText())
    expect(clipboard).toContain('Nombre: Bulbasaur, Número: Nº001')
    expect(clipboard).toContain('Peso: 6,9 kg')

    await page.getByTestId('favorite-detail').click()
    await page.goto('/favorites')
    await expect(page.getByRole('link', { name: 'Ver a Bulbasaur', exact: true })).toBeVisible()
    if (testInfo.project.name === 'mobile-360') await expect(page).toHaveScreenshot('favorites.png')
    await page.reload()
    await expect(page.getByRole('link', { name: 'Ver a Bulbasaur', exact: true })).toBeVisible()
  })
})

test.describe('Resilient states', () => {
  test('offers retry when PokeAPI fails', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-360', 'One viewport covers the state contract')
    await startOnCatalog(page)
    await mockPokeApi(page, { failList: true })
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Algo salió mal' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Reintentar' })).toBeVisible()
    await expect(page).toHaveScreenshot('error.png')
  })

  test('shows favorite empty and construction states', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-360', 'One viewport covers the state contract')
    await mockPokeApi(page)
    await startOnCatalog(page)
    await page.goto('/favorites')
    await expect(page.getByRole('heading', { name: 'Aún no tienes favoritos' })).toBeVisible()
    await expect(page).toHaveScreenshot('favorites-empty.png')
    await page.goto('/regions')
    await expect(page.getByRole('heading', { name: 'Regiones: muy pronto' })).toBeVisible()
    await expect(page).toHaveScreenshot('construction.png')
  })

  test('shows the CSS Pokéball while the real catalog request is pending', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-360', 'One viewport covers the loading contract')
    await startOnCatalog(page)
    await mockPokeApi(page, { listDelayMs: 2_000 })
    await page.goto('/')
    await expect(page.getByRole('status', { name: 'Cargando Pokémon' })).toBeVisible()
    await expect(page).toHaveScreenshot('splash.png')
    await expect(page.getByTestId('pokemon-list')).toBeVisible()
  })

  test('supports swipe deletion and undo without losing favorite order', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-360', 'Swipe is a mobile interaction')
    await mockPokeApi(page)
    await startOnCatalog(page, ['bulbasaur'])
    await page.goto('/favorites')
    const gesture = page.getByTestId('favorite-card-gesture')
    await expect(gesture).toBeVisible()
    const box = await gesture.boundingBox()
    if (!box) throw new Error('Favorite gesture surface has no bounding box')
    await page.mouse.move(box.x + box.width - 16, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + 100, box.y + box.height / 2, { steps: 8 })
    await page.mouse.up()
    expect(await page.evaluate(() => window.getSelection()?.toString() ?? '')).toBe('')
    await expect(page).toHaveScreenshot('favorite-swipe.png')
    await page.getByRole('button', { name: 'Eliminar a Bulbasaur de favoritos' }).click()
    await expect(page.getByRole('heading', { name: 'Aún no tienes favoritos' })).toBeVisible()
    await page.getByRole('button', { name: 'Deshacer', exact: true }).click()
    await expect(page.getByRole('link', { name: 'Ver a Bulbasaur', exact: true })).toBeVisible()
  })
})

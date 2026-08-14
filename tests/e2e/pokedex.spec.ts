import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { mockPokeApi, startOnCatalog } from './fixtures/pokeapi'

test.describe('Pokédex experience', () => {
  test.beforeEach(async ({ page }) => {
    await mockPokeApi(page)
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

  test('catalog searches, filters and remains usable at the project viewport', async ({
    page,
  }, testInfo) => {
    await startOnCatalog(page)
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Ver a Bulbasaur', exact: true })).toBeVisible()
    await expect(page).toHaveScreenshot('catalog.png')

    await page.getByPlaceholder('Buscar Pokémon...').fill('pika')
    await expect(page.getByRole('link', { name: 'Ver a Pikachu', exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Limpiar búsqueda' }).click()
    await page.getByTestId('open-filters').click()
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
  })

  test('detail copies all attributes and persists favorites', async ({ page }, testInfo) => {
    await startOnCatalog(page)
    await page.goto('/pokedex/bulbasaur')
    await expect(
      page.getByTestId('pokemon-detail').getByRole('heading', { name: 'Bulbasaur' }),
    ).toBeVisible()
    await expect(page.getByText('6,9 kg')).toBeVisible()
    await expect(page.getByText('Semilla', { exact: true })).toBeVisible()
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
    await expect(page).toHaveScreenshot('favorite-swipe.png')
    await page.getByRole('button', { name: 'Eliminar a Bulbasaur de favoritos' }).click()
    await expect(page.getByRole('heading', { name: 'Aún no tienes favoritos' })).toBeVisible()
    await page.getByRole('button', { name: 'Deshacer', exact: true }).click()
    await expect(page.getByRole('link', { name: 'Ver a Bulbasaur', exact: true })).toBeVisible()
  })
})

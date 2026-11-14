import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);

function loadPlaywright() {
  const candidates = [
    'playwright',
    'playwright-core',
    '/tmp/pw/node_modules/playwright-core'
  ];
  for (const id of candidates) {
    try {
      return require(id);
    } catch {
      // try next candidate
    }
  }
  throw new Error(
    'Playwright not found. Install playwright-core in /tmp/pw or project node_modules before running this script.'
  );
}

const { chromium } = loadPlaywright();

const BASE_URL = process.env.GAME_URL || 'http://localhost:3000';
const OUT_DIR = path.resolve(import.meta.dirname, '..', 'src', 'assets', 'screenshots');
const CHROME_PATH =
  process.env.CHROME_PATH ||
  '/ms-playwright/chromium_headless_shell-1247/chrome-headless-shell-linux64/chrome-headless-shell';

async function launchBrowser() {
  const launchOpts = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--enable-webgl',
      '--ignore-gpu-blocklist'
    ]
  };
  if (fs.existsSync(CHROME_PATH)) {
    launchOpts.executablePath = CHROME_PATH;
  }
  return chromium.launch(launchOpts);
}

async function dismissOverlays(page) {
  const gotIt = page.getByRole('button', { name: 'Got It', exact: true });
  if (await gotIt.isVisible().catch(() => false)) {
    await gotIt.click();
    await page.waitForTimeout(250);
  }
  const dismissExact = page.getByRole('button', { name: 'Dismiss', exact: true });
  if (await dismissExact.isVisible().catch(() => false)) {
    await dismissExact.click();
    await page.waitForTimeout(250);
  }
  const dismissX = page.getByRole('button', { name: 'Dismiss Field Brief', exact: true });
  if (await dismissX.isVisible().catch(() => false)) {
    await dismissX.click();
    await page.waitForTimeout(250);
  }
}

async function openPlanetGame(context, planet) {
  const page = await context.newPage();
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(`${BASE_URL}/?screen=game&planet=${planet}`, {
    waitUntil: 'domcontentloaded',
    timeout: 45000
  });
  await page.waitForSelector('canvas', { timeout: 25000 });
  // Wait for 3D GLBs, terrain, and initial Field Brief popup to settle
  await page.waitForTimeout(3800);
  await dismissOverlays(page);
  await page.waitForTimeout(350);
  await dismissOverlays(page);
  return page;
}

async function snap(page, filename) {
  await dismissOverlays(page);
  await page.screenshot({
    path: path.join(OUT_DIR, filename),
    type: 'jpeg',
    quality: 90,
    animations: 'disabled',
    timeout: 60000
  });
  console.log(`Captured ${filename}`);
}

/**
 * Orbit the camera reliably even in headless browsers where synthetic mouse.move
 * may omit movementX/movementY deltas.
 */
async function orbitCamera(page, totalDx, totalDy, steps = 16) {
  await page.evaluate(
    ({ dx, dy, numSteps }) => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return;
      const startX = 640;
      const startY = 360;
      canvas.dispatchEvent(
        new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          button: 0,
          clientX: startX,
          clientY: startY
        })
      );
      const stepX = dx / numSteps;
      const stepY = dy / numSteps;
      for (let i = 1; i <= numSteps; i++) {
        window.dispatchEvent(
          new MouseEvent('mousemove', {
            bubbles: true,
            clientX: startX + stepX * i,
            clientY: startY + stepY * i,
            movementX: stepX,
            movementY: stepY
          })
        );
      }
      window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, button: 0 }));
    },
    { dx: totalDx, dy: totalDy, numSteps: steps }
  );
  await page.waitForTimeout(550);
}

async function run() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await launchBrowser();

  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      deviceScaleFactor: 1
    });

    // === MOON PAGE (Steps 1, 2, 3, 4, 5, 6) ===
    const moonPage = await openPlanetGame(context, 'moon');

    // Step 1: Welcome — Astronaut standing near Apollo Lunar Module lander
    await orbitCamera(moonPage, 690, -30);
    await snap(moonPage, 'step1_welcome.jpg');

    // Step 3: Look Around — Orbit toward Earth in lunar sky + boulders & craters
    // From yaw≈-2.07 (dx=+690), orbit -1490px => net yaw≈+2.40 facing (+160, 140, -180)
    await orbitCamera(moonPage, -1490, -25);
    await snap(moonPage, 'step3_look.jpg');

    // Reset yaw back toward 0 (dx=+800 => net dx=0, looking toward +Z)
    await orbitCamera(moonPage, 800, 40);

    // Step 2: Move Your Astronaut — 3/4 side-angle walk mid-stride
    await orbitCamera(moonPage, 220, 0);
    await moonPage.keyboard.down('KeyW');
    await moonPage.keyboard.down('KeyD');
    await moonPage.waitForTimeout(650);
    await snap(moonPage, 'step2_wasd.jpg');
    await moonPage.keyboard.up('KeyD');
    await moonPage.keyboard.up('KeyW');
    await moonPage.waitForTimeout(300);

    // Step 4: Jump and Sprint — airborne low-gravity jump in 3/4 view with thruster plume
    await moonPage.keyboard.down('ShiftLeft');
    await moonPage.keyboard.down('KeyD');
    await moonPage.waitForTimeout(250);
    await moonPage.keyboard.down('Space');
    await moonPage.waitForTimeout(380);
    await snap(moonPage, 'step4_jump.jpg');
    await moonPage.keyboard.up('Space');
    await moonPage.keyboard.up('KeyD');
    await moonPage.keyboard.up('ShiftLeft');
    await moonPage.waitForTimeout(1000);

    // Step 5: Interact and Collect — respawn at (0,0) via Pause -> Respawn or walk straight to nearby Water-Ice node
    // Let's open Pause -> Respawn so position is deterministic (0,0), then walk directly to Water-Ice node_1 at (20.28, 14.61)
    await moonPage.getByRole('button', { name: 'Open pause menu' }).click();
    await moonPage.waitForTimeout(250);
    await moonPage.getByRole('button', { name: /Respawn/i }).click();
    await moonPage.waitForTimeout(200);
    await moonPage.getByRole('button', { name: /Resume/i }).click();
    await moonPage.waitForTimeout(400);

    // Camera yaw is still +yaw? Reset yaw cleanly by reloading or measuring: simpler to aim from fresh yaw=0
    // Actually let's check: net dx so far was +220 => yaw = -0.66. To get yaw = +0.946 (toward (20.28, 14.61)),
    // deltaYaw = +1.606 => dx = -1.606 / 0.003 = -535px!
    await orbitCamera(moonPage, -535, 10);
    await moonPage.keyboard.down('ShiftLeft');
    await moonPage.keyboard.down('KeyW');
    let promptFound = false;
    for (let i = 0; i < 36; i++) {
      await moonPage.waitForTimeout(150);
      if (await moonPage.locator('text=Press [E]').isVisible().catch(() => false)) {
        promptFound = true;
        break;
      }
    }
    await moonPage.keyboard.up('KeyW');
    await moonPage.keyboard.up('ShiftLeft');
    await moonPage.waitForTimeout(300);
    console.log('Step 5 interact prompt visible:', promptFound);
    await snap(moonPage, 'step5_interact.jpg');

    // Step 6: Build Your Outpost — open Base Construction & Fabrication menu
    await moonPage.getByRole('button', { name: 'Build', exact: true }).click();
    await moonPage.waitForSelector('text=Base Construction & Fabrication', { timeout: 6000 });
    await moonPage.waitForTimeout(300);
    await snap(moonPage, 'step6_build.jpg');
    await moonPage.close();

    // === MARS PAGE (Step 7) ===
    const marsPage = await openPlanetGame(context, 'mars');
    await orbitCamera(marsPage, 560, -25);
    await snap(marsPage, 'step7_ready.jpg');
    await marsPage.close();

    await context.close();
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

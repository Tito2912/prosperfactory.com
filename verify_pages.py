import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

async def analyze(page_path):
    uri = Path(page_path).resolve().as_uri()
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        logs = []
        page.on('console', lambda msg: logs.append(f'console[{msg.type}] {msg.text}'))
        page.on('pageerror', lambda exc: logs.append(f'pageerror {exc}'))
        await page.goto(uri)
        await page.wait_for_timeout(2000)
        state_keys = await page.evaluate('window.__PRELOADED_STATE__ ? Object.keys(window.__PRELOADED_STATE__) : null')
        await browser.close()
    return logs, state_keys

async def main():
    for path in ['index.html','fr/index.html','es/index.html','de/index.html']:
        logs, state = await analyze(path)
        print(path)
        print(' logs:', logs)
        print(' state keys:', state)

asyncio.run(main())

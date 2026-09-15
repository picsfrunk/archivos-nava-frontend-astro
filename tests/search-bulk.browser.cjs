const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const fixture=JSON.parse(fs.readFileSync(process.env.UI_FIXTURE));
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://example.com/**',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="720" height="540"><rect width="720" height="540" fill="#444"/></svg>'}));
 const base=(process.env.FRONTEND_URL || 'http://127.0.0.1:14321');
 try {
 await page.goto(base+'/admin/login');
 await page.locator('#identity').fill('normal@example.com');await page.locator('#password').fill(fixture.password);await page.getByRole('button',{name:'Entrar',exact:true}).click();
 await page.waitForURL('**/admin/photos');await page.locator('input[data-photo-id]').first().waitFor();
 await page.waitForFunction(()=>!document.querySelector('#select-page').disabled);
 assert.equal(await page.locator('input[data-photo-id]').count(),24);
 await page.locator('#select-page').check();assert.equal(await page.locator('#selection-count').textContent(),'24 seleccionadas');
 await page.locator('#next-page').click();await page.waitForFunction(()=>!document.querySelector('#select-page').disabled);
 assert.equal(await page.locator('#bulk-bar').isHidden(),true);assert.ok(page.url().includes('page=2'));
 await page.goBack();await page.waitForFunction(()=>!document.querySelector('#select-page').disabled);assert.equal(await page.locator('input[data-photo-id]').count(),24);
 let requests=0;page.on('request',r=>{if(r.url().includes('/admin/photos?'))requests++;});
 await page.locator('#search-filter').pressSequentially('Archivo',{delay:30});await page.waitForTimeout(600);
 assert.equal(requests,1);assert.ok(page.url().includes('search=Archivo'));
 await page.locator('#year-filter').fill('abc');await page.waitForTimeout(450);assert.match(await page.locator('#year-error').textContent(),/1800/);
 await page.locator('#year-filter').fill('1985');await page.waitForTimeout(500);
 await page.reload();await page.waitForFunction(()=>!document.querySelector('#select-page').disabled);assert.equal(await page.locator('#search-filter').inputValue(),'Archivo');
 await page.locator('input[data-photo-id]').first().check();page.once('dialog',d=>d.accept());
 await page.locator('[data-bulk="draft"]').click();await page.waitForFunction(()=>document.querySelector('#admin-message').textContent.includes('1 fotos pasadas'));
 assert.ok(page.url().includes('search=Archivo'));assert.equal(await page.locator('#bulk-bar').isHidden(),true);
 for(const width of [1440,820,390]) {
  await page.setViewportSize({width,height:1000});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true,`admin overflow ${width}`);
  await page.screenshot({path:`${process.env.UI_ARTIFACT_DIR || '/tmp'}/admin-${width}.png`,fullPage:true});
 }
 await page.goto(base+'/search?search=Archivo&year=1985');
 assert.equal(await page.locator('.photo-card').count(),24);assert.match(await page.getByRole('status').textContent(),/29 fotografías/);
 await page.getByRole('link',{name:'Siguiente',exact:true}).click();assert.ok(page.url().includes('year=1985'));assert.equal(await page.locator('.photo-card').count(),5);
 for(const width of [1440,820,390]) {
  await page.setViewportSize({width,height:1000});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true,`public overflow ${width}`);
  await page.screenshot({path:`${process.env.UI_ARTIFACT_DIR || '/tmp'}/search-${width}.png`,fullPage:true});
 }
 await page.locator('.photo-card').first().click();await page.getByRole('button',{name:'Ver grande',exact:true}).click();assert.equal(await page.locator('dialog').evaluate(x=>x.open),true);
 await page.keyboard.press('Escape');assert.equal(await page.locator('dialog').evaluate(x=>x.open),false);assert.ok(await page.getByRole('link',{name:'Descargar',exact:true}).getAttribute('href'));
 await page.goto(base+'/gallery');assert.ok(await page.locator('a[href^="/gallery/"]').count());
 await page.goto(base+'/admin/photos/new');assert.ok(await page.locator('input[type="file"]').count());
 await page.goto(base+'/admin/categories');await page.waitForTimeout(300);
 await page.goto(base+'/admin/advanced/settings');await page.waitForTimeout(300);
 assert.deepEqual(errors,[]);console.log('PASS: login, debounce, URL/reload/back, page selection reset, bulk, 3 viewports, public pagination, gallery/detail/lightbox/download, admin page smoke checks');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

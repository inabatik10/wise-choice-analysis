import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {navigateTo} from './ui-helpers';

test('missing price factors show zero assumptions and a clearly preliminary CVF',async({page})=>{
  const result=JSON.parse(await readFile('tests/fixtures/author-analysis.json','utf8'));
  await page.goto('/');
  await page.evaluate(value=>localStorage.setItem('wisechoice.history.v1',JSON.stringify([value])),result);
  await page.reload();
  await page.getByTestId('nav-analysis').filter({visible:true}).first().click();
  const p=page.getByTestId('metric-pPriceAnomaly');
  const a=page.getByTestId('metric-aAltCost');
  await expect(p).toContainText('0*');
  await expect(a).toContainText('0*');
  await expect(page.getByTestId('cvf-value')).toContainText('0,18');
  await expect(page.getByTestId('cvf-value')).toContainText('Предварительный');
  await expect(page.getByTestId('cvf-assumptions')).toContainText('нет сравнительных данных');
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('wisechoice.history.v1')!)[0]);
  expect(stored.metrics.pPriceAnomaly).toBeNull();
  expect(stored.metrics.aAltCost).toBeNull();
  expect(stored.cvf).toBeNull();
  await page.getByRole('button',{name:'English',exact:true}).click();
  await expect(page.getByTestId('cvf-value')).toContainText('Preliminary');
  await expect(page.getByTestId('cvf-assumptions')).toContainText('comparison data');
  await navigateTo(page,'history');
  await expect(page.getByRole('table')).toContainText('0.18*');
  await expect(page.getByTestId('history-cvf-assumptions')).toContainText('Preliminary');
});

import { ExchangeRateSnapshot, CurrencyCode } from '../src/types.js';
interface RatesCache { rates: Record<CurrencyCode,number>; fetchedAt:string; source:string; rateDate:string }
let cachedRates: RatesCache | undefined;
export async function fetchLiveExchangeRates():Promise<RatesCache>{
 if(cachedRates && Date.now()-Date.parse(cachedRates.fetchedAt)<3600000)return cachedRates;
 const response=await fetch('https://open.er-api.com/v6/latest/CNY',{signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new Error('Exchange rate unavailable. Please retry; no currency conversion was performed.');
 const data=await response.json();
 if(data.result!=='success'||data.base_code!=='CNY'||!Number.isFinite(data.time_last_update_unix)||Date.now()-data.time_last_update_unix*1000>72*3600000||data.time_last_update_unix*1000>Date.now()+300000)throw new Error('Exchange-rate feed is invalid or stale.');
 for(const code of ['MYR','SGD','USD'])if(typeof data.rates?.[code]!=='number'||!Number.isFinite(data.rates[code])||data.rates[code]<=0)throw new Error('Exchange-rate feed is missing a valid rate.');
 cachedRates={rates:{CNY:1,MYR:data.rates.MYR,SGD:data.rates.SGD,USD:data.rates.USD},fetchedAt:new Date().toISOString(),rateDate:new Date(data.time_last_update_unix*1000).toISOString(),source:'https://www.exchangerate-api.com'};
 return cachedRates;
}
export async function createRateSnapshot(targetCurrency:CurrencyCode):Promise<ExchangeRateSnapshot>{
 const feed=await fetchLiveExchangeRates(),rate=feed.rates[targetCurrency];
 if(!Number.isFinite(rate)||rate<=0)throw new Error('Unsupported output currency.');
 return {sourceCurrency:'CNY',targetCurrency,rate,fetchedAt:feed.fetchedAt,rateDate:feed.rateDate,source:feed.source,isLocked:true,lockedAt:feed.fetchedAt,lockedBy:'Automatic quotation snapshot'};
}
export function lockRateSnapshot(snapshot:ExchangeRateSnapshot,managerName:string):ExchangeRateSnapshot{return {...snapshot,isLocked:true,lockedAt:new Date().toISOString(),lockedBy:managerName};}

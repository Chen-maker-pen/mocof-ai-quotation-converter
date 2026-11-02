import test from 'node:test';
import assert from 'node:assert/strict';
import {area4Structure} from '../server/area4Structure.js';
function fixture(){
 const cells:any={};const put=(a:string,value:any)=>cells[a]={address:a,row:Number(a.slice(1)),column:a.charCodeAt(0)-64,value};
 ['Lounge','Other','Other','Guest'].forEach((name,i)=>{put('B'+(7+i),name);put('A'+(13+i*8),name);put('A'+(19+i*8),'合计:');put('H'+(19+i*8),100+i);});
 put('A11','合计:');put('A50','备注:');return {cells} as any;
}
test('Area 4 preserves duplicate source names as separate ordered rooms',()=>{
 const result=area4Structure(fixture());assert.deepEqual(result.rooms.map(r=>[r.name,r.end]),[['Lounge',19],['Other',27],['Other',35],['Guest',43]]);
});
test('Area 4 rejects a missing detail section instead of borrowing a similarly named total',()=>{
 const s=fixture();delete s.cells.A29;assert.throws(()=>area4Structure(s),/Missing section/);
});

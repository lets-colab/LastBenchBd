import {cpSync,rmSync} from 'node:fs';
const source=new URL('../../landing/',import.meta.url);
const dest=new URL('./site/',import.meta.url);
rmSync(dest,{recursive:true,force:true});
cpSync(source,dest,{recursive:true});
console.log('Generated preview from canonical landing sources.');

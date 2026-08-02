globalThis.localStorage={getItem:()=>null,setItem(){},removeItem(){}};
globalThis.matchMedia=()=>({matches:false});
globalThis.sessionStorage={getItem:()=>null,setItem(){}};
const elStub=()=>({style:{},dataset:{},classList:{add(){},remove(){},toggle(){}},setAttribute(){},appendChild(){},addEventListener(){},remove(){},querySelector:()=>null,querySelectorAll:()=>[],innerHTML:'',textContent:''});
globalThis.document={body:{dataset:{},appendChild(){}},documentElement:{dataset:{}},addEventListener(){},dispatchEvent(){},
  querySelector:()=>null,querySelectorAll:()=>[],head:{appendChild(){}},createElement:elStub};
globalThis.navigator={};globalThis.location={protocol:'http:'};globalThis.window={addEventListener(){}};globalThis.addEventListener=()=>{};
const { makeZip } = await import('/home/user/crispcv/assets/js/mini-zip.js');
const { imagesToPDF } = await import('/home/user/crispcv/assets/js/convert/mini-pdf.js');
const { exampleProfile } = await import('/home/user/crispcv/assets/js/cv/store.js');
const { profileToTXT, profileToDOCXBlob } = await import('/home/user/crispcv/assets/js/cv/exporters.js');
const { renderCV } = await import('/home/user/crispcv/assets/js/cv/render.js');
const { checkATS } = await import('/home/user/crispcv/assets/js/cv/ats.js');
await import('/home/user/crispcv/assets/js/ui.js'); // import splash/prompt sans DOM réel
const prof = exampleProfile();
const docx = Buffer.from(await profileToDOCXBlob(prof).arrayBuffer());
const fakeJpeg = new Uint8Array([0xFF,0xD8,0xFF,0xE0,0,16,0x4A,0x46,0x49,0x46,0,1,1,0,0,1,0,1,0,0,0xFF,0xD9]);
const pdf = Buffer.from(await imagesToPDF([{jpeg:fakeJpeg,w:800,h:1100}]).arrayBuffer());
console.log('docx PK:', docx.slice(0,2).toString('latin1')==='PK', '| pdf:', pdf.slice(0,5).toString('latin1')==='%PDF-');
console.log('render lat/cap/studio:', ['latitude','capitale','studio'].every(t=>{const p2=exampleProfile();p2.prefs.template=t;return renderCV(p2).includes('cv-sheet')}));
console.log('ATS:', checkATS(prof).label, '| escape:', !renderCV({...prof,contact:{...prof.contact,fullName:'<script>x<'+'/script>'}}).includes('<script>'));
console.log('ui.js chargé (splash+install OK)');

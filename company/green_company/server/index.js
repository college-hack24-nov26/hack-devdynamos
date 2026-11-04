import 'dotenv/config';
import express from 'express';
import Razorpay from 'razorpay';
import Database from 'better-sqlite3';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const here=path.dirname(fileURLToPath(import.meta.url));
const dataDir=path.join(here,'..','data');
fs.mkdirSync(dataDir,{recursive:true});
const databasePath=process.env.DATABASE_PATH||path.join(dataDir,'marketplace.sqlite');
fs.mkdirSync(path.dirname(databasePath),{recursive:true});
const db=new Database(databasePath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.exec(`
CREATE TABLE IF NOT EXISTS farmers(id TEXT PRIMARY KEY,name TEXT NOT NULL,state TEXT NOT NULL,district TEXT NOT NULL,village TEXT NOT NULL,land REAL NOT NULL DEFAULT 0,status TEXT NOT NULL DEFAULT 'Verified');
CREATE TABLE IF NOT EXISTS companies(id TEXT PRIMARY KEY,name TEXT NOT NULL,registered_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS projects(id TEXT PRIMARY KEY,farmer_id TEXT NOT NULL REFERENCES farmers(id),crop TEXT NOT NULL,area REAL NOT NULL,duration INTEGER NOT NULL,state TEXT NOT NULL,district TEXT NOT NULL,village TEXT NOT NULL,start_date TEXT,harvest_date TEXT,irrigation TEXT,practices TEXT NOT NULL DEFAULT '[]',gps TEXT,inputs TEXT,status TEXT NOT NULL DEFAULT 'Submitted',estimated REAL NOT NULL DEFAULT 0,verified REAL NOT NULL DEFAULT 0,available REAL NOT NULL DEFAULT 0,reserved REAL NOT NULL DEFAULT 0,sold REAL NOT NULL DEFAULT 0,price INTEGER NOT NULL DEFAULT 2000,verification_note TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS purchases(id TEXT PRIMARY KEY,company_id TEXT NOT NULL REFERENCES companies(id),project_id TEXT NOT NULL REFERENCES projects(id),farmer_id TEXT NOT NULL REFERENCES farmers(id),quantity INTEGER NOT NULL,price INTEGER NOT NULL,total INTEGER NOT NULL,status TEXT NOT NULL,settlement TEXT NOT NULL DEFAULT 'Pending',provider TEXT NOT NULL,payment_order_id TEXT UNIQUE,payment_id TEXT UNIQUE,payment_signature TEXT,retired INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,confirmed_at TEXT);
CREATE TABLE IF NOT EXISTS farmer_payments(id TEXT PRIMARY KEY,purchase_id TEXT NOT NULL UNIQUE REFERENCES purchases(id),farmer_id TEXT NOT NULL REFERENCES farmers(id),project_id TEXT NOT NULL REFERENCES projects(id),quantity INTEGER NOT NULL,rate INTEGER NOT NULL,gross INTEGER NOT NULL,deductions INTEGER NOT NULL,incentive INTEGER NOT NULL,amount INTEGER NOT NULL,status TEXT NOT NULL,reference TEXT UNIQUE,note TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,paid_at TEXT);
CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY,value REAL NOT NULL);
CREATE TABLE IF NOT EXISTS audit_logs(id INTEGER PRIMARY KEY AUTOINCREMENT,actor TEXT NOT NULL,action TEXT NOT NULL,entity_id TEXT,details TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS webhook_events(id TEXT PRIMARY KEY,event TEXT NOT NULL,received_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS certificates(id TEXT PRIMARY KEY,purchase_id TEXT NOT NULL UNIQUE REFERENCES purchases(id),company_id TEXT NOT NULL REFERENCES companies(id),project_id TEXT NOT NULL REFERENCES projects(id),farmer_id TEXT NOT NULL REFERENCES farmers(id),certificate_number TEXT NOT NULL UNIQUE,quantity INTEGER NOT NULL,amount INTEGER NOT NULL,payment_reference TEXT,issued_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS idx_projects_available ON projects(status,available);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status,settlement);
`);
const ensureColumn=(table,column,definition)=>{const columns=db.pragma(`table_info(${table})`).map(x=>x.name);if(!columns.includes(column))db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)};
ensureColumn('farmers','phone','TEXT');ensureColumn('farmers','email','TEXT');
ensureColumn('companies','email','TEXT');ensureColumn('companies','sector','TEXT');
ensureColumn('companies','registered_at','TEXT');
ensureColumn('purchases','payment_method','TEXT');

const seed=db.transaction(()=>{
 if(db.prepare('SELECT COUNT(*) n FROM farmers').get().n)return;
 const farmers=[
 ['F-1024','Arjun Ghorpade','Maharashtra','Sangli','Miraj',2.4],['F-1025','Amit Singh','Punjab','Ludhiana','Jagraon',5.2],['F-1026','Priya Devi','Maharashtra','Nagpur','Hingna',3.8],['F-1027','Suresh Patel','Gujarat','Ahmedabad','Dholka',4.1],['F-1028','Kavitha Reddy','Telangana','Hyderabad','Shamshabad',6],['F-1029','Mohammed Ali','Karnataka','Bengaluru Urban','Anekal',2.8],['F-1030','Lakshmi Nair','Kerala','Ernakulam','Kochi',1.5],['F-1031','Deepak Sharma','Uttar Pradesh','Lucknow','Malihabad',7.2],['F-1032','Anita Kumari','Madhya Pradesh','Bhopal','Berasia',4.5],['F-1033','Vikram Yadav','Haryana','Karnal','Nilokheri',8.5],['F-1034','Meena Devi','Rajasthan','Jaipur','Chomu',3.2],['F-1035','Raju Patil','Maharashtra','Pune','Baramati',5.8],['F-1036','Ramesh Gupta','Uttar Pradesh','Meerut','Sardhana',10],['F-1037','Sunita Sharma','Punjab','Patiala','Samana',12.5],['F-1038','Arjun Singh','Haryana','Hisar','Barwala',15],['F-1039','Sanjay Verma','Madhya Pradesh','Indore','Depalpur',6.5],['F-1040','Rekha Joshi','Uttarakhand','Dehradun','Vikasnagar',4.2],['F-1041','Kiran Patel','Gujarat','Surat','Bardoli',7.8],['F-1042','Manoj Kumar','Rajasthan','Udaipur','Gogunda',3.5],['F-1043','Geeta Sharma','Himachal Pradesh','Shimla','Theog',2.2],['F-1044','Ramesh Yadav','Uttar Pradesh','Kanpur','Bilhaur',9.2]
 ];
 const fi=db.prepare('INSERT INTO farmers(id,name,state,district,village,land) VALUES(?,?,?,?,?,?)');farmers.forEach(x=>fi.run(...x));
 db.prepare('INSERT INTO companies(id,name,registered_at) VALUES(?,?,?)').run('C-204','TerraFoods India','2025-01-01T00:00:00.000Z');db.prepare('INSERT INTO companies(id,name,registered_at) VALUES(?,?,?)').run('C-208','Northstar Energy','2025-01-01T00:00:00.000Z');
 const p=db.prepare('INSERT INTO projects(id,farmer_id,crop,area,duration,state,district,village,start_date,harvest_date,irrigation,practices,status,estimated,verified,available,reserved,sold,price,verification_note) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
 p.run('PRJ-2048','F-1024','Sugarcane',2,12,'Maharashtra','Sangli','Miraj','2026-01-15','2026-12-15','Drip',JSON.stringify(['Cover crops','Reduced tillage']),'Sold',24,10,0,0,10,2000,'Demo methodology review completed');
 p.run('PRJ-2051','F-1025','Wheat',5.2,6,'Punjab','Ludhiana','Jagraon','2026-11-01','2027-04-30','Sprinkler',JSON.stringify(['Cover crops','Reduced fertilizer']),'Available for Sale',41,18,18,0,0,1850,'Demo methodology review completed');
 p.run('PRJ-2053','F-1026','Soybean',3.8,5,'Maharashtra','Nagpur','Hingna','2026-06-01','2026-10-31','Rain-fed',JSON.stringify(['No-till','Cover crops']),'Available for Sale',29,12,12,0,0,1925,'Demo methodology review completed');
 p.run('PRJ-2057','F-1027','Cotton',4.1,8,'Gujarat','Ahmedabad','Dholka','2026-05-01','2026-12-31','Drip',JSON.stringify(['Reduced tillage']),'Under Monitoring',33,0,0,0,0,2000,null);
 p.run('PRJ-2059','F-1028','Millets',6,4,'Telangana','Hyderabad','Shamshabad','2026-07-01','2026-10-31','Rain-fed',JSON.stringify(['Intercropping','Cover crops']),'Submitted',36,0,0,0,0,1800,null);
 const ins=db.prepare('INSERT INTO settings(key,value) VALUES(?,?)');[['farmer_rate',2000],['deduction_percent',0],['service_percent',0],['incentive_per_cc',0]].forEach(x=>ins.run(...x));
 db.prepare("INSERT INTO purchases(id,company_id,project_id,farmer_id,quantity,price,total,status,settlement,provider,payment_order_id,payment_id,created_at,confirmed_at) VALUES('PAY-783019','C-204','PRJ-2048','F-1024',10,2000,20000,'Settled','Settled','demo','demo-order-783019','demo-payment-783019','2026-10-26 10:00:00','2026-10-26 10:00:00')").run();
 db.prepare("INSERT INTO farmer_payments(id,purchase_id,farmer_id,project_id,quantity,rate,gross,deductions,incentive,amount,status,reference,note,created_at,paid_at) VALUES('FP-783019','PAY-783019','F-1024','PRJ-2048',10,2000,20000,0,0,20000,'Paid','FUND-783019','Demo farmer payout','2026-10-27 10:00:00','2026-10-27 10:00:00')").run();
});seed();
db.prepare("UPDATE purchases SET status='Successful' WHERE status='Settled' AND settlement='Settled'").run();
db.prepare("UPDATE companies SET registered_at='2025-01-01T00:00:00.000Z' WHERE registered_at IS NULL OR registered_at=''").run();
const makeCertificate=db.prepare('INSERT OR IGNORE INTO certificates(id,purchase_id,company_id,project_id,farmer_id,certificate_number,quantity,amount,payment_reference,issued_at) VALUES(?,?,?,?,?,?,?,?,?,?)');
for(const p of db.prepare("SELECT * FROM purchases WHERE status='Successful' AND settlement='Settled'").all())makeCertificate.run(`CERT-${crypto.randomUUID()}`,p.id,p.company_id,p.project_id,p.farmer_id,`GCM-ESG-${new Date(p.confirmed_at||p.created_at).getFullYear()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,p.quantity,p.total,p.payment_id||p.id,p.confirmed_at||p.created_at);
const demoProjectRows=[
 ['PRJ-DEMO-3001','F-1037','Rice',4.2,5,'Punjab','Amritsar','Ajnala','Submitted',24,0,0,2180,'31.6340,74.8723'],
 ['PRJ-DEMO-3002','F-1038','Maize',3.6,4,'Haryana','Hisar','Barwala','Under Monitoring',18,0,0,1940,'29.1492,75.7217'],
 ['PRJ-DEMO-3003','F-1042','Pulses',5.1,4,'Rajasthan','Udaipur','Gogunda','Verification Pending',21,0,0,2050,'24.5854,73.7125'],
 ['PRJ-DEMO-3004','F-1033','Wheat',6.4,6,'Haryana','Karnal','Nilokheri','Available for Sale',26,18,18,1880,'29.6857,76.9905'],
 ['PRJ-DEMO-3005','F-1035','Cotton',4.8,8,'Maharashtra','Pune','Baramati','Verification Pending',31,0,0,2100,'18.5204,73.8567'],
 ['PRJ-DEMO-3006','F-1041','Soybean',3.1,5,'Gujarat','Surat','Bardoli','Submitted',17,0,0,1990,'21.1702,72.8311'],
 ['PRJ-DEMO-3007','F-1029','Sugarcane',5.5,12,'Karnataka','Bengaluru Urban','Anekal','Available for Sale',55,32,32,2025,'12.9716,77.5946'],
 ['PRJ-DEMO-3008','F-1040','Millets',2.9,4,'Uttarakhand','Dehradun','Vikasnagar','Under Monitoring',16,0,0,1825,'30.3165,78.0322'],
 ['PRJ-DEMO-3009','F-1036','Rice',7.3,5,'Uttar Pradesh','Meerut','Sardhana','Verification Pending',42,0,0,1975,'28.9845,77.7064'],
 ['PRJ-DEMO-3010','F-1030','Pulses',2.2,4,'Kerala','Ernakulam','Kochi','Available for Sale',12,8,8,2075,'9.9816,76.2999'],
 ['PRJ-DEMO-3011','F-1028','Maize',4.4,4,'Telangana','Hyderabad','Shamshabad','Submitted',22,0,0,1910,'17.3850,78.4867'],
 ['PRJ-DEMO-3012','F-1039','Cotton',6.2,8,'Madhya Pradesh','Indore','Depalpur','Verified',40,25,0,2010,'22.7196,75.8577'],
 ['PRJ-DEMO-3013','F-1025','Wheat',3.9,6,'Punjab','Ludhiana','Jagraon','Available for Sale',22,14,14,1865,'30.9010,75.8573'],
 ['PRJ-DEMO-3014','F-1044','Sugarcane',2.7,12,'Gujarat','Ahmedabad','Dholka','Under Monitoring',27,0,0,2030,'23.0225,72.5714'],
 ['PRJ-DEMO-3015','F-1026','Soybean',4.6,5,'Maharashtra','Nagpur','Hingna','Submitted',28,0,0,1960,'21.1458,79.0882']
];
const fillDemoProjects=db.transaction(()=>{
 let remaining=Math.max(0,20-db.prepare('SELECT COUNT(*) n FROM projects').get().n);
 const existsFarmer=db.prepare('SELECT 1 FROM farmers WHERE id=?');
 const insert=db.prepare(`INSERT OR IGNORE INTO projects(id,farmer_id,crop,area,duration,state,district,village,start_date,harvest_date,irrigation,practices,gps,status,estimated,verified,available,price,verification_note) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
 for(const [id,farmerId,crop,area,duration,state,district,village,status,estimated,verified,available,price,gps] of demoProjectRows){
  if(remaining<=0)break;
  if(!existsFarmer.get(farmerId)||db.prepare('SELECT 1 FROM projects WHERE id=?').get(id))continue;
  insert.run(id,farmerId,crop,area,duration,state,district,village,'2026-03-01','2026-10-31','Mixed',JSON.stringify(['Cover crops','Reduced tillage']),gps,status,estimated,verified,available,price,status==='Submitted'?null:'Demo record for workflow display');
  if(db.prepare('SELECT changes() n').get().n)remaining--;
 }
});fillDemoProjects();

const app=express();
app.use(express.json({verify:(req,res,buf)=>{req.rawBody=Buffer.from(buf)}}));
const keyId=process.env.RAZORPAY_KEY_ID||'';
const keySecret=process.env.RAZORPAY_KEY_SECRET||'';
const webhookSecret=process.env.RAZORPAY_WEBHOOK_SECRET||'';
const demoMode=String(process.env.DEMO_MODE||'true').toLowerCase()==='true';
const rzp=keyId.startsWith('rzp_test_')&&keySecret?new Razorpay({key_id:keyId,key_secret:keySecret}):null;
const audit=db.prepare('INSERT INTO audit_logs(actor,action,entity_id,details) VALUES(?,?,?,?)');
const n=v=>Number(v||0);
const settings=()=>Object.fromEntries(db.prepare('SELECT key,value FROM settings').all().map(r=>[r.key,n(r.value)]));
const viewProject=p=>({...p,farmerId:p.farmer_id,farmer:p.farmer_name,practices:JSON.parse(p.practices||'[]'),start:p.start_date,harvest:p.harvest_date,verificationNote:p.verification_note});
const projectSelect=`SELECT p.*,f.name farmer_name FROM projects p JOIN farmers f ON f.id=p.farmer_id`;
const getPurchase=db.prepare('SELECT * FROM purchases WHERE id=?');
function asError(res,code,message){return res.status(code).json({error:message})}
function completePurchase({purchaseId,paymentId,signature='confirmed'}){
 return db.transaction(()=>{
  const purchase=getPurchase.get(purchaseId);if(!purchase)throw Object.assign(new Error('Purchase not found'),{status:404});
  if(purchase.settlement==='Settled'&&purchase.status==='Successful'){if(paymentId&&purchase.payment_id!==paymentId)throw Object.assign(new Error('A different payment has already settled this order.'),{status:409});return purchase;}
  if(purchase.status!=='Initiated')throw Object.assign(new Error('Purchase is no longer active'),{status:409});
  const now=new Date().toISOString();
  const settlement='Pending';
  db.prepare("UPDATE purchases SET status='Successful',settlement=?,payment_id=?,payment_signature=?,confirmed_at=? WHERE id=? AND status='Initiated'").run(settlement,paymentId,signature,now,purchaseId);
  db.prepare("UPDATE projects SET reserved=MAX(0,reserved-?),sold=sold+?,status=CASE WHEN available=0 AND reserved<=? THEN 'Sold' ELSE status END WHERE id=?").run(purchase.quantity,purchase.quantity,purchase.quantity,purchase.project_id);
  audit.run('company','company_payment_successful',purchaseId,JSON.stringify({paymentId,total:purchase.total,quantity:purchase.quantity,settlement}));
  return getPurchase.get(purchaseId);
 })();
}
function releasePurchase(id,status='Failed'){
 return db.transaction(()=>{const p=getPurchase.get(id);if(!p||p.status!=='Initiated')return p;db.prepare('UPDATE projects SET reserved=MAX(0,reserved-?),available=available+? WHERE id=?').run(p.quantity,p.quantity,p.project_id);db.prepare('UPDATE purchases SET status=?,settlement=? WHERE id=?').run(status,status,id);audit.run('system',`purchase_${status.toLowerCase()}`,id,'{}');return getPurchase.get(id)})();
}
app.get('/api/health',(req,res)=>res.json({ok:true,paymentMode:rzp?'razorpay':demoMode?'demo':'unconfigured'}));
app.get('/api/state',(req,res)=>{
 const farmers=db.prepare('SELECT * FROM farmers ORDER BY id').all();
 const projects=db.prepare(`${projectSelect} ORDER BY p.created_at DESC,p.id`).all().map(viewProject);
 const certificates=db.prepare('SELECT * FROM certificates ORDER BY issued_at DESC').all();
 const purchases=db.prepare('SELECT p.*,c.name company_name,c.registered_at company_registered_at,f.name farmer_name FROM purchases p JOIN companies c ON c.id=p.company_id JOIN farmers f ON f.id=p.farmer_id ORDER BY p.created_at DESC').all().map(x=>({...x,id:x.id,company:x.company_name,companyId:x.company_id,companyRegisteredAt:x.company_registered_at,paymentMethod:x.payment_method,farmer:x.farmer_name,farmerId:x.farmer_id,paymentId:x.payment_id,retired:Boolean(x.retired),date:x.created_at.slice(0,10),certificate:certificates.find(c=>c.purchase_id===x.id)||null}));
 const payouts=db.prepare('SELECT fp.*,f.name farmer_name FROM farmer_payments fp JOIN farmers f ON f.id=fp.farmer_id ORDER BY fp.created_at DESC').all().map(x=>({...x,farmer:x.farmer_name,farmerId:x.farmer_id,projectId:x.project_id,reference:x.reference,date:x.created_at.slice(0,10)}));
 const companies=db.prepare('SELECT * FROM companies').all();const logs=db.prepare('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 30').all();
 const cfg=settings();res.json({farmers,projects,payments:purchases,payouts,companies,certificates,settings:{rate:cfg.farmer_rate,deduction:cfg.deduction_percent,service:cfg.service_percent,incentive:cfg.incentive_per_cc},activity:logs.map(x=>({text:x.action.replaceAll('_',' ')+(x.entity_id?' · '+x.entity_id:''),date:x.created_at.slice(0,10)})),paymentMode:rzp?'razorpay':demoMode?'demo':'unconfigured'});
});
app.post('/api/farmers',(req,res)=>{
 const b=req.body||{},name=String(b.name||'').trim(),state=String(b.state||'').trim(),district=String(b.district||'').trim(),village=String(b.village||'').trim(),land=n(b.land);
 if(!name||!state||!district||!village||land<0)return asError(res,400,'Enter the farmer name, location, and a valid land area.');
 const id=`F-${crypto.randomUUID().slice(0,8).toUpperCase()}`;
 db.prepare('INSERT INTO farmers(id,name,state,district,village,land,phone,email) VALUES(?,?,?,?,?,?,?,?)').run(id,name,state,district,village,land,String(b.phone||'').trim()||null,String(b.email||'').trim().toLowerCase()||null);
 audit.run('farmer','farmer_registered',id,JSON.stringify({state,district,village,land}));res.status(201).json({id,name,state,district,village,land,phone:b.phone||null,email:b.email||null,status:'Verified'});
});
app.put('/api/farmers/:id',(req,res)=>{
 const b=req.body||{},name=String(b.name||'').trim(),state=String(b.state||'').trim(),district=String(b.district||'').trim(),village=String(b.village||'').trim(),land=n(b.land);
 if(!name||!state||!district||!village||land<0)return asError(res,400,'Enter the farmer name, location, and a valid land area.');
 const result=db.prepare('UPDATE farmers SET name=?,state=?,district=?,village=?,land=?,phone=?,email=? WHERE id=?').run(name,state,district,village,land,String(b.phone||'').trim()||null,String(b.email||'').trim().toLowerCase()||null,req.params.id);
 if(!result.changes)return asError(res,404,'Farmer profile not found.');audit.run(req.params.id,'farmer_profile_updated',req.params.id,JSON.stringify({state,district,village,land}));res.json({ok:true});
});
app.post('/api/companies',(req,res)=>{
 const b=req.body||{},name=String(b.name||'').trim();if(!name)return asError(res,400,'Enter a company name.');
 const id=`C-${crypto.randomUUID().slice(0,8).toUpperCase()}`;db.prepare('INSERT INTO companies(id,name,email,sector,registered_at) VALUES(?,?,?,?,?)').run(id,name,String(b.email||'').trim().toLowerCase()||null,String(b.sector||'').trim()||null,new Date().toISOString());
 audit.run(id,'company_registered',id,JSON.stringify({sector:b.sector||null}));res.status(201).json({id,name,email:b.email||null,sector:b.sector||null});
});
app.put('/api/companies/:id',(req,res)=>{
 const b=req.body||{},name=String(b.name||'').trim();if(!name)return asError(res,400,'Enter a company name.');
 const result=db.prepare('UPDATE companies SET name=?,email=?,sector=? WHERE id=?').run(name,String(b.email||'').trim().toLowerCase()||null,String(b.sector||'').trim()||null,req.params.id);
 if(!result.changes)return asError(res,404,'Company profile not found.');audit.run(req.params.id,'company_profile_updated',req.params.id,JSON.stringify({sector:b.sector||null}));res.json({ok:true});
});
app.post('/api/projects',(req,res)=>{
 const b=req.body||{};const {farmerId,crop,state,district,village}=b;const area=n(b.area),duration=Math.round(n(b.duration));
 if(!farmerId||!crop||!state||!district||!village||area<=0||duration<1||duration>36)return asError(res,400,'Complete all required farmer and crop fields.');
 const f=db.prepare('SELECT * FROM farmers WHERE id=?').get(farmerId);if(!f)return asError(res,404,'Farmer profile not found.');
 const multiplier={Rice:1.15,Wheat:.68,Sugarcane:1,Cotton:.8,Soybean:.62,Maize:.7,Pulses:.55,Millets:.6};const estimated=Math.max(1,Math.round(area*duration*(multiplier[crop]||.55)));
 const id=`PRJ-${crypto.randomUUID().slice(0,8).toUpperCase()}`;db.prepare('INSERT INTO projects(id,farmer_id,crop,area,duration,state,district,village,start_date,harvest_date,irrigation,practices,gps,inputs,status,estimated,price) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(id,farmerId,crop,area,duration,state,district,village,b.start||null,b.harvest||null,b.irrigation||'Rain-fed',JSON.stringify(b.practices||[]),b.gps||null,b.inputs||null,'Submitted',estimated,2000);
 audit.run(farmerId,'project_submitted',id,JSON.stringify({estimated,area,crop}));res.status(201).json({id,estimated,project:viewProject(db.prepare(`${projectSelect} WHERE p.id=?`).get(id))});
});
app.put('/api/projects/:id',(req,res)=>{
 const p=db.prepare('SELECT * FROM projects WHERE id=?').get(req.params.id);if(!p)return asError(res,404,'Project not found.');
 if(!['Submitted','Under Monitoring'].includes(p.status))return asError(res,409,'Projects can only be edited before verification begins.');
 const b=req.body||{},crop=String(b.crop||'').trim(),state=String(b.state||'').trim(),district=String(b.district||'').trim(),village=String(b.village||'').trim(),area=n(b.area),duration=Math.round(n(b.duration));
 if(!crop||!state||!district||!village||area<=0||duration<1||duration>36)return asError(res,400,'Complete the required crop, location, land, and duration fields.');
 const multiplier={Rice:1.15,Wheat:.68,Sugarcane:1,Cotton:.8,Soybean:.62,Maize:.7,Pulses:.55,Millets:.6};const estimated=Math.max(1,Math.round(area*duration*(multiplier[crop]||.55)));
 db.prepare('UPDATE projects SET crop=?,area=?,duration=?,state=?,district=?,village=?,start_date=?,harvest_date=?,irrigation=?,practices=?,gps=?,inputs=?,estimated=? WHERE id=?').run(crop,area,duration,state,district,village,b.start||null,b.harvest||null,b.irrigation||'Rain-fed',JSON.stringify(b.practices||[]),String(b.gps||'').trim()||null,String(b.inputs||'').trim()||null,estimated,p.id);
 audit.run(p.farmer_id,'project_updated',p.id,JSON.stringify({crop,area,duration}));res.json({ok:true,id:p.id,estimated});
});
app.patch('/api/projects/:id/status',(req,res)=>{
 const p=db.prepare('SELECT * FROM projects WHERE id=?').get(req.params.id);if(!p)return asError(res,404,'Project not found.');const {status,quantity,price,note}=req.body||{};
 if(status==='Under Monitoring'&&p.status==='Submitted'){db.prepare("UPDATE projects SET status='Under Monitoring' WHERE id=?").run(p.id)}
 else if(status==='Verification Pending'&&p.status==='Under Monitoring'){db.prepare("UPDATE projects SET status='Verification Pending' WHERE id=?").run(p.id)}
 else if(status==='Verified'&&p.status==='Verification Pending'){
  const q=Math.floor(n(quantity)),pr=Math.floor(n(price));if(q<1||q>p.estimated||pr<1)return asError(res,400,'Eligible credits must be positive and cannot exceed the estimate.');
  db.prepare("UPDATE projects SET status='Verified',verified=?,price=?,verification_note=? WHERE id=?").run(q,pr,note||'Demo methodology review completed',p.id);
 }else if(status==='Rejected'&&['Submitted','Under Monitoring','Verification Pending'].includes(p.status)){db.prepare("UPDATE projects SET status='Rejected' WHERE id=?").run(p.id)}
 else return asError(res,409,'Invalid project status transition.');
 audit.run('government',`project_${status.toLowerCase().replaceAll(' ','_')}`,p.id,JSON.stringify({quantity,price,note}));res.json({ok:true});
});
app.post('/api/projects/:id/issue',(req,res)=>{const p=db.prepare('SELECT * FROM projects WHERE id=?').get(req.params.id);if(!p)return asError(res,404,'Project not found.');if(p.status!=='Verified'||p.verified<1)return asError(res,409,'Only verified credits may be issued.');db.prepare("UPDATE projects SET status='Available for Sale',available=verified WHERE id=?").run(p.id);audit.run('government','credits_issued_and_listed',p.id,JSON.stringify({quantity:p.verified}));res.json({ok:true})});
app.post('/api/payments/create-order',async(req,res)=>{
 if(!rzp&&!demoMode)return asError(res,503,'Configure Razorpay credentials before accepting payments.');
 const {projectId,companyId='C-204',quantity}=req.body||{};const q=Math.floor(n(quantity));if(q<1)return asError(res,400,'Choose at least one credit.');
 const p=db.prepare(`${projectSelect} WHERE p.id=?`).get(projectId);if(!p)return asError(res,404,'Project not found.');if(p.status!=='Available for Sale'||q>p.available)return asError(res,409,'Those credits are no longer available. Refresh and try again.');
 if(!db.prepare('SELECT 1 FROM companies WHERE id=?').get(companyId))return asError(res,404,'Company not found.');
 const id=`TXN-${crypto.randomUUID()}`,total=q*p.price,provider=rzp?'razorpay':'demo',orderId=provider==='demo'?`demo_${id}`:null;
 try{
  db.transaction(()=>{const update=db.prepare('UPDATE projects SET available=available-?,reserved=reserved+? WHERE id=? AND available>=? AND status=\'Available for Sale\'').run(q,q,p.id,q);if(!update.changes)throw new Error('Credits were just reserved by another buyer.');db.prepare('INSERT INTO purchases(id,company_id,project_id,farmer_id,quantity,price,total,status,settlement,provider,payment_order_id) VALUES(?,?,?,?,?,?,?,\'Initiated\',\'Pending\',?,?)').run(id,companyId,p.id,p.farmer_id,q,p.price,total,provider,orderId);audit.run(companyId,'payment_initiated',id,JSON.stringify({projectId,quantity:q,total,provider}));})();
  if(rzp){const order=await rzp.orders.create({amount:total*100,currency:'INR',receipt:id,notes:{purchase_id:id,project_id:p.id,company_id:companyId}});db.prepare('UPDATE purchases SET payment_order_id=? WHERE id=?').run(order.id,id);return res.status(201).json({mode:'razorpay',purchaseId:id,orderId:order.id,amount:order.amount,currency:order.currency,keyId});}
  return res.status(201).json({mode:'demo',purchaseId:id,orderId,amount:total*100,currency:'INR',keyId:null});
 }catch(e){releasePurchase(id);return asError(res,e.message.includes('reserved by another')?409:502,e.message)}
});
app.post('/api/payments/demo-confirm',(req,res)=>{
 if(rzp||!demoMode)return asError(res,403,'Demo checkout is disabled when Razorpay is configured.');const {purchaseId,method='UPI'}=req.body||{};if(!['UPI','Debit card','Credit card','Net banking'].includes(method))return asError(res,400,'Choose one of the available demo payment methods.');const p=getPurchase.get(purchaseId);if(!p||p.provider!=='demo')return asError(res,404,'Demo order not found.');
 try{completePurchase({purchaseId,paymentId:`demo_payment_${crypto.randomUUID()}`});db.prepare('UPDATE purchases SET payment_method=? WHERE id=?').run(method,purchaseId);audit.run(p.company_id,'demo_payment_method_recorded',purchaseId,JSON.stringify({method}));res.json({ok:true,purchaseId,status:'Successful',settlement:'Pending',method,message:'Demo payment confirmed and awaiting government settlement.'})}catch(e){asError(res,e.status||409,e.message)}
});
app.post('/api/payments/cancel',(req,res)=>{const {purchaseId}=req.body||{};const p=getPurchase.get(purchaseId);if(!p)return asError(res,404,'Purchase not found.');releasePurchase(purchaseId);res.json({ok:true,status:p.status==='Initiated'?'Failed':p.status})});
app.post('/api/payments/verify',async(req,res)=>{
 if(!rzp)return asError(res,503,'Razorpay is not configured.');const {razorpay_order_id:orderId,razorpay_payment_id:paymentId,razorpay_signature:signature}=req.body||{};if(!orderId||!paymentId||!signature)return asError(res,400,'Razorpay response is incomplete.');
 const expected=crypto.createHmac('sha256',keySecret).update(`${orderId}|${paymentId}`).digest('hex');const a=Buffer.from(expected),b=Buffer.from(signature);if(a.length!==b.length||!crypto.timingSafeEqual(a,b)){const order=db.prepare('SELECT id FROM purchases WHERE payment_order_id=?').get(orderId);if(order)releasePurchase(order.id);return asError(res,400,'Payment signature could not be verified.');}
 const purchase=db.prepare('SELECT * FROM purchases WHERE payment_order_id=?').get(orderId);if(!purchase)return asError(res,404,'Purchase order not found.');
 try{const verified=await rzp.payments.fetch(paymentId);if(verified.order_id!==orderId||verified.amount!==purchase.total*100||verified.currency!=='INR'||verified.status!=='captured')return asError(res,409,'Razorpay payment is not captured for the expected amount and order.');completePurchase({purchaseId:purchase.id,paymentId,signature});res.json({ok:true,purchaseId:purchase.id,status:'Successful',settlement:'Pending'})}catch(e){asError(res,e.status||502,e.message||'Could not verify payment status.')}
});
app.post('/api/webhooks/razorpay',(req,res)=>{
 if(!webhookSecret)return asError(res,503,'Webhook secret is not configured.');const signature=req.get('x-razorpay-signature')||'',expected=crypto.createHmac('sha256',webhookSecret).update(req.rawBody||'').digest('hex');const a=Buffer.from(expected),b=Buffer.from(signature);if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return asError(res,400,'Invalid webhook signature.');
 const event=req.body?.event,eventId=req.get('x-razorpay-event-id')||crypto.createHash('sha256').update(req.rawBody||'').digest('hex');if(db.prepare('SELECT 1 FROM webhook_events WHERE id=?').get(eventId))return res.json({ok:true,duplicate:true});
 try{db.transaction(()=>{db.prepare('INSERT INTO webhook_events(id,event) VALUES(?,?)').run(eventId,event||'unknown');const entity=req.body?.payload?.payment?.entity;if(event==='payment.captured'&&entity?.order_id){const p=db.prepare('SELECT * FROM purchases WHERE payment_order_id=?').get(entity.order_id);if(p&&entity.amount===p.total*100&&entity.currency==='INR')completePurchase({purchaseId:p.id,paymentId:entity.id,signature:'verified_webhook'});}if(event==='payment.failed'&&entity?.order_id){const p=db.prepare('SELECT id FROM purchases WHERE payment_order_id=?').get(entity.order_id);if(p)releasePurchase(p.id,'Failed');}})();res.json({ok:true})}catch(e){asError(res,500,e.message)}
});
app.post('/api/purchases/:id/retire',(req,res)=>{if(req.body?.role!=='government')return asError(res,403,'Credit retirement is available only from the government portal.');const p=getPurchase.get(req.params.id);if(!p||p.status!=='Successful'||p.settlement!=='Settled')return asError(res,409,'Only successfully settled purchases can be retired.');if(p.retired)return res.json({ok:true,alreadyRetired:true});const company=db.prepare('SELECT registered_at FROM companies WHERE id=?').get(p.company_id);const eligibleAt=new Date(company.registered_at);eligibleAt.setUTCFullYear(eligibleAt.getUTCFullYear()+1);if(Date.now()<eligibleAt.getTime())return asError(res,409,`Government retirement access begins after the company has been registered for one year (${eligibleAt.toISOString().slice(0,10)}).`);db.prepare('UPDATE purchases SET retired=1 WHERE id=? AND retired=0').run(p.id);audit.run('government','credits_retired',p.id,JSON.stringify({quantity:p.quantity,companyId:p.company_id,registeredAt:company.registered_at}));res.json({ok:true})});
app.post('/api/purchases/:id/settle',(req,res)=>{if(req.body?.role!=='government')return asError(res,403,'Only the government portal can approve settlement and issue the ESG report.');const p=getPurchase.get(req.params.id);if(!p||p.status!=='Successful')return asError(res,409,'Only successful company payments can be marked settled.');if(p.settlement==='Settled')return res.json({ok:true,alreadySettled:true,certificate:db.prepare('SELECT * FROM certificates WHERE purchase_id=?').get(p.id)||null});const now=new Date().toISOString(),number=`GCM-ESG-${new Date().getFullYear()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;try{db.transaction(()=>{db.prepare("UPDATE purchases SET settlement='Settled' WHERE id=? AND status='Successful'").run(p.id);makeCertificate.run(`CERT-${crypto.randomUUID()}`,p.id,p.company_id,p.project_id,p.farmer_id,number,p.quantity,p.total,p.payment_id||req.body?.reference||p.id,now);audit.run('government','company_funds_settled',p.id,JSON.stringify({paymentId:p.payment_id,reference:req.body?.reference||null,certificate:number}));})();res.json({ok:true,status:'Settled',certificate:db.prepare('SELECT * FROM certificates WHERE purchase_id=?').get(p.id)})}catch(e){asError(res,409,'Could not settle payment or issue its certificate.') }});
app.post('/api/payouts/:purchaseId/approve',(req,res)=>{
 const purchase=getPurchase.get(req.params.purchaseId);if(!purchase||purchase.status!=='Successful'||purchase.settlement!=='Settled')return asError(res,409,'Payout requires a settled company purchase.');if(db.prepare('SELECT 1 FROM farmer_payments WHERE purchase_id=?').get(purchase.id))return asError(res,409,'This purchase already has a farmer payment record.');
 const project=db.prepare('SELECT * FROM projects WHERE id=?').get(purchase.project_id);const cfg=settings();const q=Math.min(purchase.quantity,project.verified);if(q<1||q>project.sold)return asError(res,409,'No verified and sold credits qualify for payout.');
 const gross=q*cfg.farmer_rate,deductions=Math.round(gross*(cfg.deduction_percent+cfg.service_percent)/100),incentive=q*cfg.incentive_per_cc,amount=Math.max(0,gross-deductions+incentive);if(amount<=0)return asError(res,409,'Calculated payment must be greater than zero.');
 const id=`FP-${crypto.randomUUID()}`,reference=`FUND-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;try{db.prepare("INSERT INTO farmer_payments(id,purchase_id,farmer_id,project_id,quantity,rate,gross,deductions,incentive,amount,status,reference,note,paid_at) VALUES(?,?,?,?,?,?,?,?,?,?,'Paid',?,?,CURRENT_TIMESTAMP)").run(id,purchase.id,purchase.farmer_id,purchase.project_id,q,cfg.farmer_rate,gross,deductions,incentive,amount,reference,req.body?.note||'Approved and recorded by demo officer');audit.run('government','farmer_payment_disbursed',id,JSON.stringify({purchaseId:purchase.id,amount,reference}));res.status(201).json({ok:true,id,reference,amount,status:'Paid'})}catch(e){asError(res,409,'This purchase has already been paid or is no longer eligible.')}
});
app.post('/api/payouts/:purchaseId/reject',(req,res)=>{const p=getPurchase.get(req.params.purchaseId);if(!p||p.status!=='Successful'||p.settlement!=='Settled')return asError(res,409,'Only settled purchases can be reviewed.');if(db.prepare('SELECT 1 FROM farmer_payments WHERE purchase_id=?').get(p.id))return asError(res,409,'This purchase already has a payment decision.');const id=`FP-${crypto.randomUUID()}`;db.prepare("INSERT INTO farmer_payments(id,purchase_id,farmer_id,project_id,quantity,rate,gross,deductions,incentive,amount,status,reference,note) VALUES(?,?,?,?,?,?,?,?,?,0,'Rejected',?,?)").run(id,p.id,p.farmer_id,p.project_id,p.quantity,0,0,0,0,`REJ-${crypto.randomBytes(4).toString('hex')}`,req.body?.note||'Rejected by demo officer');audit.run('government','farmer_payment_rejected',id,JSON.stringify({purchaseId:p.id}));res.status(201).json({ok:true,status:'Rejected'})});
app.put('/api/settings',(req,res)=>{const b=req.body||{};const next={farmer_rate:n(b.rate),deduction_percent:n(b.deduction),service_percent:n(b.service),incentive_per_cc:n(b.incentive)};if(next.farmer_rate<=0||Object.values(next).some(x=>x<0))return asError(res,400,'Payment rules must use non-negative values and a positive rate.');db.transaction(()=>{for(const [k,v] of Object.entries(next))db.prepare('UPDATE settings SET value=? WHERE key=?').run(v,k);audit.run('government','payment_rules_updated',null,JSON.stringify(next))})();res.json({ok:true,settings:next})});

const dist=path.join(here,'..','dist');if(fs.existsSync(dist)){app.use(express.static(dist));app.get(/.*/,(req,res)=>res.sendFile(path.join(dist,'index.html')))}
setInterval(()=>{const expired=db.prepare("SELECT id FROM purchases WHERE status='Initiated' AND created_at < datetime('now','-20 minutes')").all();for(const p of expired)releasePurchase(p.id,'Failed')},60_000);
const port=Number(process.env.PORT||4321);const server=app.listen(port,'127.0.0.1',()=>console.log(`Green Carbon API listening on http://127.0.0.1:${port} (${rzp?'Razorpay':'demo'} payments)`));

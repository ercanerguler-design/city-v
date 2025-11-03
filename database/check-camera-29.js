require('dotenv').config({path:'.env.local'});
const {sql}=require('@vercel/postgres');
(async()=>{
  const r=await sql`SELECT id,camera_name,ip_address,port,stream_url FROM business_cameras WHERE id=29`;
  console.log(JSON.stringify(r.rows[0], null, 2));
  process.exit(0);
})();

import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js'
config({ path: ".env.local" });

async function main() {
    const db = drizzle(process.env.DATABASE_URL!);
}
main();
// import { config } from 'dotenv';
// import { drizzle } from 'drizzle-orm/postgres-js';
// import postgres from 'postgres';
// config({ path: '.env' }); // or .env.local
// const client = postgres(process.env.DATABASE_URL!);
// export const db = drizzle({ client });
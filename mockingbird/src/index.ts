import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js'
// config({ path: ".env.local" });
// import { interviewTable } from './db/schema';
// import postgres from 'postgres';

// // Only create the connection on the server side
// const connectionString = process.env.DATABASE_URL!;

// // Create a singleton database connection
// export const client = postgres(connectionString, { prepare: false });
// export const db = drizzle(client);
export const db = drizzle(process.env.DATABASE_URL!);

async function main() {
   
// const interviewData: typeof interviewTable.$inferInsert[] = [
//   {
//     title: "Frontend Developer Interview",
//     description: "Assessing candidates for the Frontend Developer position with focus on React",
//     domain: "Frontend",
//     seniority: "Mid-Level",
//     duration: "45 mins",
//     key_skills: "JavaScript,React,CSS,HTML,TypeScript"
//   },
//   {
//     title: "Backend Engineer Assessment",
//     description: "Technical evaluation for Backend Engineering candidates",
//     domain: "Backend",
//     seniority: "Senior",
//     duration: "1 hour",
//     key_skills: "Node.js,Python,SQL,API Design,Microservices"
//   },
//   {
//     title: "Full Stack Developer Screening",
//     description: "Comprehensive assessment for full stack development skills",
//     domain: "Full Stack",
//     seniority: "Senior",
//     duration: "1 hour",
//     key_skills: "JavaScript,React,Node.js,MongoDB,GraphQL"
//   },
//   {
//     title: "Data Science Technical Interview",
//     description: "Initial screening for Data Science candidates",
//     domain: "Data Science",
//     seniority: "Senior",
//     duration: "45 mins",
//     key_skills: "Python,R,Machine Learning,SQL,Data Visualization"
//   },
//   {
//     title: "Mobile App Developer Interview",
//     description: "Technical assessment for iOS and Android developers",
//     domain: "Mobile",
//     seniority: "Mid-Level",
//     duration: "1 hour",
//     key_skills: "Swift,Kotlin,React Native,Flutter,Mobile Architecture"
//   },
//   {
//     title: "DevOps Engineer Technical Assessment",
//     description: "Technical evaluation for DevOps candidates",
//     domain: "DevOps",
//     seniority: "Senior",
//     duration: "1 hour",
//     key_skills: "Docker,Kubernetes,CI/CD,Cloud Infrastructure,Terraform"
//   },
//   {
//     title: "UI/UX Designer Interview",
//     description: "Creative assessment for UI/UX Designer position",
//     domain: "UI/UX",
//     seniority: "Mid-Level",
//     duration: "30 mins",
//     key_skills: "Figma,User Research,Wireframing,Prototyping,UI Design"
//   },
//   {
//     title: "Machine Learning Engineer Interview",
//     description: "Deep technical interview for ML engineers",
//     domain: "Machine Learning",
//     seniority: "Senior",
//     duration: "1 hour",
//     key_skills: "Python,TensorFlow,PyTorch,Computer Vision,NLP"
//   }
// ];

 
//       // Batch insert all interviews at once
//       try {
//         await db.insert(interviewTable).values(interviewData);
//         console.log('All interviews created successfully!');
//       } catch (error) {
//         console.error('Error creating interviews:', error);
//       }


    //   const interviews = await db.select().from(interviewTable);
    //   console.log('Getting all interviews from the database: ', interviews)

}
main();

// export async function getInterviews() {
//     const interviews = await db.select().from(interviewTable);
//     console.log('Getting all interviews from the database: ', interviews);
//     return interviews;
//   }

// import { config } from 'dotenv';
// import { drizzle } from 'drizzle-orm/postgres-js';
// import postgres from 'postgres';
// config({ path: '.env' }); // or .env.local
// const client = postgres(process.env.DATABASE_URL!);
// export const db = drizzle({ client });
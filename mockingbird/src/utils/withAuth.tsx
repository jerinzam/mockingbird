// // utils/withAuth.tsx
// 'use client';
// import { useSession } from '@/app/providers';
// import { useRouter } from 'next/navigation';
// import { useEffect } from 'react';

// export const withAuth = (Component: React.FC) => {
//   return () => {
//     const session = useSession();
//     const router = useRouter();

//     useEffect(() => {
//       if (session === null) {
//         router.push('/');
//       }
//     }, [session]);

//     if (!session) return null;
//     return <Component />;
//   };
// };

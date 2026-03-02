// 'use server';

// import { db } from '@/db/client';
// import { user } from '@/db/schema';
// import { auth } from '@/lib/auth';
// import { eq } from 'drizzle-orm';
// import { headers } from 'next/headers';
// import { z } from 'zod';

// type Error = {
//   ok: boolean;
//   message: string;
//   status: string | number;
// };

// const editRoleSchema = z.object({
//   targetUser: z.string().min(1),
// });

// async function editRoleAction(state: Error | null, formData: FormData) {
//   const session = await auth.api.getSession({ headers: await headers() });

//   if (!session?.user?.id) {
//     return { ok: false, message: 'Not Authenticated', status: 401 };
//   }
//   console.log('userid check', session?.user.id);

//   const currentUser = await db.query.user.findFirst({
//     where: eq(user.id, session.user.id),
//   });

//   console.log('query current user', currentUser);

//   if (!currentUser || currentUser.role !== 'admin') {
//     return { ok: false, message: 'Not Authorized', status: 403 };
//   }
//   console.log('check if current user is admin', currentUser?.role === 'admin');

//   const parsed = editRoleSchema.safeParse({
//     targetUser: formData.get('userId'),
//   });

//   if (!parsed.success) {
//     return { ok: false, message: 'Invalid Input', status: 400 };
//   }
//   console.log('parsing client input userId', parsed.data);

//   const { targetUser } = parsed.data;

//   console.log('target user:', targetUser);

//   try {
//     const [updatedRole] = await db
//       .update(user)
//       .set({ role: 'admin' })
//       .where(eq(user.id, targetUser))
//       .returning();

//     console.log('updated Role in db', updatedRole);
//     if (!updatedRole) {
//       return { ok: false, message: 'Unexpected Error', status: 500 };
//     }
//   } catch (error) {
//     console.error(error);
//     return { ok: false, message: 'Unexpected Error', status: 500 };
//   }

//   return { ok: true, message: 'OK', status: 200 };
// }

// export default editRoleAction;

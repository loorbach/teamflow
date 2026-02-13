import { auth } from '@/lib/auth';

function Temp() {
  return (
    <div>
      <form
        className="flex flex-col max-w-md mx-auto"
        action={async (formData) => {
          'use server';
          const name = formData.get('name') as string;
          const email = formData.get('email') as string;
          const password = formData.get('password') as string;
          const orgId = formData.get('orgId') as string;
          // const role = formData.get('role') as string;
          // console.log(name, email, password, orgId, role);

          try {
            const data = await auth.api.signUpEmail({
              body: {
                name,
                email,
                password,
                organization_id: orgId,
              },
            });

            if (data) console.log(data);
          } catch (error) {
            console.log(error);
          }
        }}
      >
        <input className="border border-white" type="text" placeholder="name" name="name"></input>
        <input
          className="border border-white"
          type="email"
          placeholder="email"
          name="email"
        ></input>
        <input
          className="border border-white"
          type="password"
          placeholder="password"
          name="password"
        ></input>
        <input className="border border-white" type="text" placeholder="orgId" name="orgId"></input>
        <input className="border border-white" type="text" placeholder="role" name="role"></input>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default Temp;

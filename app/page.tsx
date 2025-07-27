import { auth } from "@/auth";
import HomeClient from "@/components/home-client";
import { SignOut } from "@/components/signout-button";
import { db } from "@/db/client";
import { employees, teams } from "@/db/schema";
import { redirect } from "next/navigation";

async function Home() {
  const session = await auth();

  if (!session?.user) redirect("/login");

  const teamList = await db.select().from(teams);
  const employeesList = await db.select().from(employees);

  return (
    <main className="p-4 max-w-screen overflow-hidden">
      <header className="flex justify-between">
        <h1 className="text-2xl font-bold mb-4">TeamFlow</h1>
        <SignOut />
      </header>
      <HomeClient teams={teamList} employees={employeesList} />
    </main>
  );
}

export default Home;
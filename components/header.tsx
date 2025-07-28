import { SignOut } from "./signout-button";

function Header() {
  return (
    <header className="flex justify-between items-center border px-4 py-2">
      <h1 className="text-xl font-bold">Teamflow</h1>
      <SignOut />
  </header>
  );
}

export default Header;
import { Appbar } from "./components/Appbar";

export default function Home() {
  console.log(process.env.GOOGLE_CLIENT_ID);
  console.log(process.env.GOOGLE_CLIENT_SECRET);
  return (
    <Appbar />
  );
}

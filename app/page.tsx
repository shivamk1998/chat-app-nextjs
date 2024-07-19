import Chat from "@/components/Chat";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <div className="container mx-auto">
    <h1 className="text-3xl font-bold text-center my-8">AI Chat App</h1>
    <Chat />
  </div>
  );
}

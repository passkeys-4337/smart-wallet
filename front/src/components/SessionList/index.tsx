"use client";

import { useWalletConnect } from "@/libs/wallet-connect";
import SessionCard from "../SessionCard";

export default function SessionList() {
  const { sessions } = useWalletConnect();

  return (
    <div>
      {sessions &&
        Object.values(sessions).map((element) => {
          return (
            <SessionCard key={element.session.topic} wcReactSession={element} />
          );
        })}
    </div>
  );
}

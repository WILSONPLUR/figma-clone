"use client";

import { ReactNode } from "react";

import { RoomProvider } from "../liveblocks.config";

import { LiveMap } from "@liveblocks/client";

import { ClientSideSuspense } from "@liveblocks/react";
import { Loader } from "lucide-react";

export function Room({ children }: { children: ReactNode }) {
  return (
    <RoomProvider
      id="my-room"
      initialPresence={{
        cursor: null,
        cursorColor: null,
        editingText: null,
      }}
      initialStorage={{
        canvasObjects: new LiveMap(),
      }}
    >
      <ClientSideSuspense fallback={<Loader />}>
        {() => children}
      </ClientSideSuspense>
    </RoomProvider>
  );
}

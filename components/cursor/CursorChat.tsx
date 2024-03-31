import CursorSVG from "@/public/assets/CursorSVG";
import { CursorChatProps, CursorMode, CursorState } from "@/types/type";
import { nextImageLoaderRegex } from "next/dist/build/webpack-config";
import React from "react";

export const CursorChat = ({
  cursor,
  cursorState,
  setCursorState,
  updateMyPresence,
}: CursorChatProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateMyPresence({ message: e.target.value });
    setCursorState({
      mode: CursorMode.Chat,
      previousMessage: null,
      message: e.target.value,
    });
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setCursorState({
        mode: CursorMode.Chat,
        previousMessage:
          cursorState.mode === CursorMode.Chat ? cursorState.message : null,
        message: "",
      });
    } else if (e.key === "Espace") {
      setCursorState({
        mode: CursorMode.Hidden,
      });
    }
  };
  return (
    <div
      className="absolute top-0 left-0"
      style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }}
    >
      {cursorState.mode === CursorMode.Chat && (
        <>
          <CursorSVG color="#000" />
          <div
            onKeyUp={(e) => e.stopPropagation()}
            className="absolute left-2 top-5 bg-blue-500 px-4 py-2 text-sm leading-relaxed text-white rounded-[20px]"
          >
            {cursorState.previousMessage && (
              <div>{cursorState.previousMessage}</div>
            )}
            <input
              type="text"
              className="z-10 w-60 border-none bg-transparent text-white placeholder-blue-300 outline-none"
              autoFocus={true}
              placeholder={
                cursorState.previousMessage ? "" : "Type a message..."
              }
              value={cursorState.message}
              maxLength={50}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
          </div>
        </>
      )}
    </div>
  );
};

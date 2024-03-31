import React, { useCallback, useEffect, useRef, useState } from "react";
import { LiveCursors } from "./cursor/LiveCursors";
import {
  useBroadcastEvent,
  useEventListener,
  useMyPresence,
  useOthers,
  useRedo,
  useSelf,
  useUndo,
} from "@/liveblocks.config";
import { CursorChat } from "./cursor/CursorChat";
import {
  CursorMode,
  CursorState,
  CustomFabricObject,
  Reaction,
} from "@/types/type";
import useInterval from "@/hooks/useInterval";
import FlyingReaction from "./reaction/FlyingReaction";
import ReactionSelector from "./reaction/ReactionSelector";
import { fabric } from "fabric";
import { User } from "lucide-react";
import { generateRandomName } from "@/lib/utils";
import {
  handleCanvasMouseDown,
  handleResize,
  initializeFabric,
} from "@/lib/canvas";
import { Comments } from "./comments/Comments";
import { ContextMenu } from "./ui/context-menu";
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@radix-ui/react-context-menu";
import { shortcuts } from "@/constants";

type ReactionEvent = {
  x: number;

  y: number;

  value: string;
};

type Props = {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
};

export const Live = ({ canvasRef }: Props) => {
  const others = useOthers();
  const [{ cursor }, updateMyPresence] = useMyPresence();
  const [cursorState, setCursorState] = useState<CursorState>({
    mode: CursorMode.Hidden,
  });
  const broadcast = useBroadcastEvent();
  const undo = useUndo();
  const redo = useRedo();

  const [reactions, setReactions] = useState<Reaction[]>([]);

  const setReaction = useCallback((reaction: string) => {
    setCursorState({ mode: CursorMode.Reaction, reaction, isPressed: false });
  }, []);

  // Remove reactions that are not visible anymore (every 1 sec)

  useInterval(() => {
    setReactions((reactions) =>
      reactions.filter((reaction) => reaction.timestamp > Date.now() - 4000)
    );
  }, 1000);

  useInterval(() => {
    if (
      cursorState.mode === CursorMode.Reaction &&
      cursorState.isPressed &&
      cursor
    ) {
      setReactions((reactions) =>
        reactions.concat([
          {
            point: { x: cursor.x, y: cursor.y },

            value: cursorState.reaction,

            timestamp: Date.now(),
          },
        ])
      );

      broadcast({
        x: cursor.x,

        y: cursor.y,

        value: cursorState.reaction,
      });
    }
  }, 100);

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    event.preventDefault();
    const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
    const y = event.clientY - event.currentTarget.getBoundingClientRect().y;
    if (cursor == null || cursorState.mode !== CursorMode.ReactionSelector) {
      updateMyPresence({ cursor: { x, y } });
    }
  }, []);

  const handlePointerLeave = useCallback((event: React.PointerEvent) => {
    setCursorState({ mode: CursorMode.Hidden });
    updateMyPresence({ cursor: null, message: null });
  }, []);

  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
    const y = event.clientY - event.currentTarget.getBoundingClientRect().y;
    setCursorState((state) =>
      state.mode === CursorMode.Reaction ? { ...state, isPressed: true } : state
    );
    updateMyPresence({ cursor: { x, y } });
  }, []);

  const handleContextMenuClick = useCallback((key: string) => {
    switch (key) {
      case "Chat":
        setCursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: "",
        });
        break;

      case "Undo":
        undo();
        break;

      case "Redo":
        redo();
        break;

      case "Reactions":
        setCursorState({ mode: CursorMode.ReactionSelector });
        break;
      default:
        break;
    }
  }, []);

  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "/") {
        setCursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: "",
        });
      } else if (e.key === "Escape") {
        updateMyPresence({ message: "" });
        setCursorState({ mode: CursorMode.Hidden });
      } else if (e.key === "e") {
        e.preventDefault();
        setCursorState({ mode: CursorMode.ReactionSelector });
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault();
      }
    };

    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [updateMyPresence]);

  useEventListener((eventData) => {
    const event = eventData.event as ReactionEvent;

    setReactions((reactions) =>
      reactions.concat([
        {
          point: { x: event.x, y: event.y },
          value: event.value,
          timestamp: Date.now(),
        },
      ])
    );
  });

  return (
    <ContextMenu>
      <ContextMenuTrigger
        id="canvas"
        onPointerMove={handlePointerMove}
        onPointerUp={() => {
          setCursorState((state) =>
            state.mode === CursorMode.Reaction
              ? { ...state, isPressed: false }
              : state
          );
        }}
        onPointerDown={handlePointerDown}
        onPointerLeave={handlePointerLeave}
        className="relative h-full w-full flex flex-1 justify-center items-center"
      >
        <canvas ref={canvasRef} />

        {reactions.map((reaction) => {
          return (
            <FlyingReaction
              key={reaction.timestamp.toString()}
              x={reaction.point.x}
              y={reaction.point.y}
              timestamp={reaction.timestamp}
              value={reaction.value}
            />
          );
        })}
        {cursor && (
          <>
            <CursorChat
              cursor={cursor}
              cursorState={cursorState}
              updateMyPresence={updateMyPresence}
              setCursorState={setCursorState}
            />
            {cursorState.mode === CursorMode.ReactionSelector && (
              <div>
                <ReactionSelector
                  setReaction={(reaction) => {
                    setReaction(reaction);
                  }}
                />
              </div>
            )}

            {cursorState.mode === CursorMode.Reaction && (
              <div className="pointer-events-none absolute top-3.5 left-1 select-none">
                {cursorState.reaction}
              </div>
            )}
          </>
        )}
        <LiveCursors others={others} />
        <Comments />
      </ContextMenuTrigger>
      <ContextMenuContent className="right-menu-content">
        {shortcuts.map(({ name, shortcut, key }) => (
          <ContextMenuItem
            key={key}
            onClick={() => handleContextMenuClick(name)}
            className="right-menu-item"
          >
            <p>{name}</p>
            <p className="text-xs text-primary-grey-300">{shortcut}</p>
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
};

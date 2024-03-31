import { useOthers, useSelf } from "@/liveblocks.config";
import React from "react";
import Avatar from "../avatar/Avatar";
import { generateRandomName } from "@/lib/utils";

export const ActiveUsers = () => {
  const users = useOthers();
  const currentUser = useSelf();
  const hasMoreUsers = users.length > 3;

  return (
    <div className="flex pl-3 mr-5">
      {currentUser && (
        <div className="relative ml-7 py-3 first:ml-0">
          <Avatar name="You" />
        </div>
      )}
      {users.slice(0, 3).map(({ connectionId, info }) => {
        return (
          <div key={connectionId} className="relative ml-5 py-3 first:ml-0">
            <Avatar name={generateRandomName()} />
          </div>
        );
      })}

      {hasMoreUsers && <div>+{users.length - 3}</div>}
    </div>
  );
};

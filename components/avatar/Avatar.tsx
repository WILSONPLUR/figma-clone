import React, { memo } from "react";

import styles from "./Avatar.module.css";

const IMAGE_SIZE = 48;

const Avatar = ({ name }: { name: string }) => {
  return (
    <div className={styles.avatar} data-tooltip={name}>
      <img
        src={`https://liveblocks.io/avatars/avatar-${Math.floor(
          Math.random() * 30
        )}.png`}
        height={IMAGE_SIZE}
        width={IMAGE_SIZE}
        className={styles.avatar_picture}
      />
    </div>
  );
};

export default memo(
  Avatar,
  (prevProps, nextProps) => prevProps.activeElement === nextProps.activeElement
);

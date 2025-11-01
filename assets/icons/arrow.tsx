import React from "react";
import Svg, { Mask, G, Path, Rect } from "react-native-svg";
import { Direction, IconProps } from "./types";

export const Arrow = ({
  size = 24,
  color = "black",
  direction = "right",
}: IconProps) => {
  const rotationMap: Record<Direction, string> = {
    up: "270deg",
    right: "0deg",
    down: "90deg",
    left: "180deg",
  };
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      style={{ transform: [{ rotate: rotationMap[direction] }] }}
    >
      <Mask
        id="mask0_77_67"
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="14"
        height="14"
      >
        <Rect width="14" height="14" fill="#D9D9D9" />
      </Mask>
      <G mask="url(#mask0_77_67)">
        <Path
          d="M4.68126 12.8332L3.64584 11.7978L8.44376 6.99984L3.64584 2.20192L4.68126 1.1665L10.5146 6.99984L4.68126 12.8332Z"
          fill="black"
        />
      </G>
    </Svg>
  );
};

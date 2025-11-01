import React from "react";
import Svg from "react-native-svg";
import { IconProps } from "./types";

export const Blank = ({ size = 24 }: IconProps) => {
  return <Svg width={size} height={size}></Svg>;
};

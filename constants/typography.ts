import { TextStyle } from "react-native";

export const typography: Record<string, TextStyle> = {
  h1: { fontFamily: "Pretendard-Bold", fontSize: 36, lineHeight: 48 },
  h2: { fontFamily: "Pretendard-Bold", fontSize: 28, lineHeight: 36 },
  h3: { fontFamily: "Pretendard-Bold", fontSize: 20, lineHeight: 24 },
  title: { fontFamily: "Pretendard-Bold", fontSize: 18, lineHeight: 24 },
  body: { fontFamily: "Pretendard-Regular", fontSize: 16, lineHeight: 24 },
  bodyBold: { fontFamily: "Pretendard-Bold", fontSize: 14, lineHeight: 24 },
  caption: { fontFamily: "Pretendard-Regular", fontSize: 14, lineHeight: 14 },
  small: { fontFamily: "Pretendard-Regular", fontSize: 12, lineHeight: 12 },
  smallBold: { fontFamily: "Pretendard-Bold", fontSize: 12, lineHeight: 10 },
  timer: { fontFamily: "Pretendard-Bold", fontSize: 50, lineHeight: 48 },
  tiny: { fontFamily: "Pretendard-Regular", fontSize: 10, lineHeight: 12 },
  tinyBold: { fontFamily: "Pretendard-Bold", fontSize: 10, lineHeight: 10 },
  micro: { fontFamily: "Pretendard-Regular", fontSize: 8, lineHeight: 8 },
};

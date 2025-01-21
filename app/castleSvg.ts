"use client";
export const dynamic = "force-dynamic";
import { BASE_WIDTH, BASE_HEIGHT } from "./gameState";

export const castleSvg = `
  <svg width="${BASE_WIDTH}" height="${BASE_HEIGHT}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="30" width="10" height="20" fill="blue"/>
    <rect x="25" y="20" width="15" height="30" fill="blue"/>
    <rect x="45" y="30" width="10" height="20" fill="blue"/>
    <rect x="0" y="50" width="64" height="10" fill="blue"/>
    <rect x="20" y="10" width="5" height="10" fill="blue"/>
    <rect x="39" y="10" width="5" height="10" fill="blue"/>
  </svg>
`;

function getImage() {
  const img = new Image();
  const svg = new Blob([castleSvg], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(svg);
  img.src = url;

  return img;
}

export const getCastleImage = getImage;

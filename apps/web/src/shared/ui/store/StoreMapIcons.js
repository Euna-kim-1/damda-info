import React from 'react';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { normalizeName } from '../../utils/normalizeText';

const grocerySvg = (color) =>
  renderToStaticMarkup(
    React.createElement(StorefrontIcon, {
      style: { color, fontSize: 28 },
    }),
  );

const createGroceryIcon = (color) =>
  L.divIcon({
    className: 'store-grocery-icon',
    html: `<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">${grocerySvg(
      color,
    )}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -24],
    tooltipAnchor: [0, -24],
  });

export const createStoreMarkerIcons = () => ({
  emart: createGroceryIcon('#f4c542'),
  hmart: createGroceryIcon('#2f6bff'),
  amart: createGroceryIcon('#ef5350'),
  default: createGroceryIcon('#6c7a89'),
});

export const getStoreMarkerIcon = (storeName, icons) => {
  const normalized = normalizeName(storeName || '');

  if (
    normalized.includes('이마트') ||
    normalized.includes('emart') ||
    normalized.includes('e마트')
  ) {
    return icons.emart;
  }

  if (
    normalized.includes('h마트') ||
    normalized.includes('hmart') ||
    normalized.includes('h마켓')
  ) {
    return icons.hmart;
  }

  if (
    normalized.includes('에이마트') ||
    normalized.includes('amart') ||
    normalized.includes('a마트')
  ) {
    return icons.amart;
  }

  return icons.default;
};

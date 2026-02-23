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

const STORE_MARKER_COLORS = {
  emart: '#f4c542',
  hmart: '#2f6bff',
  amart: '#ef5350',
  default: '#6c7a89',
};

export const createStoreMarkerIcons = () => ({
  emart: createGroceryIcon(STORE_MARKER_COLORS.emart),
  hmart: createGroceryIcon(STORE_MARKER_COLORS.hmart),
  amart: createGroceryIcon(STORE_MARKER_COLORS.amart),
  default: createGroceryIcon(STORE_MARKER_COLORS.default),
});

export const getStoreMarkerType = (storeName) => {
  const normalized = normalizeName(storeName || '');
  const compact = normalized.replace(/[\s-]/g, '');

  if (
    normalized.includes('이마트') ||
    normalized.includes('e마트') ||
    compact.includes('emart')
  ) {
    return 'emart';
  }

  if (
    normalized.includes('h마트') ||
    normalized.includes('h마켓') ||
    compact.includes('hmart')
  ) {
    return 'hmart';
  }

  if (
    normalized.includes('에이마트') ||
    normalized.includes('a마트') ||
    compact.includes('amart')
  ) {
    return 'amart';
  }

  return 'default';
};

export const getStoreMarkerColor = (storeName) =>
  STORE_MARKER_COLORS[getStoreMarkerType(storeName)] ||
  STORE_MARKER_COLORS.default;

export const getStoreMarkerIcon = (storeName, icons) => {
  const type = getStoreMarkerType(storeName);
  return icons?.[type] || icons?.default;
};

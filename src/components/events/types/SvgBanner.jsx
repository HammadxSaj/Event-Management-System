// SvgBanner.js
import React from 'react';

const SvgBanner = ({ date }) => {
  return (
    <div className="svg-banner-container">
      <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 121 163" fill="none">
        <g filter="url(#filter0_d_90_1586)">
          <path d="M20 25H69V116L42.7907 103.477L20 116V25Z" fill="url(#paint0_linear_90_1586)" shape-rendering="crispEdges"/>
        </g>
        <defs>
          <filter id="filter0_d_90_1586" x="0.599998" y="0.599998" width="119.8" height="161.8" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="16" dy="11"/>
            <feGaussianBlur stdDeviation="17.7"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0.850513 0 0 0 0 0.850513 0 0 0 0 0.850513 0 0 0 0.67 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_90_1586"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_90_1586" result="shape"/>
          </filter>
          <linearGradient id="paint0_linear_90_1586" x1="44.5" y1="25" x2="44.5" y2="116" gradientUnits="userSpaceOnUse">
            <stop stop-opacity="0.25"/>
            <stop offset="1" stop-color="#853F32"/>
          </linearGradient>
        </defs>
      </svg>
      <div className="svg-banner-date">
        {date}
      </div>
    </div>
  );
};

export default SvgBanner;

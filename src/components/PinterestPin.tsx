import { useState } from "react";

interface PinterestPinProps {
  mainImage?: string;
  color?: string;
  title?: string;
  subtitle?: string;
}

export const PinterestPin = ({
  mainImage,
  color = "#5B3A1D",
  title = "BAKE RECIPES",
  subtitle = "Brown minimalist bakery template",
}: PinterestPinProps) => {
  return (
    <div className="relative w-[500px] h-[750px] bg-white rounded-[10px] overflow-hidden shadow-[0_20px_40px_-10px_rgba(91,58,29,0.25)]">
      {/* Main Image Area */}
      <div className="relative w-full h-[600px] overflow-hidden">
        {mainImage ? (
          <img
            src={mainImage}
            alt="Pin content"
            className="w-full h-full object-cover"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <p className="text-muted-foreground font-inter">Image placeholder</p>
          </div>
        )}
      </div>

      {/* Color Band with Overlap */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[160px] -mt-[10px] flex flex-col items-center justify-center px-10"
        style={{ backgroundColor: color }}
      >
        {/* Title Text */}
        <h1 className="font-playfair font-bold text-white text-[45px] uppercase leading-none tracking-wide mb-2 text-center">
          {title}
        </h1>

        {/* Subtitle Text */}
        {subtitle && (
          <p className="font-inter font-medium text-white/90 text-[18px] text-center leading-tight">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

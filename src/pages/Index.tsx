import { useState } from "react";
import { PinterestPin } from "@/components/PinterestPin";
import { PinControls } from "@/components/PinControls";
import defaultImage from "@/assets/default-pin-image.png";

const Index = () => {
  const [mainImage, setMainImage] = useState<string>(defaultImage);
  const [title, setTitle] = useState("BAKE RECIPES");
  const [subtitle, setSubtitle] = useState("Brown minimalist bakery template");
  const [color, setColor] = useState("#5B3A1D");

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setMainImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-playfair font-bold text-foreground mb-4">
            Pinterest Pin Designer
          </h1>
          <p className="text-xl text-muted-foreground font-inter max-w-2xl mx-auto">
            Create stunning, minimalist Pinterest pins for your recipe and bakery content
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Pin Preview */}
          <div className="flex justify-center lg:sticky lg:top-8">
            <PinterestPin
              mainImage={mainImage}
              title={title}
              subtitle={subtitle}
              color={color}
            />
          </div>

          {/* Controls */}
          <div>
            <PinControls
              title={title}
              subtitle={subtitle}
              color={color}
              onTitleChange={setTitle}
              onSubtitleChange={setSubtitle}
              onColorChange={setColor}
              onImageUpload={handleImageUpload}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

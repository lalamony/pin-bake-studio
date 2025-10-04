import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PinControlsProps {
  title: string;
  subtitle: string;
  color: string;
  onTitleChange: (value: string) => void;
  onSubtitleChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onImageUpload: (file: File) => void;
}

export const PinControls = ({
  title,
  subtitle,
  color,
  onTitleChange,
  onSubtitleChange,
  onColorChange,
  onImageUpload,
}: PinControlsProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-playfair font-bold mb-2">Customize Your Pin</h2>
        <p className="text-muted-foreground font-inter">
          Adjust the template to match your brand
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="image" className="font-inter font-medium">
            Main Image
          </Label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="cursor-pointer"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="title" className="font-inter font-medium">
            Title Text
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="BAKE RECIPES"
            className="font-inter"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subtitle" className="font-inter font-medium">
            Subtitle Text
          </Label>
          <Textarea
            id="subtitle"
            value={subtitle}
            onChange={(e) => onSubtitleChange(e.target.value)}
            placeholder="Brown minimalist bakery template"
            className="font-inter resize-none"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="color" className="font-inter font-medium">
            Band Color
          </Label>
          <div className="flex gap-3">
            <Input
              id="color"
              type="color"
              value={color}
              onChange={(e) => onColorChange(e.target.value)}
              className="w-20 h-12 cursor-pointer"
            />
            <Input
              type="text"
              value={color}
              onChange={(e) => onColorChange(e.target.value)}
              placeholder="#5B3A1D"
              className="flex-1 font-mono"
            />
          </div>
        </div>

        <div className="pt-4">
          <Button className="w-full font-inter font-medium">
            Export Pin (1000x1500px)
          </Button>
        </div>
      </div>
    </Card>
  );
};

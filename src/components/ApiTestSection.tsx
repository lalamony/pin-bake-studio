import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Code, Image as ImageIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const ApiTestSection = () => {
  const [apiKey, setApiKey] = useState("");
  const [jsonPayload, setJsonPayload] = useState(
    JSON.stringify(
      {
        main_image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&h=1800&fit=crop",
        color: "#5B3A1D",
        title: "BAKE RECIPES",
        subtitle: "Brown minimalist bakery template",
        format: "png"
      },
      null,
      2
    )
  );
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleTestApi = async () => {
    if (!apiKey) {
      toast({
        title: "API Key required",
        description: "Please enter your RENDER_KEY",
        variant: "destructive",
      });
      return;
    }

    setIsTestingApi(true);
    setPreviewImage(null);

    try {
      const payload = JSON.parse(jsonPayload);

      const { data, error } = await supabase.functions.invoke('render', {
        body: payload,
        headers: {
          'X-KEY': apiKey,
        },
      });

      if (error) throw error;

      // Convert response to blob URL for preview
      const blob = new Blob([data], { type: 'image/png' });
      const url = URL.createObjectURL(blob);
      setPreviewImage(url);

      toast({
        title: "Success!",
        description: "Pin rendered successfully",
      });
    } catch (error) {
      console.error('API test error:', error);
      toast({
        title: "API test failed",
        description: error.message || "Failed to render pin",
        variant: "destructive",
      });
    } finally {
      setIsTestingApi(false);
    }
  };

  const productionEndpoint = 'https://lowqozpiskjjcukftwqn.supabase.co/functions/v1/render';
  const curlCommand = `curl -X POST "${productionEndpoint}" \\
  -H "Content-Type: application/json" \\
  -H "X-KEY: YOUR_RENDER_KEY" \\
  -o pin.png \\
  -d '${jsonPayload.replace(/\n/g, '').replace(/\s+/g, ' ')}'`;

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-playfair font-bold mb-2 flex items-center gap-2">
          <Code className="h-6 w-6" />
          API Test & Documentation
        </h2>
        <p className="text-muted-foreground font-inter">
          Test the render API endpoint and get integration code
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="apiKey" className="font-inter font-medium">
            RENDER_KEY
          </Label>
          <Input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your RENDER_KEY"
            className="font-mono"
          />
          <p className="text-sm text-muted-foreground">
            Set this in Lovable Cloud → Secrets → RENDER_KEY
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="jsonPayload" className="font-inter font-medium">
            JSON Payload
          </Label>
          <Textarea
            id="jsonPayload"
            value={jsonPayload}
            onChange={(e) => setJsonPayload(e.target.value)}
            className="font-mono text-sm min-h-[200px]"
          />
        </div>

        <Button
          onClick={handleTestApi}
          disabled={isTestingApi}
          className="w-full font-inter font-medium"
        >
          {isTestingApi ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Rendering...
            </>
          ) : (
            <>
              <ImageIcon className="mr-2 h-4 w-4" />
              Test Render API
            </>
          )}
        </Button>

        {previewImage && (
          <div className="space-y-2">
            <Label className="font-inter font-medium">Preview</Label>
            <div className="border rounded-lg p-4 bg-muted/50">
              <img
                src={previewImage}
                alt="Rendered pin preview"
                className="max-w-full h-auto mx-auto"
                style={{ maxHeight: '400px' }}
              />
            </div>
          </div>
        )}

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="endpoint">
            <AccordionTrigger className="font-inter font-medium">
              Production Endpoint
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">POST to:</p>
                <pre className="bg-muted p-3 rounded-md overflow-x-auto text-sm font-mono">
                  {productionEndpoint}
                </pre>
                <p className="text-sm text-muted-foreground mt-2">
                  Required header: <code className="bg-muted px-2 py-1 rounded">X-KEY: YOUR_RENDER_KEY</code>
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="curl">
            <AccordionTrigger className="font-inter font-medium">
              cURL Example
            </AccordionTrigger>
            <AccordionContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{curlCommand}</code>
              </pre>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="n8n">
            <AccordionTrigger className="font-inter font-medium">
              n8n / Make.com Integration
            </AccordionTrigger>
            <AccordionContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                HTTP Request node configuration:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Method:</strong> POST</li>
                <li><strong>URL:</strong> <code className="bg-muted px-2 py-1 rounded text-xs">{productionEndpoint}</code></li>
                <li><strong>Headers:</strong> <code className="bg-muted px-2 py-1 rounded text-xs">X-KEY: YOUR_RENDER_KEY</code></li>
                <li><strong>Body:</strong> JSON with <code className="bg-muted px-1 rounded text-xs">main_image</code>, <code className="bg-muted px-1 rounded text-xs">color</code>, <code className="bg-muted px-1 rounded text-xs">title</code>, <code className="bg-muted px-1 rounded text-xs">subtitle</code>, <code className="bg-muted px-1 rounded text-xs">format</code></li>
                <li><strong>Response:</strong> Binary image (save to storage or send via Telegram/email)</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="javascript">
            <AccordionTrigger className="font-inter font-medium">
              JavaScript Example
            </AccordionTrigger>
            <AccordionContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`const response = await fetch('${productionEndpoint}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-KEY': 'YOUR_RENDER_KEY'
  },
  body: JSON.stringify({
    main_image: 'https://example.com/image.jpg',
    color: '#5B3A1D',
    title: 'BAKE RECIPES',
    subtitle: 'Your subtitle here',
    format: 'png'
  })
});

const blob = await response.blob();
const url = URL.createObjectURL(blob);
// Use url for download or display`}</code>
              </pre>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </Card>
  );
};

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore - ESM import
import satori from "https://esm.sh/satori@0.10.9";
// @ts-ignore - Wasm import
import { initWasm, Resvg as ResvgClass } from "https://deno.land/x/resvg_wasm@0.2.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-key',
};

// Cache fonts in module scope
let playfairFont: ArrayBuffer | null = null;
let interFont: ArrayBuffer | null = null;

async function loadFonts() {
  if (!playfairFont) {
    const playfairResponse = await fetch(
      'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtM.ttf'
    );
    playfairFont = await playfairResponse.arrayBuffer();
  }
  
  if (!interFont) {
    const interResponse = await fetch(
      'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiA.ttf'
    );
    interFont = await interResponse.arrayBuffer();
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check authentication
    const apiKey = req.headers.get('X-KEY');
    const expectedKey = Deno.env.get('RENDER_KEY');
    
    if (!apiKey || apiKey !== expectedKey) {
      console.error('Authentication failed: Invalid or missing X-KEY');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid or missing X-KEY header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body
    const body = await req.json();
    const {
      main_image = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&h=1800&fit=crop',
      color = '#5B3A1D',
      title = 'BAKE RECIPES',
      subtitle = 'Brown minimalist bakery template',
      format = 'png',
    } = body;

    console.log('Rendering pin with params:', { main_image, color, title, subtitle, format });

    // Load fonts
    await loadFonts();

    // Create JSX template matching the design specifications
    const jsx = {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          width: '1000px',
          height: '1500px',
          position: 'relative',
          backgroundColor: 'white',
          borderRadius: '20px',
          overflow: 'hidden',
        },
        children: [
          // MAIN_IMAGE - Main image area (1000x1200px)
          {
            type: 'div',
            props: {
              'data-component-main_image': 'MAIN_IMAGE',
              style: {
                display: 'flex',
                width: '1000px',
                height: '1200px',
                position: 'absolute',
                top: '0',
                left: '0',
                overflow: 'hidden',
              },
              children: [
                {
                  type: 'img',
                  props: {
                    src: main_image,
                    style: {
                      width: '1000px',
                      height: '1200px',
                      objectFit: 'cover',
                      objectPosition: 'center',
                    },
                  },
                },
              ],
            },
          },
          // Shadow layer for depth
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '1186px',
                left: '0',
                width: '1000px',
                height: '4px',
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), transparent)',
              },
            },
          },
          // COLOR_BAND - Bottom color band (overlaps by 14px)
          {
            type: 'div',
            props: {
              'data-component-color': 'COLOR_BAND',
              style: {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                width: '1000px',
                height: '300px',
                position: 'absolute',
                bottom: '0',
                left: '0',
                backgroundColor: color,
                paddingTop: '80px',
                paddingBottom: '80px',
                paddingLeft: '60px',
                paddingRight: '60px',
              },
              children: [
                // TITLE_TEXT
                {
                  type: 'div',
                  props: {
                    'data-component-title': 'TITLE_TEXT',
                    style: {
                      fontFamily: 'Playfair Display',
                      fontWeight: 800,
                      fontSize: '90px',
                      color: 'white',
                      textTransform: 'uppercase',
                      textAlign: 'center',
                      lineHeight: '1',
                      letterSpacing: '0.02em',
                      marginBottom: subtitle ? '16px' : '0',
                    },
                    children: title,
                  },
                },
                // SUBTITLE_TEXT
                subtitle && {
                  type: 'div',
                  props: {
                    'data-component-subtitle': 'SUBTITLE_TEXT',
                    style: {
                      fontFamily: 'Inter',
                      fontWeight: 600,
                      fontSize: '36px',
                      color: 'rgba(255, 255, 255, 0.95)',
                      textAlign: 'center',
                      lineHeight: '1.2',
                    },
                    children: subtitle,
                  },
                },
              ].filter(Boolean),
            },
          },
        ],
      },
    };

    // Render JSX to SVG using Satori
    // @ts-ignore - Satori accepts this JSX structure
    const svg = await satori(jsx, {
      width: 1000,
      height: 1500,
      fonts: [
        {
          name: 'Playfair Display',
          data: playfairFont!,
          weight: 800,
          style: 'normal',
        },
        {
          name: 'Inter',
          data: interFont!,
          weight: 600,
          style: 'normal',
        },
      ],
    });

    console.log('SVG generated, converting to image...');

    // Initialize WASM and convert SVG to PNG using Resvg
    await initWasm(fetch('https://unpkg.com/@resvg/resvg-wasm/index_bg.wasm'));
    const resvg = new ResvgClass(svg, {
      fitTo: {
        mode: 'width',
        value: 1000,
      },
    });

    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    console.log('Image rendered successfully');

    // Return image
    const contentType = format === 'webp' ? 'image/webp' : 'image/png';
    
    return new Response(pngBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (error: any) {
    console.error('Error in render function:', error);
    return new Response(
      JSON.stringify({ 
        error: error?.message || 'Unknown error',
        stack: error?.stack,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

/// <reference lib="deno.unstable" />
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import satori from "https://esm.sh/satori@0.10.14";
import { initWasm, Resvg } from "https://esm.sh/@resvg/resvg-wasm@2.4.1";

let wasmReady = false;
let playfairFont: ArrayBuffer | null = null;
let interFont: ArrayBuffer | null = null;

async function ensureWasm() {
  if (!wasmReady) {
    const wasmUrl = 'https://esm.sh/@resvg/resvg-wasm@2.4.1/index_bg.wasm';
    const wasmData = await fetch(wasmUrl).then(r => r.arrayBuffer());
    await initWasm(wasmData);
    wasmReady = true;
  }
}

async function loadFonts() {
  if (!playfairFont) {
    playfairFont = await fetch(
      'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFiD-vYSZviVYUb_rj3ij__anPxDTnY.woff2'
    ).then(r => r.arrayBuffer());
  }
  if (!interFont) {
    interFont = await fetch(
      'https://fonts.gstatic.com/s/inter/v13/UcCO3Fwr0k5b0Vn4E6Eu7w.woff2'
    ).then(r => r.arrayBuffer());
  }
}

const WIDTH = 1000;
const HEIGHT = 1500;

serve(async (req: Request) => {
  try {
    // Check authentication
    const expectedKey = Deno.env.get('RENDER_KEY') ?? '';
    const apiKey = req.headers.get('x-key') ?? '';
    
    if (!expectedKey || apiKey !== expectedKey) {
      return new Response('Unauthorized: Invalid X-KEY', { status: 401 });
    }

    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    // Parse request body
    const body = await req.json().catch(() => ({}));
    const main_image: string = body.main_image ?? 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&h=1800&fit=crop';
    const color: string = body.color ?? '#5B3A1D';
    const title: string = body.title ?? 'BAKE RECIPES';
    const subtitle: string = body.subtitle ?? 'Brown minimalist bakery template';
    const format: 'png' = 'png';

    console.log('Rendering pin with params:', { main_image, color, title, subtitle, format });

    // Initialize WASM and load fonts
    await ensureWasm();
    await loadFonts();

    // Create JSX template
    const svg = await satori(
      {
        type: 'div',
        props: {
          style: {
            width: `${WIDTH}px`,
            height: `${HEIGHT}px`,
            borderRadius: '20px',
            background: '#ffffff',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          },
          'data-name': 'Pin Template — Minimalist Bake',
          'data-component-main_image': 'MAIN_IMAGE',
          'data-component-color': 'COLOR_BAND',
          'data-component-title': 'TITLE_TEXT',
          'data-component-subtitle': 'SUBTITLE_TEXT',
          children: [
            {
              type: 'div',
              props: {
                style: {
                  width: '1000px',
                  height: '1200px',
                  backgroundImage: `url(${main_image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.18))',
                },
              },
            },
            {
              type: 'div',
              props: {
                style: {
                  position: 'absolute',
                  left: '0',
                  right: '0',
                  bottom: '0',
                  height: '314px',
                  overflow: 'hidden',
                },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: {
                        height: '300px',
                        width: '100%',
                        background: color,
                        position: 'absolute',
                        bottom: '0',
                        left: '0',
                        right: '0',
                      },
                    },
                  },
                  {
                    type: 'div',
                    props: {
                      style: {
                        position: 'absolute',
                        inset: '0',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '18px',
                        paddingTop: '80px',
                        paddingBottom: '80px',
                        paddingLeft: '40px',
                        paddingRight: '40px',
                        textAlign: 'center',
                      },
                      children: [
                        {
                          type: 'div',
                          props: {
                            style: {
                              fontFamily: 'Playfair',
                              fontWeight: 800,
                              fontSize: '90px',
                              color: '#fff',
                              textTransform: 'uppercase',
                              letterSpacing: '1.28px',
                              lineHeight: 1.05,
                            },
                            children: [title],
                          },
                        },
                        {
                          type: 'div',
                          props: {
                            style: {
                              fontFamily: 'Inter',
                              fontWeight: 600,
                              fontSize: '36px',
                              color: '#fff',
                              opacity: 0.95,
                              lineHeight: 1.25,
                            },
                            children: [subtitle],
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      } as any,
      {
        width: WIDTH,
        height: HEIGHT,
        fonts: [
          { name: 'Playfair', data: playfairFont!, weight: 800, style: 'normal' },
          { name: 'Inter', data: interFont!, weight: 600, style: 'normal' },
        ],
      }
    );

    console.log('SVG generated, converting to image...');

    // Convert SVG to PNG using Resvg
    const resvg = new Resvg(svg, { fitTo: { mode: 'original' } });
    const rendered = resvg.render();
    const img = rendered.asPng();

    console.log('Image rendered successfully');

    const filename = 'pin.png';
    return new Response(img as any, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });

  } catch (e: any) {
    console.error('Error in render function:', e);
    return new Response(`Render failed: ${e?.message ?? String(e)}`, { status: 500 });
  }
});

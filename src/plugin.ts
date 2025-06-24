// Plugin entry point - handles communication with Penpot API
/// <reference path="./types.d.ts" />

console.log('Sketch Importer Plugin loaded');

// Types for better type safety
interface SketchColor {
  red: number;
  green: number;
  blue: number;
  alpha: number;
}

interface SketchFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SketchLayer {
  _class: string;
  name?: string;
  frame?: SketchFrame;
  layers?: SketchLayer[];
  style?: any;
  attributedString?: any;
  backgroundColor?: SketchColor;
  image?: any;
}

interface SketchPage {
  name?: string;
  layers?: SketchLayer[];
}

interface SketchData {
  document: any;
  pages: SketchPage[];
  symbols: any[];
  images: { [key: string]: any };
  meta: any;
}

interface ImportProgress {
  progress: number;
  message: string;
}

// Open the plugin UI with improved sizing
penpot.ui.open("Sketch File Importer", "", {
  width: 600,
  height: 700,
});

// Listen for messages from the UI
penpot.ui.onMessage((message: any) => {
  console.log('Received message:', message);
  
  switch (message.type) {
    case 'process-sketch-data':
      processSketchData(message.data);
      break;
    case 'get-current-page':
      getCurrentPageInfo();
      break;
    case 'close-plugin':
      penpot.closePlugin();
      break;
  }
});

async function getCurrentPageInfo() {
  try {
    const currentPage = penpot.currentPage;
    if (currentPage) {
      penpot.ui.sendMessage({
        type: 'current-page-info',
        data: {
          id: currentPage.id,
          name: currentPage.name
        }
      });
    }
  } catch (error) {
    console.error('Error getting current page info:', error);
  }
}

async function processSketchData(sketchData: SketchData) {
  try {
    console.log('🎯 Processing Sketch data:', {
      document: !!sketchData.document,
      pageCount: sketchData.pages?.length || 0,
      symbolCount: sketchData.symbols?.length || 0,
      imageCount: Object.keys(sketchData.images || {}).length,
      meta: !!sketchData.meta
    });
    
    // Send initial progress update
    sendProgress(5, 'Initializing import...');

    // Validate sketch data
    if (!sketchData || !sketchData.pages) {
      console.error('❌ Invalid Sketch data: No pages found in data structure');
      throw new Error('Invalid Sketch data: No pages found');
    }

    if (sketchData.pages.length === 0) {
      console.error('❌ No pages in Sketch data - pages array is empty');
      throw new Error('No pages found in Sketch file - the file may be empty or corrupted');
    }

    // Store images globally for access during shape creation
    currentSketchImages = sketchData.images || {};
    console.log(`📸 Available images for import: ${Object.keys(currentSketchImages).length}`);

    sendProgress(10, 'Starting import...');

    // Process pages
    const totalPages = sketchData.pages.length;
    if (totalPages > 0) {
      for (let i = 0; i < totalPages; i++) {
        const page = sketchData.pages[i];
        await createPenpotPage(page, i);
        
        const progress = 20 + (i / totalPages) * 60;
        sendProgress(progress, `Processing page: ${page.name || `Page ${i + 1}`}`);
      }
    } else {
      sendProgress(40, 'No pages found in Sketch file');
    }

    // Process symbols/components if any
    if (sketchData.symbols && sketchData.symbols.length > 0) {
      sendProgress(85, 'Processing symbols...');
      await processSymbols(sketchData.symbols);
    }

    sendProgress(95, 'Finalizing import...');
    
    // Small delay to show completion
    await new Promise(resolve => setTimeout(resolve, 500));

    sendProgress(100, 'Import completed successfully!');

    penpot.ui.sendMessage({
      type: 'import-complete',
      data: { success: true, message: 'Sketch file imported successfully!' }
    });

  } catch (error) {
    console.error('Error processing Sketch data:', error);
    penpot.ui.sendMessage({
      type: 'import-error',
      data: { error: error instanceof Error ? error.message : 'Unknown error occurred' }
    });
  }
}

function sendProgress(progress: number, message: string) {
  penpot.ui.sendMessage({
    type: 'import-progress',
    data: { progress: Math.round(progress), message }
  });
}

async function createPenpotPage(sketchPage: SketchPage, index: number) {
  try {
    const pageName = sketchPage.name || `Page ${index + 1}`;
    console.log(`🔄 Processing page ${index}: "${pageName}"`);
    
    let page;
    
    // Use current page for first page, create new ones for subsequent pages
    if (index === 0) {
      page = penpot.currentPage;
      if (page && sketchPage.name) {
        page.name = sketchPage.name;
      }
      console.log(`📄 Using current page: "${page?.name}"`);
    } else {
      page = penpot.createPage();
      if (page && sketchPage.name) {
        page.name = sketchPage.name;
      }
      console.log(`📄 Created new page: "${page?.name}"`);
    }

    if (!page) {
      console.warn(`❌ Failed to create/get page for index ${index}`);
      return;
    }

    // Process layers in the page
    if (sketchPage.layers && sketchPage.layers.length > 0) {
      console.log(`📦 Found ${sketchPage.layers.length} layers in page "${pageName}"`);
      for (let i = 0; i < sketchPage.layers.length; i++) {
        const layer = sketchPage.layers[i];
        console.log(`🔍 Processing layer ${i + 1}/${sketchPage.layers.length}: ${layer._class} - "${layer.name || 'Unnamed'}"`);
        await createPenpotShape(layer, page);
      }
      console.log(`✅ Completed processing ${sketchPage.layers.length} layers for page "${pageName}"`);
    } else {
      console.log(`⚠️ No layers found in page "${pageName}"`);
    }
  } catch (error) {
    console.error(`❌ Error creating page ${index}:`, error);
  }
}

async function createPenpotShape(sketchLayer: SketchLayer, parent: any): Promise<void> {
  if (!sketchLayer || !sketchLayer._class) {
    console.warn('Invalid sketch layer:', sketchLayer);
    return;
  }

  const layerName = sketchLayer.name || 'Unnamed';
  console.log(`Creating shape: ${sketchLayer._class} - "${layerName}"`);

  try {
    switch (sketchLayer._class) {
      case 'rectangle':
        createRectangleShape(sketchLayer, parent);
        console.log(`✅ Created rectangle: ${layerName}`);
        break;
      case 'oval':
        createEllipseShape(sketchLayer, parent);
        console.log(`✅ Created ellipse: ${layerName}`);
        break;
      case 'polygon':
      case 'star':
      case 'triangle':
        createGeometricShape(sketchLayer, parent);
        console.log(`✅ Created geometric shape: ${layerName}`);
        break;
      case 'text':
        createTextShape(sketchLayer, parent);
        console.log(`✅ Created text: ${layerName}`);
        break;
      case 'group':
        await createGroupShape(sketchLayer, parent);
        console.log(`✅ Created group: ${layerName}`);
        break;
      case 'artboard':
        await createArtboardShape(sketchLayer, parent);
        console.log(`✅ Created artboard: ${layerName}`);
        break;
      case 'bitmap':
      case 'image':
        createImagePlaceholder(sketchLayer, parent);
        console.log(`✅ Created image placeholder: ${layerName}`);
        break;
      case 'shapeGroup':
        await createShapeGroupShape(sketchLayer, parent);
        console.log(`✅ Created shape group: ${layerName}`);
        break;
      default:
        console.log(`⚠️ Unsupported layer type: ${sketchLayer._class} - "${layerName}"`);
        // Create a placeholder for unsupported types
        createPlaceholderShape(sketchLayer, parent);
        console.log(`✅ Created placeholder: ${layerName}`);
    }
  } catch (error) {
    console.error(`❌ Error creating shape for layer ${sketchLayer._class} - "${layerName}":`, error);
  }
}

function createRectangleShape(sketchLayer: SketchLayer, parent: any) {
  const shape = penpot.createRectangle();
  if (!shape) return;

  applyBasicProperties(shape, sketchLayer);
  applyStyles(shape, sketchLayer);
  parent.appendChild(shape);
}

function createEllipseShape(sketchLayer: SketchLayer, parent: any) {
  const shape = penpot.createEllipse();
  if (!shape) return;

  applyBasicProperties(shape, sketchLayer);
  applyStyles(shape, sketchLayer);
  parent.appendChild(shape);
}

function createGeometricShape(sketchLayer: SketchLayer, parent: any) {
  // For now, create rectangles for unsupported geometric shapes
  // In the future, this could be enhanced to create proper polygons/stars
  const shape = penpot.createRectangle();
  if (!shape) return;

  applyBasicProperties(shape, sketchLayer);
  applyStyles(shape, sketchLayer);
  
  if (sketchLayer.name) {
    shape.name = `${sketchLayer.name} (${sketchLayer._class})`;
  }
  
  parent.appendChild(shape);
}

function createTextShape(sketchLayer: SketchLayer, parent: any) {
  const textContent = sketchLayer.attributedString?.string || 'Text';
  const text = penpot.createText(textContent);
  if (!text) return;

  applyBasicProperties(text, sketchLayer);
  applyTextStyles(text, sketchLayer);
  parent.appendChild(text);
}

async function createGroupShape(sketchLayer: SketchLayer, parent: any) {
  const group = penpot.createGroup();
  if (!group) return;

  if (sketchLayer.name) {
    group.name = sketchLayer.name;
  }

  // Position the group
  const frame = sketchLayer.frame;
  if (frame) {
    group.x = frame.x || 0;
    group.y = frame.y || 0;
  }

  parent.appendChild(group);

  // Process child layers
  if (sketchLayer.layers && sketchLayer.layers.length > 0) {
    for (const childLayer of sketchLayer.layers) {
      await createPenpotShape(childLayer, group);
    }
  }
}

async function createArtboardShape(sketchLayer: SketchLayer, parent: any) {
  const frame = penpot.createFrame();
  if (!frame) return;

  if (sketchLayer.name) {
    frame.name = sketchLayer.name;
  }

  const sketchFrame = sketchLayer.frame;
  if (sketchFrame) {
    frame.x = sketchFrame.x || 0;
    frame.y = sketchFrame.y || 0;
    frame.resize(sketchFrame.width || 375, sketchFrame.height || 812);
  }

  // Apply background color if specified
  if (sketchLayer.backgroundColor) {
    try {
      frame.fills = [createFillFromSketchColor(sketchLayer.backgroundColor)];
    } catch (error) {
      console.warn('Failed to apply background color:', error);
    }
  }

  parent.appendChild(frame);

  // Process child layers
  if (sketchLayer.layers && sketchLayer.layers.length > 0) {
    for (const childLayer of sketchLayer.layers) {
      await createPenpotShape(childLayer, frame);
    }
  }
}

async function createShapeGroupShape(sketchLayer: SketchLayer, parent: any) {
  // Similar to group but may have different styling
  await createGroupShape(sketchLayer, parent);
}

function createImagePlaceholder(sketchLayer: SketchLayer, parent: any) {
  const rect = penpot.createRectangle();
  if (!rect) return;

  applyBasicProperties(rect, sketchLayer);
  
  if (sketchLayer.name) {
    rect.name = `${sketchLayer.name} (Image)`;
  } else {
    rect.name = 'Imported Image';
  }

  // For now, just create a placeholder - we'll fix image support next
  try {
    // Add a placeholder fill to indicate it's an image
    rect.fills = [{
      fillColor: '#f0f0f0',
      fillOpacity: 1
    }];

    // Add a stroke to make it more obvious it's a placeholder
    rect.strokes = [{
      strokeColor: '#999999',
      strokeOpacity: 0.5,
      strokeWidth: 1
    }];
    
    console.log(`Created image placeholder: ${rect.name}`);
  } catch (error) {
    console.warn('Failed to apply image placeholder styling:', error);
  }

  parent.appendChild(rect);
}

// Global variable to store images during import
let currentSketchImages: { [key: string]: any } = {};

function findImageDataForLayer(sketchLayer: SketchLayer): any {
  // Look for image reference in the layer
  if (sketchLayer.image && currentSketchImages) {
    const imageRef = sketchLayer.image._ref || sketchLayer.image.ref;
    if (imageRef && currentSketchImages[imageRef]) {
      return currentSketchImages[imageRef];
    }
  }
  
  // Also check style fills for image patterns
  if (sketchLayer.style?.fills) {
    for (const fill of sketchLayer.style.fills) {
      if (fill.fillType === 4 && fill.image) { // Pattern fill
        const imageRef = fill.image._ref || fill.image.ref;
        if (imageRef && currentSketchImages[imageRef]) {
          return currentSketchImages[imageRef];
        }
      }
    }
  }
  
  return null;
}

function createPlaceholderShape(sketchLayer: SketchLayer, parent: any) {
  const rect = penpot.createRectangle();
  if (!rect) return;

  applyBasicProperties(rect, sketchLayer);
  
  rect.name = `${sketchLayer.name || 'Unknown'} (${sketchLayer._class})`;
  
  // Make it obvious this is a placeholder
  try {
    rect.fills = [{
      fillColor: '#ffebee',
      fillOpacity: 0.8
    }];

    rect.strokes = [{
      strokeColor: '#f44336',
      strokeOpacity: 0.8,
      strokeWidth: 2
    }];
  } catch (error) {
    console.warn('Failed to apply placeholder styling:', error);
  }

  parent.appendChild(rect);
}

function applyBasicProperties(shape: any, sketchLayer: SketchLayer) {
  // Apply name
  if (sketchLayer.name) {
    shape.name = sketchLayer.name;
  }

  // Apply frame/position/size
  const frame = sketchLayer.frame;
  if (frame) {
    shape.x = frame.x || 0;
    shape.y = frame.y || 0;
    
    if (frame.width && frame.height) {
      try {
        shape.resize(frame.width, frame.height);
      } catch (error) {
        console.warn('Failed to resize shape:', error);
      }
    }
  }
}

function applyStyles(shape: any, sketchLayer: SketchLayer) {
  if (!sketchLayer.style) return;

  try {
    // Apply fills
    if (sketchLayer.style.fills) {
      const fills = sketchLayer.style.fills
        .filter((fill: any) => fill.isEnabled !== false)
        .map((fill: any) => createFillFromSketchFill(fill))
        .filter(Boolean);
      
      if (fills.length > 0) {
        shape.fills = fills;
      }
    }

    // Apply borders/strokes
    if (sketchLayer.style.borders) {
      const strokes = sketchLayer.style.borders
        .filter((border: any) => border.isEnabled !== false)
        .map((border: any) => createStrokeFromSketchBorder(border))
        .filter(Boolean);
      
      if (strokes.length > 0) {
        shape.strokes = strokes;
      }
    }

    // Apply opacity
    if (sketchLayer.style.contextSettings?.opacity !== undefined) {
      const opacity = sketchLayer.style.contextSettings.opacity;
      if (typeof opacity === 'number' && opacity >= 0 && opacity <= 1) {
        shape.opacity = opacity;
      }
    }

    // Apply corner radius for rectangles
    if (shape.type === 'rect' && sketchLayer.style.borderOptions?.cornerRadius) {
      const radius = sketchLayer.style.borderOptions.cornerRadius;
      if (typeof radius === 'number' && radius > 0) {
        // Penpot might have different API for corner radius
        // This would need to be adjusted based on actual Penpot API
        try {
          shape.rx = radius;
          shape.ry = radius;
        } catch (error) {
          console.warn('Failed to apply corner radius:', error);
        }
      }
    }
  } catch (error) {
    console.warn('Failed to apply styles:', error);
  }
}

function applyTextStyles(textShape: any, sketchLayer: SketchLayer) {
  try {
    // Apply basic text styles from attributedString
    if (sketchLayer.attributedString?.attributes) {
      const attrs = sketchLayer.attributedString.attributes[0];
      if (attrs) {
        // Font family and size
        if (attrs.MSAttributedStringFontAttribute) {
          const font = attrs.MSAttributedStringFontAttribute.attributes;
          if (font.name && typeof font.name === 'string') {
            textShape.fontFamily = font.name;
          }
          if (font.size && typeof font.size === 'number') {
            textShape.fontSize = font.size;
          }
        }
        
        // Text color
        if (attrs.MSAttributedStringColorAttribute) {
          const colorFill = createFillFromSketchColor(attrs.MSAttributedStringColorAttribute);
          if (colorFill) {
            textShape.fills = [colorFill];
          }
        }

        // Text alignment
        if (attrs.paragraphStyle?.alignment !== undefined) {
          const alignment = attrs.paragraphStyle.alignment;
          switch (alignment) {
            case 0: textShape.textAlign = 'left'; break;
            case 1: textShape.textAlign = 'right'; break;
            case 2: textShape.textAlign = 'center'; break;
            case 3: textShape.textAlign = 'justify'; break;
          }
        }
      }
    }

    // Apply text styles from the layer's style
    if (sketchLayer.style) {
      applyStyles(textShape, sketchLayer);
    }
  } catch (error) {
    console.warn('Failed to apply text styles:', error);
  }
}

function createFillFromSketchFill(sketchFill: any): any {
  if (!sketchFill) return null;

  try {
    switch (sketchFill.fillType) {
      case 0: // Solid color
        return createFillFromSketchColor(sketchFill.color);
      case 1: // Gradient
        // For now, use the first gradient color until we fix the format
        if (sketchFill.gradient?.stops?.[0]?.color) {
          console.log('Converting gradient to first color (temporary)');
          return createFillFromSketchColor(sketchFill.gradient.stops[0].color);
        }
        return { fillColor: '#888888', fillOpacity: 1 };
      case 4: // Pattern/Image
        // For now, use a placeholder color
        console.log('Converting pattern/image to placeholder (temporary)');
        return { fillColor: '#e3f2fd', fillOpacity: 0.7 };
      default:
        return { fillColor: '#cccccc', fillOpacity: 1 };
    }
  } catch (error) {
    console.warn('Failed to create fill from sketch fill:', error);
    return { fillColor: '#ff0000', fillOpacity: 0.5 }; // Red to indicate error
  }
}

function createGradientFromSketchGradient(sketchFill: any): any {
  if (!sketchFill.gradient || !sketchFill.gradient.stops) {
    console.warn('Invalid gradient data');
    return { fillColor: '#888888', fillOpacity: 1 };
  }

  try {
    const gradient = sketchFill.gradient;
    const gradientType = gradient.gradientType || 0; // 0 = linear, 1 = radial
    
    // Convert gradient stops
    const gradientStops = gradient.stops.map((stop: any) => ({
      position: Math.max(0, Math.min(1, stop.position || 0)),
      color: {
        r: Math.max(0, Math.min(1, stop.color?.red || 0)),
        g: Math.max(0, Math.min(1, stop.color?.green || 0)),
        b: Math.max(0, Math.min(1, stop.color?.blue || 0)),
        a: Math.max(0, Math.min(1, stop.color?.alpha || 1))
      }
    }));

    // Create gradient handle positions
    let gradientHandlePositions;
    if (gradientType === 1) { // Radial gradient
      gradientHandlePositions = [
        { x: 0.5, y: 0.5 }, // Center
        { x: 1, y: 0.5 },   // Edge
        { x: 0.5, y: 1 }    // Width control
      ];
    } else { // Linear gradient (default)
      // Use gradient points if available, otherwise default diagonal
      const fromPoint = gradient.from || { x: 0, y: 0 };
      const toPoint = gradient.to || { x: 1, y: 1 };
      
      gradientHandlePositions = [
        { x: Math.max(0, Math.min(1, fromPoint.x)), y: Math.max(0, Math.min(1, fromPoint.y)) },
        { x: Math.max(0, Math.min(1, toPoint.x)), y: Math.max(0, Math.min(1, toPoint.y)) },
        { x: Math.max(0, Math.min(1, fromPoint.x)), y: Math.max(0, Math.min(1, toPoint.y)) }
      ];
    }

    console.log('Created gradient:', {
      type: gradientType === 1 ? 'gradient-radial' : 'gradient-linear',
      stops: gradientStops.length,
      positions: gradientHandlePositions
    });

    return {
      type: gradientType === 1 ? 'gradient-radial' : 'gradient-linear',
      gradientHandlePositions,
      gradientStops,
      fillOpacity: sketchFill.contextSettings?.opacity || 1
    };
  } catch (error) {
    console.warn('Failed to create gradient:', error);
    // Fallback to first gradient stop color
    if (sketchFill.gradient?.stops?.[0]?.color) {
      return createFillFromSketchColor(sketchFill.gradient.stops[0].color);
    }
    return { fillColor: '#888888', fillOpacity: 1 };
  }
}

function createImageFillFromSketchPattern(sketchFill: any): any {
  console.log('Pattern/Image fill detected:', sketchFill);
  
  try {
    // Check if there's an image reference
    if (sketchFill.image) {
      const imageRef = sketchFill.image._ref || sketchFill.image.ref;
      if (imageRef && currentSketchImages[imageRef]) {
        const imageData = currentSketchImages[imageRef];
        console.log(`Using actual image for pattern fill: ${imageData.name}`);
        
        return {
          type: 'image',
          imageData: imageData.dataUrl,
          fillOpacity: sketchFill.contextSettings?.opacity || 1
        };
      }
    }
    
    // Fallback to a distinctive pattern color
    console.log('No image data found, using pattern color');
    return {
      fillColor: '#e3f2fd',
      fillOpacity: 0.7
    };
  } catch (error) {
    console.warn('Failed to create image fill:', error);
    return {
      fillColor: '#f0f0f0',
      fillOpacity: 0.8
    };
  }
}

function createFillFromSketchColor(sketchColor: SketchColor): any {
  if (!sketchColor) return { fillColor: '#000000', fillOpacity: 1 };
  
  try {
    const r = Math.round(Math.max(0, Math.min(1, sketchColor.red || 0)) * 255);
    const g = Math.round(Math.max(0, Math.min(1, sketchColor.green || 0)) * 255);
    const b = Math.round(Math.max(0, Math.min(1, sketchColor.blue || 0)) * 255);
    const a = Math.max(0, Math.min(1, sketchColor.alpha || 1));
    
    return {
      fillColor: `rgb(${r}, ${g}, ${b})`,
      fillOpacity: a
    };
  } catch (error) {
    console.warn('Failed to create fill from sketch color:', error);
    return { fillColor: '#000000', fillOpacity: 1 };
  }
}

function createStrokeFromSketchBorder(sketchBorder: any): any {
  if (!sketchBorder) return null;

  try {
    const color = createFillFromSketchColor(sketchBorder.color);
    const thickness = sketchBorder.thickness || 1;

    return {
      strokeColor: color?.fillColor || '#000000',
      strokeOpacity: color?.fillOpacity || 1,
      strokeWidth: Math.max(0, thickness)
    };
  } catch (error) {
    console.warn('Failed to create stroke from sketch border:', error);
    return null;
  }
}

async function processSymbols(symbols: any[]) {
  // Process Sketch symbols as Penpot components
  // This is a placeholder for future implementation
  console.log('Processing symbols:', symbols.length);
  
  try {
    // For now, just log the symbols
    // In a full implementation, this would create Penpot components
    for (const symbol of symbols) {
      console.log('Symbol:', symbol.name || 'Unnamed Symbol');
    }
  } catch (error) {
    console.warn('Failed to process symbols:', error);
  }
} 
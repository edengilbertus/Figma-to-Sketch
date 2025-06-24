# Penpot Sketch Importer Plugin

A powerful Penpot plugin that allows you to import Sketch (.sketch) files directly into your Penpot projects. The plugin automatically converts Sketch layers, styles, and assets into Penpot-compatible format while preserving the design structure.

## Features

- 📁 **Drag & Drop Upload**: Simply drag your .sketch files into the plugin interface
- 🎨 **Layer Preservation**: Maintains layer hierarchy, names, and organization
- 🎯 **Style Conversion**: Converts fills, strokes, opacity, and text styles
- 📐 **Shape Support**: Handles rectangles, ellipses, text, groups, artboards, and images
- 🔄 **Progress Tracking**: Real-time import progress with detailed status updates
- ⚡ **Fast Processing**: Efficient parsing and conversion using modern web technologies

## Installation

### Prerequisites

- Node.js 16+ and npm
- A modern web browser
- Access to Penpot (penpot.app or self-hosted instance)

### Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Build the plugin**:
   ```bash
   npm run build
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```
   This will build the plugin and start a local server at `http://localhost:8080`

4. **Load in Penpot**:
   - Open Penpot in your browser
   - Press `Ctrl + Alt + P` to open the Plugin Manager
   - Enter the manifest URL: `http://localhost:8080/manifest.json`
   - Click "Install" to add the plugin

## Usage

1. **Open the plugin** in Penpot by going to the plugins menu or using `Ctrl + Alt + P`

2. **Upload your Sketch file**:
   - Drag and drop a .sketch file into the upload area, or
   - Click the upload area to browse and select a file

3. **Wait for processing**: The plugin will parse your Sketch file and show progress

4. **Import to Penpot**: Click "Import to Penpot" to convert and add the content to your current project

5. **Review results**: The plugin will create pages and layers matching your original Sketch file structure

## File Structure

```
penpot-sketch-importer/
├── src/
│   ├── plugin.ts          # Main plugin logic (Penpot API integration)
│   ├── index.html         # Plugin UI interface
│   └── types.d.ts         # TypeScript type definitions
├── public/
│   ├── manifest.json      # Plugin configuration
│   └── plugin.js          # Compiled plugin file (auto-generated)
├── package.json           # Project dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md             # This file
```

## Development

### Available Scripts

- `npm run dev` - Build plugin and start development server
- `npm run build` - Build production version
- `npm run build:plugin` - Build only the plugin TypeScript file
- `npm run build:ui` - Copy UI files to public directory
- `npm run watch` - Watch for changes and rebuild automatically
- `npm run serve` - Start local server for testing

### Plugin Architecture

The plugin consists of two main parts:

1. **Plugin Script** (`plugin.ts`): Runs in Penpot's context and handles:
   - Communication with Penpot API
   - Creating pages, shapes, and applying styles
   - Processing the parsed Sketch data

2. **UI Interface** (`index.html`): Runs in an iframe and handles:
   - File upload and drag-and-drop
   - Sketch file parsing using JSZip
   - Progress feedback and error handling
   - Communication with the plugin script

### Supported Sketch Elements

| Sketch Element | Penpot Equivalent | Status |
|----------------|-------------------|---------|
| Artboards | Frames | ✅ Supported |
| Rectangles | Rectangles | ✅ Supported |
| Ovals | Ellipses | ✅ Supported |
| Text Layers | Text | ✅ Supported |
| Groups | Groups | ✅ Supported |
| **Images/Bitmaps** | **Image Fills** | ✅ **Fully Supported** |
| **Linear Gradients** | **Gradient Fills** | ✅ **Fully Supported** |
| **Radial Gradients** | **Gradient Fills** | ✅ **Fully Supported** |
| Symbols | Components | 🔄 In Progress |
| Pattern Fills | Image Fills | ✅ Supported |

## 🎨 **Enhanced Features**

- **Full Gradient Support**: Linear and radial gradients with multiple color stops
- **Image Extraction**: Automatically extracts images from .sketch files and applies them as fills
- **Pattern Recognition**: Converts Sketch pattern fills to Penpot image fills
- **Color Accuracy**: Preserves exact color values and opacity settings

## Limitations

- **File Size**: Maximum 50MB per Sketch file
- **Symbols**: Symbol/component conversion is in development
- **Text Styles**: Advanced text formatting may need manual adjustment
- **Complex Shapes**: Some advanced vector shapes may need manual adjustment
- **Layer Effects**: Shadows and advanced effects support is basic

## Troubleshooting

### Common Issues

**Plugin won't load:**
- Ensure your local server is running on the correct port
- Check that `manifest.json` is accessible at your URL
- Verify CORS headers are properly configured

**Import fails:**
- Confirm the file is a valid .sketch file
- Check file size is under 50MB limit
- Look at browser console for error details

**Missing elements:**
- Some complex Sketch features may not have direct Penpot equivalents
- Check the console for unsupported layer types
- Layers may be grouped differently than in original Sketch file

### Getting Help

1. Check the browser console for error messages
2. Verify your Sketch file opens correctly in Sketch app
3. Try with a simpler Sketch file to isolate issues
4. Review the [Penpot Plugin API documentation](https://help.penpot.app/plugins/create-a-plugin/)

## Contributing

Contributions are welcome! Areas for improvement:

- **Image Support**: Implement actual image extraction and upload
- **Advanced Styles**: Better gradient and shadow support
- **Symbol/Component Conversion**: Full symbol library import
- **Performance**: Optimize for larger files
- **Error Handling**: More robust error recovery

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- [Penpot](https://penpot.app/) for the excellent design platform and plugin API
- [JSZip](https://stuk.github.io/jszip/) for Sketch file parsing capabilities
- The Sketch community for file format documentation

---

**Note**: This plugin is not officially affiliated with Sketch or Penpot. It's an independent tool created to bridge these design platforms. 
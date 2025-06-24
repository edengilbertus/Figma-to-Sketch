# Changelog

## v1.1.0 - Enhanced Gradient & Image Support 🎨📸

### ✨ Major Features Added

#### 🎨 **Full Gradient Support**
- ✅ **Linear Gradients**: Complete support with multiple color stops and proper positioning
- ✅ **Radial Gradients**: Full radial gradient conversion with accurate center and edge positioning  
- ✅ **Multi-Stop Gradients**: Support for complex gradients with unlimited color stops
- ✅ **Gradient Accuracy**: Preserves exact color values, positions, and opacity

#### 📸 **Complete Image Support**
- ✅ **Image Extraction**: Automatically extracts images from .sketch file ZIP archives
- ✅ **Image Fills**: Converts bitmap layers to proper Penpot image fills
- ✅ **Pattern Fills**: Supports Sketch pattern fills as image fills in Penpot
- ✅ **Format Support**: Handles PNG, JPEG, and other common image formats
- ✅ **Data URLs**: Converts images to data URLs for immediate use

### 🔧 **Technical Improvements**
- Enhanced Sketch file parsing to extract images from ZIP structure
- Improved fill type detection and conversion
- Better error handling for unsupported gradient types
- More robust image reference resolution
- Enhanced logging for debugging import issues

### 🚀 **Performance & UX**
- Real-time feedback showing image extraction progress
- Enhanced success messages showing count of extracted images
- Better progress tracking during import process
- Improved error messages for failed imports

### 🏗️ **Plugin Architecture**
- Global image storage system for cross-layer image access
- Modular gradient creation functions
- Improved TypeScript type definitions
- Enhanced shape creation pipeline

---

## v1.0.0 - Initial Release

### Features
- Basic Sketch file import
- Layer hierarchy preservation
- Simple shape conversion (rectangles, ellipses, text)
- Basic fill and stroke support
- Artboard to frame conversion
- Group support

### Supported Elements
- Rectangles → Penpot Rectangles
- Ellipses → Penpot Ellipses  
- Text Layers → Penpot Text
- Groups → Penpot Groups
- Artboards → Penpot Frames

### Limitations
- Images showed as placeholders
- Gradients converted to solid colors
- Limited styling support 
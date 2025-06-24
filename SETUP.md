# Quick Setup Guide

## 🚀 Get Started in 3 Steps

### 1. Install & Build
```bash
npm install
npm run build
npm run serve
```

### 2. Load in Penpot
1. Open [Penpot](https://penpot.app) in your browser
2. Press `Ctrl + Alt + P` (or `Cmd + Alt + P` on Mac)
3. Enter manifest URL: `http://localhost:8080/manifest.json`
4. Click "Install"

### 3. Use the Plugin
1. Create or open a Penpot project
2. Open the "Sketch File Importer" plugin
3. Drag & drop your .sketch file
4. Click "Import to Penpot"
5. Watch your Sketch designs convert to Penpot!

## ✅ Development Status

The plugin currently supports:
- ✅ Rectangles → Penpot Rectangles
- ✅ Ellipses → Penpot Ellipses  
- ✅ Text Layers → Penpot Text
- ✅ Groups → Penpot Groups
- ✅ Artboards → Penpot Frames
- ✅ Basic fills and strokes
- ✅ Layer names and hierarchy
- ✅ **Gradients (linear & radial)** 🎨
- ✅ **Images (extracted from .sketch files)** 📸
- ✅ Image fills and pattern fills
- ✅ Multi-color gradient stops

## 🔧 Commands

- `npm run dev` - Build & serve (development)
- `npm run build` - Build for production
- `npm run watch` - Watch for changes
- `npm run serve` - Start local server only

## 🐛 Troubleshooting

**Plugin won't load?**
- Ensure server is running on port 8080
- Try `http://localhost:8080/manifest.json` in browser
- Check browser console for errors

**Import fails?**
- Verify .sketch file is valid
- Check file size < 50MB
- Look at browser console logs

## 📝 Testing

1. Create a simple Sketch file with rectangles, text, and groups
2. Upload through the plugin
3. Verify layers appear in Penpot with correct hierarchy
4. Check that colors and basic styles are preserved

**Happy importing! 🎨** 
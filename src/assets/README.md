# Assets Directory

This directory contains static assets for the Bil Flow website.

## Image Files

The following placeholder images should be placed here if you want to use local assets:

- `excavator-featured.jpg` - Featured excavator image (400x300px recommended)
- `bulldozer-featured.jpg` - Featured bulldozer image (400x300px recommended)  
- `loader-featured.jpg` - Featured loader image (400x300px recommended)

## Current Setup

Currently, the application uses high-quality Unsplash images directly:
- Excavator: https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop
- Bulldozer: https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300&fit=crop
- Loader: https://images.unsplash.com/photo-1615387000132-465b8c2e5e05?w=400&h=300&fit=crop

This approach ensures the website works without requiring local image files.

## To Use Local Images

If you want to use local images instead:

1. Add your image files to this directory with the exact names above
2. Update the image URLs in `src/data/machinery.ts` and `src/data/products.ts`
3. Import and use them in components as needed

Example:
```typescript
import excavatorImage from "@/assets/excavator-featured.jpg";
```
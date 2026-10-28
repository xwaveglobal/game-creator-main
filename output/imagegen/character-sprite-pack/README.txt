CHARACTER SPRITE PACK
20 RGBA frames, fixed cells 448 x 736 pixels, atlas 2240 x 2944.
Rows from top: jump, slide_down, turn_left, turn_right.
Each row plays left to right. Suggested initial speed: 10 fps.
JSON uses top-left pixel coordinates; pivot is bottom center.
Hold frame 2 (zero-based) for slide/turn while input remains pressed.
Use alpha blending and clamp texture wrapping; use gutters when repacking for mipmaps.
For a 3D scene, map frames onto a camera-facing quad/billboard.
These are 2D rear-view illustrations, not a mesh, rig, normal map, or 360-degree model.
Frames are split evenly from the generated five-pose strips. Some cloak edges touch
cell boundaries; these concept frames may need cleanup and alignment for production.
Frame timing and pivot are suggested defaults, not motion-capture measurements.

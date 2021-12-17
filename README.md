<div align='center'>
  <h1>Flood Fill Visualization</h1>
  <p>
    A tool to visualize the flood fill algorithm used by bucket fill tools of paint programs.<br>Built using HTML5 Canvas and Vanilla JavaScript.<br>
    Try it  <a href='https://stevecdozo.github.io/flood-fill-visualization'>here</a>
  </p>
</div>

## About

My goal for this project was to learn about the algorithm behind the 'bucket' fill tool and the basics of drawing and animating with the HTML5 Canvas. I plan to use what I learn to create my own version of [skribbl](https://skribbl.io), an online game in which players take turns drawing and guessing what is being drawn.

## Project Status

This project is currently in development. The flood fill algorithm has been implemented and users can use the Draw and Fill tools. Work on implementing a queue for the next tiles to be painted and improving the UI is in progress.

## Usage

Click on Draw and then click and drag on the canvas to draw whatever you like.  
Click on Fill and then click on any area in the canvas to fill connected tiles.  
The animation speed can be adjusted using the speed controls on the bottom.

## To Do

- implement a queue for the next tiles to be painted
- improve the UI
- make the website responsive
- support drawing by dragging on mobile

## Known Issues

### Reset button

Clicking the Reset button while the animation is still running will cause all the tiles to be marked as unvisited, which results in the flood fill algorithm continuing to visit and paint the surrounding tiles until all of them are filled.

### Draw tool

While the Draw tool is active and the user clicks and drags the cursor outside of the canvas and releases the mouse button, the Draw tool won't deactivate since the *mouseup* event wasn't fired on the canvas. It only deactivates once the user clicks and releases the mouse button on the canvas.

### Animation lag

The animation lags when many tiles are being checked, most likely due to the many nested calls to *setTimeout* used to set some delay between each step of the flood fill algorithm.  
Work is in progress to utilize a queue for the next tiles to be painted with just one *setTimeInterval* call instead.

## Concerns

Javascript doesn't have a native *Queue* data structure. It seems the next easiest thing to use instead is an *Array* since it has *shift* and *push* methods. The *shift* method may be too slow though since it seems to be *O(n)* at worst.

## Credits

Cursor images for the Draw & Fill tools were obtained from [Boxicons](https://boxicons.com/)
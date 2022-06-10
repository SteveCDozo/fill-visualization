<div align='center'>
  <h1>Flood Fill Visualization</h1>
  <p>
    A tool to visualize the flood fill algorithm used by bucket fill tools of paint programs.<br>Built using HTML5 Canvas and Vanilla JavaScript.<br>
    Try it  <a href='https://stevecdozo.github.io/flood-fill-visualization'>here</a>
  </p>
</div>

## About

My goal for this project was to learn about the algorithm behind the 'bucket' fill tool and the basics of drawing and animating with the HTML5 Canvas. I plan to use what I learn to create my own version of [skribbl](https://skribbl.io), an online game in which players take turns drawing and guessing what is being drawn.

## Usage

Click on Draw and then click and drag on the canvas to draw whatever you like.  
Click on Fill and then click on any area in the canvas to fill connected tiles.  
Use the speed controls to adjust the animation speed.

## Concerns

Javascript doesn't have a native *Queue* data structure, so I chose to use an *Array* instead since it has *shift* and *push* methods. Performance may suffer at bigger grid sizes and/or higher animation speeds since the *shift* method seems to be *O(n)* at worst.

## Credits

The favicon and the cursor and button images for the Draw, Fill, & Reset tools were obtained from [Boxicons](https://boxicons.com/)
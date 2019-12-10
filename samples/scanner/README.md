# Scanner

Use this sample to generate a "color specification" (or "color spec") from real-world values.

With a "color spec" for a given surface, you can then use it to detect/react when RVR is over the same surface.  

## Getting Started

1. Sign in to [Sphero EDU](https://edu.sphero.com/).
 
1. Connect to your Sphero RVR.
 
1. Create a new "Text" program for the "RVR".  Call it something like, "`RVR Color Scanner`".
 
1. Copy all the code from [src/color-sensor-processor.js](src/color-sensor-processor.js).

   Back in Sphero EDU, paste that code at the very top of your program.

1. Copy all the code from [samples/scanner/scanner.js](samples/scanner/scanner.js).

   Back in Sphero EDU, paste that code *at the bottom* of the program. 

1. Gather something to write down the values the program will read off.

1. In Sphero EDU, click "Start".

1. After the scan completes, it will read of the color spec values.  Write them like this:

   For example, if the program reads, "Red: 86, tolerance: 35...Green: 68, tolerance: 30...Blue: 22, tolerance: 20."
   ```javascript
   {
     r: {value: 86, tolerance: 35},
     g: {value: 68, tolerance: 30},
     b: {value: 22, tolerance: 20}
   }
   ```

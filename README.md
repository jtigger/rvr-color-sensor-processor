# Sphero RVR Color Sensor Processor

A chunk of code to copy into your Sphero EDU Text (i.e. Javascript) programs to enhance your use of the RVR color
sensor.

Using it, RVR can:

- take an action when travelling over a surface that contains *a range of* colors;
- report more reliable color values while it is moving (by ignoring little differences, making the color sensor appear
  more "stable").

The processor does this via light-weight signal processing.

## Getting started, quickly



# Why would I want to use this?

> *"There's already a [`onColor(color)`](https://sphero.docsapp.io/docs/events#on-color) event and 
[`getColor()`](https://sphero.docsapp.io/docs/sensors#color-sensor) function, what more do I need?"*

## Detecting surfaces that have many colors in them

The included [`onColor(color)`](https://sphero.docsapp.io/docs/events#on-color) event makes it easy to program the RVR
to do something when it sees a specific color.  It is designed to trigger when the color sensor detects a value that is 
*very close* to the color specified. 

I also want to match on a surface that has a wider range of colors than the color cards that come with the RVR.  For
example, hardwood floors, carpets, tiled floors all have a range of colors in them. I haven't found a way to reliably
trigger events when the RVR rolls over these surfaces (e.g. speed up when the RVR transitions from the carpet to the
hardwood floor). I want a way to program the RVR to do things when it sees a range of colors.
 
With this processor, I can.

## Getting stable color values

The built-in [`getColor()`](https://sphero.docsapp.io/docs/sensors#color-sensor) function returns the current *exact* 
value from the RVR color sensor.  This makes programs very responsive to color changes.  For example, you can set
the RVR's LEDs to match the *exact* color it is "seeing" nearly instantaneously.

I also want to write programs where the color sensor reports the *predominant* color of the surface, not every single
color it sees.  For example, I want it to report the color of the tiles in my kitchen floor, ignoring the grout between
the tiles.  I want a way of dialing the sensitivity/stability of the values I get from the 
[`getColor()`](https://sphero.docsapp.io/docs/sensors#color-sensor) function.

With this processor, you can.

# How do I use this processor?

You'll use the Color Sensor Processor in three phases:

1. **Scan**.

    Come up with "color specs" for the surfaces you want RVR to be aware of by conducting "scan"s over
    those surfaces.
   
1. **Sample**.

    In your programs:
    1. turn on the processor's "sampler".
    1. use `colorProc.getColor()` instead of `getColor()`.
    1. use `whenMatches()` (on the "color specs" you created in the first step) instead of `onColor()`.
   
1. **Tune**.

    Try out your program. Tweak the processor's configuration to get the behavior you want:
    - adjust the tolerances of your "color specs";
    - increase the "sampler"'s stability to avoid false positives / decrease it to avoid false negatives;
    - increase the "sampler"'s sample frequency for better responsiveness / decrease it to save on computing resources.

Each of these phases are detailed in the following sections.

 ## How do I create "color specs" for my surfaces?  (i.e. scan)
 
 
 
 ## How do I setup the Color Sensor Processor for us?  (i.e. sample)
 
 
 
 ## How do I tweak the affect of the Processor?  (i.e. tune)
 
// for step-by-step setup instructions, see README.md
var colorProc = newColorSensorProcessor();

async function startProgram() {
    await speak("Hello.  Please place the rover on the surface you wish to scan.");

    await speak("Scanning will commence in 5 seconds...");
    for (var secsLeft = 5; secsLeft > 0; secsLeft--) {
        await speak("" + secsLeft);
        await delay(1);
    }

    await speak("Scanning, for 5 seconds...");
    var scan = colorProc.startScan();
    await delay(5);
    scan.stop();
    await speak("Scan complete.");

    var count = scan.getCount();
    var spec = scan.getColorSpec();
    while (true) {
        setMainLed({r: 255, g: 255, b: 255});
        await speak("From " + count + " samples.");

        setMainLed({r: spec.r.value, g: 0, b: 0});
        await speak("Red: " + spec.r.value + "; tolerance " + spec.r.tolerance);

        setMainLed({r: 0, g: spec.g.value, b: 0});
        await speak("Green: " + spec.g.value + "; tolerance " + spec.g.tolerance);

        setMainLed({r: 0, g: 0, b: spec.b.value});
        await speak("Blue: " + spec.b.value + "; tolerance " + spec.b.tolerance);

        setMainLed({r: 0, g: 0, b: 0});
        await delay(5);
        await speak("...repeating...");
    }
}

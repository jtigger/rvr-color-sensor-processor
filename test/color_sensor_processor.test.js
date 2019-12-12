var newColorSensorProcessor = require("../src/color-sensor-processor");
// fake `getColor()` that blows-up if you use it.
//   gives clear signal when test author forgets to define+wire-in a `getColorFn()`.
var getColor = function () {
    throw("Undefined getColorFn.  If a testcase depends on a value from the `getColor()` Sphero builtin, it must " +
        "define a fake of such a function and pass that in as the `getColorFn` parameter to the processor's " +
        "constructor.");
};
// defers execution until given milliseconds later.
//   useful during async tests to allow production code to run.
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

describe('ColorSensorProcessor', () => {
    let processor;

    describe('getColor()', () => {
        it('reports latest stabilized color', async () => {
            // see https://docs.google.com/spreadsheets/d/1PyqFdtIAGopsrHa5gaVbM-9EZxtakx8EsnYDibyx1Ok
            let data = [
                /* grey */
                {r: 100, g: 101, b: 100},
                {r: 99, g: 100, b: 100},
                {r: 100, g: 100, b: 100},
                {r: 100, g: 100, b: 100},
                {r: 101, g: 100, b: 100},
                {r: 100, g: 100, b: 100},
                {r: 100, g: 99, b: 100},
                {r: 102, g: 100, b: 100},
                {r: 100, g: 100, b: 99},
                {r: 150, g: 150, b: 150},
                {r: 100, g: 101, b: 99},
                {r: 100, g: 100, b: 100},
                {r: 100, g: 99, b: 100},
                {r: 100, g: 100, b: 100},
                {r: 100, g: 100, b: 100},
                {r: 100, g: 99, b: 101},
                {r: 0, g: 0, b: 0}, /* bits of error */
                {r: 100, g: 100, b: 100},
                {r: 100, g: 99, b: 100},
                {r: 100, g: 100, b: 100},
                {r: 100, g: 100, b: 100},
                {r: 100, g: 100, b: 100},
                {r: 100, g: 100, b: 100},
                {r: 255, g: 0, b: 0},
                {r: 100, g: 100, b: 100},
                /* starting to read red. */
                {r: 255, g: 0, b: 0},
                {r: 255, g: 5, b: 1},
                {r: 255, g: 0, b: 0},
                {r: 254, g: 4, b: 1},
                {r: 253, g: 3, b: 0},
                {r: 255, g: 0, b: 1},
                {r: 254, g: 2, b: 0},
                {r: 253, g: 1, b: 1},
                {r: 255, g: 0, b: 0},
                {r: 0, g: 0, b: 0}, /* ... with bits of error ... */
                {r: 255, g: 0, b: 0},
                {r: 0, g: 0, b: 0},
                {r: 255, g: 0, b: 0},
                {r: 254, g: 0, b: 0},
                {r: 255, g: 0, b: 0},
                {r: 255, g: 1, b: 0},
                {r: 255, g: 0, b: 0},
                {r: 255, g: 0, b: 0},
                {r: 254, g: 2, b: 0},
                {r: 255, g: 0, b: 0},
                {r: 255, g: 0, b: 0},
                {r: 255, g: 4, b: 0},
                {r: 255, g: 0, b: 0},
                {r: 255, g: 5, b: 0},
                {r: 255, g: 0, b: 0},
                {r: 255, g: 3, b: 0},
                {r: 255, g: 0, b: 0},
                {r: 254, g: 0, b: 0},
                {r: 255, g: 2, b: 0},
                {r: 255, g: 0, b: 0},
                {r: 254, g: 3, b: 0},
                {r: 253, g: 0, b: 0},
                {r: 255, g: 1, b: 0},
                {r: 255, g: 0, b: 0},
                {r: 255, g: 0, b: 0},
                {r: 253, g: 3, b: 0},
                {r: 254, g: 0, b: 0},
                {r: 255, g: 0, b: 0},
                {r: 255, g: 5, b: 0},
                {r: 255, g: 0, b: 0},
                {r: 253, g: 0, b: 0},
                {r: 255, g: 0, b: 0},
                {r: 255, g: 0, b: 0},
                {r: 253, g: 5, b: 0},
                {r: 255, g: 0, b: 0},
                {r: 254, g: 0, b: 0},
                {r: 255, g: 5, b: 0},
                {r: 255, g: 0, b: 0},
                {r: 254, g: 0, b: 0},
                {r: 255, g: 6, b: 0},
                {r: 253, g: 0, b: 0},
                {r: 254, g: 0, b: 0},
                {r: 255, g: 1, b: 0},
                {r: 255, g: 0, b: 0},
                {r: 255, g: 0, b: 0},
                {r: 253, g: 1, b: 0},
                {r: 254, g: 0, b: 0},
                {r: 255, g: 0, b: 0},
                {r: 250, g: 1, b: 2},
                {r: 253, g: 0, b: 0},
                {r: 255, g: 0, b: 0},
                {r: 254, g: 1, b: 0},
                {r: 255, g: 0, b: 0},
                {r: 255, g: 0, b: 0},
                {r: 253, g: 1, b: 0},
                {r: 250, g: 2, b: 1},
                {r: 254, g: 0, b: 0},
                {r: 255, g: 0, b: 0},
                {r: 253, g: 1, b: 0},
                {r: 255, g: 0, b: 0},
                {r: 255, g: 0, b: 0},
                {r: 255, g: 1, b: 0},
                {r: 254, g: 0, b: 0},
                {r: 255, g: 0, b: 0},
                {r: 255, g: 0, b: 0},
                {r: 255, g: 1, b: 0},
            ];
            let idx = 0;

            function getColor() {
                if (idx < data.length) {
                    return data[idx++];
                } else {
                    return data[data.length - 1];
                }
            }

            // the only points at which the color value is expected to change.
            let transitions = new Map([
                [0, {r: 0, g: 0, b: 0}],
                [19, {r: 98, g: 97, b: 97}],
                [74, {r: 254, g: 1, b: 0}],
                [94, {r: 254, g: 0, b: 0}],
            ]);
            processor = newColorSensorProcessor(getColor);
            processor.configureSampling({stability: 20, frequency: 0});

            let expectedColor = {r: 0, g: 0, b: 0};
            while (idx < data.length) {
                if (transitions.get(idx) !== undefined) {
                    expectedColor = transitions.get(idx);
                }
                let actualColor = processor.getColor();
                expect({idx: idx - 1, color: actualColor}).toStrictEqual({idx: idx - 1, color: expectedColor});
            }
        })
    });
    describe('startScan()', () => {
        it('initiates a "scan" which collects color values and yields a "color spec"', async () => {
            let idx = 0;
            let data = [
                {r: 1, g: 40, b: 101},
                {r: 2, g: 45, b: 101},
                {r: 6, g: 50, b: 111},
            ];
            let getColor = function () {
                var color = (idx < data.length) ? color = data[idx] : {r: 0, g: 0, b: 0};
                idx++;
                return color;
            };
            processor = newColorSensorProcessor(getColor);
            var scan = processor.startScan(1000);
            while (idx < data.length) {
                await sleep(1);
            }
            scan.stop();
            expect(scan.getColorSpec()).toMatchObject({
                r: {value: 4, tolerance: 3},
                g: {value: 45, tolerance: 5},
                b: {value: 106, tolerance: 5}
            });
        });
        it('during a scan, ignores the "off" color', async () => {
            let idx = 0;
            let data = [
                {r: 0, g: 0, b: 0},
                {r: 100, g: 120, b: 140},
                {r: 0, g: 0, b: 0},
            ];
            let getColor = function () {
                var color = (idx < data.length) ? color = data[idx] : {r: 0, g: 0, b: 0};
                idx++;
                return color;
            };
            processor = newColorSensorProcessor(getColor);
            var scan = processor.startScan(1000);
            while (idx < data.length) {
                await sleep(1);
            }
            scan.stop();
            var spec = scan.getColorSpec();
            expect(spec.r).toMatchObject({value: 100, tolerance: 0});
            expect(spec.g).toMatchObject({value: 120, tolerance: 0});
            expect(spec.b).toMatchObject({value: 140, tolerance: 0});
        })
    });
    describe('Specs', () => {
        describe('isMatch()', () => {
            it('when given color is within tolerances, returns true', () => {
                processor = newColorSensorProcessor(getColor);
                let spec = processor.Spec.new({
                    r: {value: 255, tolerance: 10},
                    g: {value: 57, tolerance: 10},
                    b: {value: 97, tolerance: 10}
                });
                expect(spec.isMatch({r: 255, g: 57, b: 97})).toBeTruthy();
            });
            it('when the red channel of given color is outside tolerances, returns false', () => {
                processor = newColorSensorProcessor(getColor);
                let spec = processor.Spec.new({
                    r: {value: 255, tolerance: 10},
                    g: {value: 57, tolerance: 10},
                    b: {value: 97, tolerance: 10}
                });
                expect(spec.isMatch({r: 235, g: 57, b: 97})).toBeFalsy();
            });
            it('when the green channel of given color is outside tolerances, returns false', () => {
                processor = newColorSensorProcessor(getColor);
                let spec = processor.Spec.new({
                    r: {value: 255, tolerance: 10},
                    g: {value: 57, tolerance: 10},
                    b: {value: 97, tolerance: 10}
                });
                expect(spec.isMatch({r: 255, g: 68, b: 97})).toBeFalsy();
            });
            it('when the blue channel of given color is outside tolerances, returns false', () => {
                processor = newColorSensorProcessor(getColor);
                let spec = processor.Spec.new({
                    r: {value: 255, tolerance: 10},
                    g: {value: 57, tolerance: 10},
                    b: {value: 97, tolerance: 10}
                });
                expect(spec.isMatch({r: 255, g: 57, b: 197})).toBeFalsy();
            });
            it('when given color is at upper tolerances, returns true', () => {
                processor = newColorSensorProcessor(getColor);
                let spec = processor.Spec.new({
                    r: {value: 245, tolerance: 10},
                    g: {value: 57, tolerance: 10},
                    b: {value: 97, tolerance: 10}
                });
                expect(spec.isMatch({r: 255, g: 67, b: 107})).toBeTruthy();
            });
            it('when given color is at lower tolerances, returns true', () => {
                processor = newColorSensorProcessor(getColor);
                let spec = processor.Spec.new({
                    r: {value: 255, tolerance: 10},
                    g: {value: 57, tolerance: 10},
                    b: {value: 97, tolerance: 10}
                });
                expect(spec.isMatch({r: 245, g: 47, b: 87})).toBeTruthy();
            });
            it('when no color is given, compares against the current "stable color"', () => {
                let data = [
                    {r: 255, g: 57, b: 97},  // within tolerances
                    {r: 225, g: 57, b: 97},  // red outside tolerances
                    {r: 255, g: 68, b: 97},  // green outside tolerances
                    {r: 255, g: 57, b: 197}, // blue outside tolerances
                    {r: 255, g: 67, b: 107}, // at upper tolerances
                    {r: 235, g: 47, b: 87}   // at lower tolerances
                ];
                let idx = 0;
                let getColor = function () {
                    var c = data[idx];
                    if (idx < data.length - 1) {
                        idx++
                    }
                    return c;
                };
                processor = newColorSensorProcessor(getColor);
                let spec = processor.Spec.new({
                    r: {value: 245, tolerance: 10},
                    g: {value: 57, tolerance: 10},
                    b: {value: 97, tolerance: 10}
                });
                expect(spec.isMatch()).toBeTruthy(); // within tolerances
                expect(spec.isMatch()).toBeFalsy();  // red outside tolerances
                expect(spec.isMatch()).toBeFalsy();  // green outside tolerances
                expect(spec.isMatch()).toBeFalsy();  // blue outside tolerances
                expect(spec.isMatch()).toBeTruthy(); // at upper tolerances
                expect(spec.isMatch()).toBeTruthy(); // at lower tolerances

            });
        });
        describe('whenMatches()', () => {
            it('triggers once on match -- when "stable color" first matches the spec, the given handler is invoked, exactly once', () => {
                let data = [
                    // first, stabilizes on green
                    {r: 0, g: 255, b: 0},
                    {r: 0, g: 255, b: 0},
                    // then, the average moves gently (i.e. stdev < 3) and stays within spec's tolerances
                    {r: 1, g: 253, b: 2},
                    {r: 2, g: 253, b: 2},
                    {r: 1, g: 253, b: 2},
                    {r: 1, g: 253, b: 2},
                    // finally, returns back to the exact original average.
                    {r: 0, g: 255, b: 0},
                    {r: 0, g: 255, b: 0},
                    {r: 0, g: 255, b: 0},
                    {r: 0, g: 255, b: 0},
                ];
                let idx = 0;
                let getColor = function () {
                    var c = data[idx];
                    if (idx < data.length - 1) {
                        idx++
                    }
                    return c;
                };
                let processor = newColorSensorProcessor(getColor);
                processor.configureSampling({
                    stability: 2,   // have an actual rolling average
                    frequency: 0    // keep sampling manual
                });

                let timesTriggered = 0;
                processor.Spec.new({
                    r: {value: 0, tolerance: 5},
                    g: {value: 255, tolerance: 5},
                    b: {value: 0, tolerance: 5},
                }).whenMatches((done) => {
                    timesTriggered++;
                    done();
                });
                while(idx < data.length - 1) {
                    processor.getColor();
                }
                expect(timesTriggered).toBe(1);
            });
            it('ignores non-matches -- when "stable color" does NOT match the spec, the given handler is NOT invoked', () => {
                var triggered = false;
                let getColor = function () {
                    return {r: 255, g: 255, b: 255};
                };
                let processor = newColorSensorProcessor(getColor);
                let spec = processor.Spec.new({
                    r: {value: 10, tolerance: 10},
                    g: {value: 20, tolerance: 10},
                    b: {value: 30, tolerance: 10},
                });
                spec.whenMatches((done) => {
                    triggered = true;
                    done();
                });
                processor.getColor(); // cause a sample to be taken that triggers a transition.
                expect(triggered).toBeFalsy();
            });
            it('runs one instance of handler at a time -- given the handler was invoked but is not done, when "stable color" matches the spec again, the given handler is NOT invoked', () => {
                let data = [
                    {r: 10, g: 20, b: 30},
                    {r: 255, g: 57, b: 97},
                    {r: 10, g: 20, b: 30}
                ];
                let idx = 0;
                let getColor = function () {
                    var c = data[idx];
                    if (idx < data.length - 1) {
                        idx++
                    }
                    return c;
                };
                let processor = newColorSensorProcessor(getColor);
                let timesTriggered = 0;
                processor.Spec.new({
                    r: {value: 10, tolerance: 0},
                    g: {value: 20, tolerance: 0},
                    b: {value: 30, tolerance: 0},
                }).whenMatches( () => {
                    timesTriggered++;
                    // never calls done() ==> never "finishes"
                });
                processor.getColor(); // trigger the first invocation.
                processor.getColor(); // transition to another color.
                processor.getColor(); // transition back
                expect(timesTriggered).toBe(1);
            });
            it('resets handler when stops matching -- when "stable color" stops matching the spec, and then later matches, the given handler is invoked', () => {
                let data = [
                    // first, stabilizes on green
                    {rawColor: {r: 0, g: 255, b: 0}, expectedTriggered: 0},
                    {rawColor: {r: 0, g: 255, b: 0}, expectedTriggered: 0},
                    {rawColor: {r: 0, g: 255, b: 0}, expectedTriggered: 1},
                    // then, moves *outside* the spec's tolerances while remaining stable (stdev < 3)
                    {rawColor: {r: 0, g: 255, b: 4}, expectedTriggered: 1},
                    {rawColor: {r: 0, g: 255, b: 4}, expectedTriggered: 1},
                    // and gently back to original average.
                    {rawColor: {r: 0, g: 255, b: 0}, expectedTriggered: 1},
                    {rawColor: {r: 0, g: 255, b: 0}, expectedTriggered: 2}
                ];
                let idx = 0;
                let getColor = function () {
                    var c = data[idx].rawColor;
                    if (idx < data.length - 1) {
                        idx++
                    }
                    return c;
                };
                let processor = newColorSensorProcessor(getColor);
                processor.configureSampling({
                    stability: 2,   // have an actual rolling average
                    frequency: 0    // keep sampling manual
                });

                let timesTriggered = 0;
                processor.Spec.new({
                    r: {value: 0, tolerance: 0},
                    g: {value: 255, tolerance: 0},
                    b: {value: 0, tolerance: 2},
                }).whenMatches((done) => {
                    timesTriggered++;
                    done();
                });
                while(idx < data.length - 1) {
                    processor.getColor();
                    expect(timesTriggered).toBe(data[idx].expectedTriggered);
                }
            });
            it('register multiple handlers -- when called multiple times, invokes all handlers, in the order they were registered', () => {
                var invocations = [];
                let getColor = function () {
                    return {r: 15, g: 25, b: 35};
                };
                let processor = newColorSensorProcessor(getColor);
                let spec = processor.Spec.new({
                    r: {value: 10, tolerance: 10},
                    g: {value: 20, tolerance: 10},
                    b: {value: 30, tolerance: 10},
                });
                spec.whenMatches((done) => {
                    invocations.push("first");
                    done();
                });
                spec.whenMatches((done) => {
                    invocations.push("second");
                    done();
                });
                spec.whenMatches((done) => {
                    invocations.push("third");
                    done();
                });
                processor.getColor(); // cause a sample to be taken that triggers a transition.
                expect(invocations).toStrictEqual(["first", "second", "third"]);
            });
            it('deletes handlers -- when the given handler is not a function (e.g. undefined), previously given handlers are unregistered', () => {
                var triggered = false;
                let getColor = function () {
                    return {r: 15, g: 25, b: 35};
                };
                let processor = newColorSensorProcessor(getColor);
                let spec = processor.Spec.new({
                    r: {value: 10, tolerance: 10},
                    g: {value: 20, tolerance: 10},
                    b: {value: 30, tolerance: 10},
                });
                spec.whenMatches((done) => {
                    triggered = true;
                    done();
                });
                spec.whenMatches();
                processor.getColor(); // cause a sample to be taken that triggers a transition.
                expect(triggered).toBeFalsy();
            });
        });
        describe('not()', () => {
            it('when given color is within tolerances, returns false', () => {
                const processor = newColorSensorProcessor(getColor);
                const s = processor.Spec;
                let spec = s.not(s.new({
                    r: {value: 255, tolerance: 10},
                    g: {value: 57, tolerance: 10},
                    b: {value: 97, tolerance: 10}
                }));
                expect(spec.isMatch({r: 255, g: 57, b: 97})).toBeFalsy();
            });
            it('when given color is at upper tolerances, returns false', () => {
                processor = newColorSensorProcessor(getColor);
                const s = processor.Spec;
                let spec = s.not(s.new({
                    r: {value: 245, tolerance: 10},
                    g: {value: 57, tolerance: 10},
                    b: {value: 97, tolerance: 10}
                }));
                expect(spec.isMatch({r: 255, g: 67, b: 107})).toBeFalsy();
            });
            it('when given color is at lower tolerances, returns false', () => {
                processor = newColorSensorProcessor(getColor);
                const s = processor.Spec;
                let spec = s.not(s.new({
                    r: {value: 255, tolerance: 10},
                    g: {value: 57, tolerance: 10},
                    b: {value: 97, tolerance: 10}
                }));
                expect(spec.isMatch({r: 245, g: 47, b: 87})).toBeFalsy();
            });
            it('when given color is outside tolerances, returns true', () => {
                processor = newColorSensorProcessor(getColor);
                const s = processor.Spec;
                let spec = s.not(s.new({
                    r: {value: 255, tolerance: 10},
                    g: {value: 57, tolerance: 10},
                    b: {value: 97, tolerance: 10}
                }));
                expect(spec.isMatch({r: 1, g: 1, b: 1})).toBeTruthy();
            });
        })
    });
});


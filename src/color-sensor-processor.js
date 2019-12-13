// version: 0.9.1
const newColorSensorProcessor = function (getColorFn) {
// wire-in the built-in (i.e. defined in EDU) `getColor()` function.
    if (getColorFn === undefined) {
        getColorFn = getColor;
    }

    const config = {
        stability: 1,       // how many samples in a row must be equivalent to consider a new color read as "stable."
        sampleFrequency: 0  // how frequently (in Hz) to sample from RVR's color sensor. 0 = on-demand.
    };

    function configureSampling(newConfig) {
        config.stability = newConfig.stability !== undefined ? newConfig.stability : 20;
        config.sampleFrequency = newConfig.frequency !== undefined ? newConfig.frequency : 100;
        collectSamples();
    }

    function collectSamples() {
        if (config.sampleFrequency !== 0) {
            collectSample();
            setTimeout(collectSamples, 1000 / config.sampleFrequency);
        }
    }

    let rawColors = [];     // array of {r:, g:, b:}. a rolling log of colors sampled from the RVR's color sensor.
    let avgColors = [];     // array of {r:, g:, b:}. a rolling average over `rawColors`
    let latestStableColor = {r: 0, g: 0, b: 0};

    function collectSample() {
        rawColors.unshift(getColorFn());
        const currAvgColor = average(rawColors);
        avgColors.unshift(currAvgColor);

        // have we collected enough data points to even think about calculating stability?
        if (avgColors.length >= config.stability) {
            if (areStable(avgColors)) {
                // wait until the last possible moment to round values to minimize statistical error.
                const nextStableColor = round(currAvgColor);
                if (!isEqual(nextStableColor, latestStableColor)) {
                    latestStableColor = nextStableColor;
                    invokeHandlersMatching(latestStableColor);
                }
            }
            rawColors = rawColors.slice(0, config.stability - 1);
            avgColors = avgColors.slice(0, config.stability - 1);
        }
    }

    function areStable(colors) {
        const stdev = standardDeviation(colors);
        return stdev.r < 3.0 && stdev.g < 3.0 && stdev.b < 3.0;
    }

    const activeSpecs = new Map();  // from Spec to {handlers:[handlerFns...], hasBeenMatching: false}
    function registerHandler(spec, handler) {
        const state = activeSpecs.get(spec) || {
            handlers: [],
            hasBeenMatching: false
        };
        state.handlers.push({fn: handler, isRunning: false});
        activeSpecs.set(spec, state);
    }
    function invokeHandlersMatching(color) {
        for (const [spec, state] of activeSpecs) {
            if (spec.isMatch(color)) {
                if (!state.hasBeenMatching) {
                    for (let idx = 0; idx < state.handlers.length; idx++) {
                        const handler = state.handlers[idx];
                        if (!handler.isRunning) {
                            handler.isRunning = true;
                            handler.fn(function () {
                                handler.isRunning = false;
                            }, color, spec);
                        }
                    }
                    state.hasBeenMatching = true;
                }
            } else {
                state.hasBeenMatching = false;
            }
        }
    }
    function unregisterAllHandlers(spec) {
        activeSpecs.delete(spec);
    }



    function getStableColor() {
        if (config.sampleFrequency === 0) {
            collectSample();
        }
        return latestStableColor;
    }

    function startScan(scanFrequency) {
        return function (freq) {
            freq = freq || 10;
            let enabled = true;
            let count = 0;
            const values = {
                r: {min: 255, max: 0},
                g: {min: 255, max: 0},
                b: {min: 255, max: 0}
            };

            function scanForColor(freq) {
                if (enabled) {
                    const c = getColorFn();

                    // omit off; it's a start-up value and would result into artificially large tolerances in the
                    //   yielded color spec.
                    if (!(c.r === 0 && c.g === 0 && c.b === 0)) {
                        values.r.min = Math.min(values.r.min, c.r);
                        values.g.min = Math.min(values.g.min, c.g);
                        values.b.min = Math.min(values.b.min, c.b);
                        values.r.max = Math.max(values.r.max, c.r);
                        values.g.max = Math.max(values.g.max, c.g);
                        values.b.max = Math.max(values.b.max, c.b);
                        count++;
                    }
                    setTimeout(scanForColor, 1000 / freq, freq);
                }
            }

            function stop() {
                enabled = false;
            }

            function getColorSpec() {
                const avg = {
                    r: (values.r.max + values.r.min) / 2,
                    g: (values.g.max + values.g.min) / 2,
                    b: (values.b.max + values.b.min) / 2
                };
                return Spec.new({
                    r: {value: Math.round(avg.r), tolerance: Math.round(values.r.max - avg.r)},
                    g: {value: Math.round(avg.g), tolerance: Math.round(values.g.max - avg.g)},
                    b: {value: Math.round(avg.b), tolerance: Math.round(values.b.max - avg.b)}
                });
            }

            function getCount() {
                return count;
            }

            scanForColor(freq);
            return {
                stop: stop,
                getColorSpec: getColorSpec,
                getCount: getCount,
            }
        }(scanFrequency);
    }

    // calculates the average of a list of colors (for each channel).
    //   assumes there is at least one item in the list.
    function average(colors) {
        const avg = {r: 0, g: 0, b: 0};
        for (let idx = 0; idx < colors.length; idx++) {
            avg.r += colors[idx].r;
            avg.g += colors[idx].g;
            avg.b += colors[idx].b;
        }
        avg.r /= colors.length;
        avg.g /= colors.length;
        avg.b /= colors.length;

        return avg;
    }

    // calculates the standard deviation of a list of colors (for each channel).
    //   assumes there is at least one item in the list.
    //   (see also: https://www.mathsisfun.com/data/standard-deviation-formulas.html)
    function standardDeviation(colors) {
        const avg = average(colors);

        const sumOfDiffsSquared = {r: 0, g: 0, b: 0};
        for (let idx = 0; idx < colors.length; idx++) {
            sumOfDiffsSquared.r += (avg.r - colors[idx].r) * (avg.r - colors[idx].r);
            sumOfDiffsSquared.g += (avg.g - colors[idx].g) * (avg.g - colors[idx].g);
            sumOfDiffsSquared.b += (avg.b - colors[idx].b) * (avg.b - colors[idx].b);
        }
        return {
            r: Math.sqrt(sumOfDiffsSquared.r / colors.length),
            g: Math.sqrt(sumOfDiffsSquared.g / colors.length),
            b: Math.sqrt(sumOfDiffsSquared.b / colors.length)
        };
    }

    // rounds red, green, blue values of the given color.
    function round(color) {
        return {
            r: Math.round(color.r),
            g: Math.round(color.g),
            b: Math.round(color.b),
        }
    }

    function isEqual(colorA, colorB) {
        return colorA.r === colorB.r &&
            colorA.g === colorB.g &&
            colorA.b === colorB.b;
    }

    function deepCopyDataFrom(object) {
        return JSON.parse(JSON.stringify(object));
    }

    const Spec = {
        new: function (colorWithTolerances) {
            const newSpec = deepCopyDataFrom(colorWithTolerances);

            newSpec.isMatch = function (color) {
                const c = color || getStableColor();
                return c.r >= this.r.value - this.r.tolerance &&
                    c.r <= this.r.value + this.r.tolerance &&
                    c.g >= this.g.value - this.g.tolerance &&
                    c.g <= this.g.value + this.g.tolerance &&
                    c.b >= this.b.value - this.b.tolerance &&
                    c.b <= this.b.value + this.b.tolerance;
            };

            newSpec.whenMatches = function (handler) {
                if (typeof handler === "function") {
                    registerHandler(this, handler);
                } else {
                    unregisterAllHandlers(this);
                }
            };

            return newSpec;
        },
        not: function (spec) {
            return function (spec) {
                const newSpec = Spec.new(spec);
                newSpec.isMatch = function (color) {
                    return !spec.isMatch(color);
                };
                return newSpec;
            }(spec);
        },
        and: function(specA, specB) {
            return function (specA, specB) {
                const newSpec = Spec.new([specA, specB]);
                newSpec.isMatch = function (color) {
                    return specA.isMatch(color) && specB.isMatch(color);
                };
                return newSpec;
            }(specA, specB);
        },
        or: function(specA, specB) {
            return function (specA, specB) {
                const newSpec = Spec.new([specA, specB]);
                newSpec.isMatch = function (color) {
                    return specA.isMatch(color) || specB.isMatch(color);
                };
                return newSpec;
            }(specA, specB);
        }
    };

    return {
        configureSampling: configureSampling,
        getColor: getStableColor,
        startScan: startScan,
        Spec: Spec
    }
};

module.exports = newColorSensorProcessor;
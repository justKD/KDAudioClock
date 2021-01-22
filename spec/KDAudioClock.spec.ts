/**
 * @file KDAudioClock.spec.ts
 * @version 1.0.7
 * @author Cadence Holmes
 * @copyright Cadence Holmes 2020
 * @license MIT
 * @fileoverview
 * Jest tests for KDAudioClock.ts
 */

import { KDAudioClock } from '../src/KDAudioClock/KDAudioClock';
import { KDAudioClockEvent } from '../src/KDAudioClock/KDAudioClockEvent';

describe(`KDAudioClock`, () => {
  describe(`KDAudioClock init and get functions`, () => {
    it('should create a destroyable instance', () => {
      const first = new KDAudioClock();
      expect(first.start).toBeInstanceOf(Function);
      first.destroy();
      expect(first.start).toBeUndefined();

      let second = new KDAudioClock();
      expect(second).toBeInstanceOf(KDAudioClock);
      second = second.destroy();
      expect(second).toBeUndefined();
    });

    it(`should create and start a new audio context if one is not provided`, () => {
      const clock = new KDAudioClock();
      return clock.start().then(() => {
        const ctx = clock.getContext();
        expect(ctx).toBeInstanceOf(AudioContext);
        expect(ctx.state).toBe('running');
        expect(clock.isRunning()).toBe(true);
        expect(clock.isPaused()).toBe(false);
      });
    });

    it(`should use an external audio context if one is provided`, () => {
      const ctx = new AudioContext();
      const clock = new KDAudioClock({
        context: ctx,
      });
      return clock.start().then(() => {
        const clockctx = clock.getContext();
        expect(clockctx).toEqual(ctx);
        expect(clockctx.state).toBe('running');
        expect(clock.isRunning()).toBe(true);
        expect(clock.isPaused()).toBe(false);
      });
    });

    it(`should accept a new context as a start() parameter`, () => {
      const ctx = new AudioContext();
      const clock = new KDAudioClock();
      clock.start(ctx);
      expect(clock.getContext()).toEqual(ctx);
    });

    it(`should pause the audio context`, () => {
      const clock = new KDAudioClock();
      return clock.start().then(() => {
        clock.pause().then(() => {
          const ctx = clock.getContext();
          expect(ctx.state).toBe('suspended');
          expect(clock.isRunning()).toBe(false);
          expect(clock.isPaused()).toBe(true);
        });
      });
    });

    it(`should resume the audio context with resume()`, () => {
      const clock = new KDAudioClock();
      return clock.start().then(() => {
        clock.pause().then(() => {
          clock.resume().then(() => {
            const ctx = clock.getContext();
            expect(ctx.state).toBe('running');
            expect(clock.isRunning()).toBe(true);
            expect(clock.isPaused()).toBe(false);
          });
        });
      });
    });

    it(`should resume the audio context with start()`, () => {
      const clock = new KDAudioClock();
      return clock.start().then(() => {
        clock.pause().then(() => {
          clock.start().then(() => {
            const ctx = clock.getContext();
            expect(ctx.state).toBe('running');
            expect(clock.isRunning()).toBe(true);
            expect(clock.isPaused()).toBe(false);
          });
        });
      });
    });

    it(`should stop and release an internal audio context`, () => {
      const clock = new KDAudioClock();
      return clock.start().then(() => {
        clock.stop().then(() => {
          expect(clock.getContext()).toBe(null);
          expect(clock.isRunning()).toBe(false);
          expect(clock.isPaused()).toBe(false);
        });
      });
    });

    it(`should stop and close an external audio context, releasing internally held references`, () => {
      const ctx = new AudioContext();
      const clock = new KDAudioClock({
        context: ctx,
      });
      return clock.start().then(() => {
        clock.stop().then(() => {
          expect(clock.getContext()).toBe(null);
          expect(clock.isRunning()).toBe(false);
          expect(clock.isPaused()).toBe(false);
          expect(ctx.state).toBe('closed');
        });
      });
    });

    it(`should get current audio context time`, () => {
      const clock = new KDAudioClock();
      expect(clock.getCurrentTime()).toBeNull();
      return clock.start().then(() => {
        const ctx = clock.getContext();
        expect(clock.getCurrentTime()).toEqual(ctx.currentTime);
        clock.stop().then(() => {
          expect(clock.getCurrentTime()).toBeNull();
        });
      });
    });

    it('should return class default settings for later reference', () => {
      const clock = new KDAudioClock();
      const defaults = clock.getDefaults();
      expect(defaults).toEqual({
        tolerance: {
          early: 0.001,
          late: 0.1,
        },
        bpm: 60,
        beat: 4,
      });
    });

    it(`should get and set tolerance settings`, () => {
      const clock = new KDAudioClock();
      const defaults = clock.getDefaults();
      const newTolerance = { early: 1, late: 1 };
      expect(clock.getTolerance()).toEqual(defaults.tolerance);
      clock.setTolerance(newTolerance);
      expect(clock.getTolerance()).toEqual(newTolerance);
    });
  });

  describe(`KDAudioClock event creation functions`, () => {
    it(`should create an event that mimics window.settimeout`, () => {
      const clock = new KDAudioClock();
      return clock.start().then(() => {
        const waittime = 1000;
        const event = clock.setTimeout((ev) => {
          const earliest = waittime - clock.getTolerance().early;
          const latest = waittime + clock.getTolerance().late;
          const currenttime = clock.getCurrentTime();
          const test = currenttime >= earliest && currenttime <= latest;
          expect(test).toBe(true);
          expect(event).toEqual(ev);
        }, 1000);
      });
    });

    it(`should create an event that mimics window.setinterval`, () => {
      const clock = new KDAudioClock();
      return clock.start().then(() => {
        const interval = 100;
        const event = clock.setInterval((ev) => {
          const count = ev.get.loop().elapsedTickCount;
          const earliest = interval * count - clock.getTolerance().early;
          const latest = interval * count + clock.getTolerance().late;
          const currenttime = clock.getCurrentTime();
          const test = currenttime >= earliest && currenttime <= latest;
          expect(test).toBe(true);
          expect(event).toEqual(ev);

          if (count >= 5) {
            clock.clearInterval(ev);
            expect(clock.getEvents().length).toBe(0);
          }
        }, 1000);
      });
    });

    it(`should create custom events`, () => {
      const clock = new KDAudioClock();
      return clock.start().then(() => {
        const repetitions = 5;
        const interval = 100;
        const tolerance = {
          early: 0.2,
          late: 0.02,
        };
        clock.schedule({
          tolerance: tolerance,
          loop: {
            interval: interval,
            repetitions: repetitions,
          },
          onComplete: (ev) => {
            const count = ev.get.loop().elapsedTickCount;
            expect(count).toEqual(repetitions);
          },
        });
      });
    });

    it(`should retain events with uniquely assigned identifiers`, () => {
      const clock = new KDAudioClock();
      return clock.start().then(() => {
        const interval = 1000;
        const initialCount = 5000;

        let count = initialCount;
        while (count--) clock.setTimeout(() => {}, interval);

        const events = clock.getEvents().map((ev) => ev.get.uid());
        const uniqueSet = new Set(events);
        expect(uniqueSet.size).toEqual(initialCount);
      });
    });

    it(`should remove events when stopped`, () => {
      const clock = new KDAudioClock();
      return clock.start().then(() => {
        const interval = 1000;
        const ev1 = clock.setTimeout(() => {}, interval);
        const ev2 = clock.setInterval(() => {}, interval);
        const ev3 = clock.schedule({
          loop: {
            interval: interval,
          },
        });

        expect(clock.getEvents()).toEqual([ev1, ev2, ev3]);

        clock.stop().then(() => {
          expect(clock.getEvents()).toEqual([]);
        });
      });
    });

    it(`should be able to sync existing events`, () => {
      const clock = new KDAudioClock();
      const interval = 100;
      const delay = 50;
      return clock.start().then(() => {
        clock.setTimeout(() => {
          clock.setInterval(() => {}, interval);

          // At this point there are 3 events.
          const events = clock.getEvents();

          // Each should have a different deadline, so a unique deadline set should still
          // have 3 elements, the non-repeating timeout and an entry for each interval.
          const dlsBefore = events.map((event) => event.get.nextDeadline());
          const uniqueSetBefore = new Set(dlsBefore);
          expect(uniqueSetBefore.size).toBe(3);

          // Syncing will look for repeating events and set the next deadline for each to be
          // current time + the provided delay time. So a unique deadline set should now have
          // 2 elements, the non-repeating timeout and a single entry for the 2 repeating intervals
          // which now have the same deadline.
          clock.sync(events, 100);
          const dlsAfter = events.map((event) => event.get.nextDeadline());
          const uniqueSetAfter = new Set(dlsAfter);
          expect(uniqueSetAfter.size).toBe(2);
        }, interval + delay);

        clock.setInterval(() => {}, interval);
      });
    });

    it(`should be able to timestretch existing events`, () => {
      const clock = new KDAudioClock();
      const interval = 100;
      const delay = 50;
      return clock.start().then(() => {
        clock.setTimeout(() => {
          clock.setInterval(() => {}, interval);
          clock.setInterval(() => {}, interval + delay);

          // At this point there are 3 events.
          const events = clock.getEvents();

          // The loop intervals should match the provided interval duration,
          // and the timeStretch value should default to 1.
          events.forEach((event) => {
            expect(event.get.loop().timeStretch).toBe(1);
          });
          const intervals1 = events.map((event) => {
            return event.get.loop().currentInterval;
          });
          expect(intervals1).toContain(interval);
          expect(intervals1).toContain(interval + delay);

          // Stretch values are always a function of the initial interval value,
          // so the current interval should always be the initial interval * the time
          // timestretch value.
          const stretchTests = [1.12, 1.5, 1.83, 2.34, 3];
          stretchTests.forEach((test) => {
            clock.timeStretch(events, test);
            events.forEach((event) => {
              expect(event.get.loop().timeStretch).toBe(test);
            });
            const intervals = events.map((event) => {
              return event.get.loop().currentInterval;
            });
            expect(intervals).toContain(interval * test);
            expect(intervals).toContain(interval + delay * test);
          });

          // And setting a timestretch value of 1 should reset the current interval to
          // the initial interval.
          clock.timeStretch(events, 1);
          events.forEach((event) => {
            expect(event.get.loop().timeStretch).toBe(1);
          });
          const intervals2 = events.map((event) => {
            return event.get.loop().currentInterval;
          });
          expect(intervals2).toContain(interval);
          expect(intervals2).toContain(interval + delay);
        }, interval);
      });
    });

    it(`should retain events when paused`, () => {
      const clock = new KDAudioClock();
      return clock.start().then(() => {
        const interval = 1000;
        const ev1 = clock.setTimeout(() => {}, interval);
        const ev2 = clock.setInterval(() => {}, interval);
        const ev3 = clock.schedule({
          loop: {
            interval: interval,
          },
        });

        expect(clock.getEvents()).toEqual([ev1, ev2, ev3]);

        clock.pause().then(() => {
          expect(clock.getEvents()).toEqual([ev1, ev2, ev3]);
        });
      });
    });

    it(`should return identifiable unique events`, () => {
      const clock = new KDAudioClock();
      return clock.start().then(() => {
        const event = clock.setInterval(() => {}, 100);
        const uid = event.get.uid();
        expect(clock.hasEvent(event)).toBe(true);
        expect(clock.hasEvent(uid)).toBe(true);
        expect(clock.getUIDFor(event)).toEqual(uid);
        expect(clock.getEventFor(uid)).toEqual(event);
        expect(clock.getEventUidEntries()[0][0]).toEqual(event);
        expect(clock.getEventUidEntries()[0][1]).toEqual(uid);
      });
    });

    it(`should retain running events in the event queue and exclude suspended events from queuing`, () => {
      const clock = new KDAudioClock();
      return clock.start().then(() => {
        const ev1 = clock.setInterval(() => {}, 100);
        const ev2 = clock.setInterval(() => {}, 100);
        const expected = [ev1, ev2];
        expect(clock.getEvents()).toEqual(expected);
        expect(clock.getEventQueue().length).toEqual(expected.length);
        expect(clock.getEventQueue()).toContain(ev1);
        expect(clock.getEventQueue()).toContain(ev2);

        clock.suspend(ev2);
        expect(clock.getEvents()).toEqual(expected);
        expect(clock.getEventQueue()).toContain(ev1);

        clock.schedule(ev2, clock.getCurrentTime());
        expect(clock.getEvents()).toEqual(expected);
        expect(clock.getEventQueue().length).toEqual(expected.length);
        expect(clock.getEventQueue()).toContain(ev1);
        expect(clock.getEventQueue()).toContain(ev2);
      });
    });

    it(`should be able to delete events`, () => {
      const clock = new KDAudioClock();
      return clock.start().then(() => {
        const ev1 = clock.setInterval(() => {}, 100);
        let ev2 = clock.setInterval(() => {}, 100);

        expect(clock.getEvents()).toEqual([ev1, ev2]);

        expect(ev1.schedule).toBeInstanceOf(Function);
        clock.delete(ev1);
        expect(ev1.schedule).toBeUndefined();

        expect(ev2).toBeInstanceOf(KDAudioClockEvent);
        ev2 = clock.delete(ev2);
        expect(ev2).toBeUndefined();

        expect(clock.getEvents()).toEqual([]);
      });
    });
  });

  describe(`KDAudioEvent score functions`, () => {
    it(`should have and return default bpm and beat values`, () => {
      const clock = new KDAudioClock();
      const defaultBPM = 60;
      const defaultBeat = 4;
      expect(clock.getBPM()).toEqual(defaultBPM);
      expect(clock.getBeat()).toEqual(defaultBeat);
    });

    it(`should be able to set new bpm and beat values`, () => {
      const clock = new KDAudioClock();
      const bpm = 72;
      const beat = 8;
      clock.setBPM(bpm);
      clock.setBeat(beat);
      expect(clock.getBPM()).toEqual(bpm);
      expect(clock.getBeat()).toEqual(beat);
    });

    it(`should use bpm and beat to calculate metered time`, () => {
      const clock = new KDAudioClock();

      // Given the conversion formula:
      // topMeterValue * (60 / bpm) * 1000 * (beat / bottomMeterValue);
      const tests = [
        {
          bpm: 60,
          beat: 4,
          topMeterValue: 1,
          bottomMeterValue: 4,
          expected: 1000,
        },
        {
          bpm: 60,
          beat: 4,
          topMeterValue: 1,
          bottomMeterValue: 8,
          expected: 500,
        },
        {
          bpm: 72,
          beat: 6,
          topMeterValue: 2,
          bottomMeterValue: 7,
          expected: 1428.57,
        },
      ];

      tests.forEach((test) => {
        clock.setBPM(test.bpm);
        clock.setBeat(test.beat);
        const meteredDuration = clock.meter(
          test.topMeterValue,
          test.bottomMeterValue
        );
        expect(meteredDuration.toFixed(2)).toBe(test.expected.toFixed(2));
      });
    });

    it(`should create scores using a series of settimeout events`, () => {
      const clock = new KDAudioClock();
      return clock.start().then(() => {
        const note = clock.createScoredEvent;
        const durations = [0, 50, 112, 225, 156];
        const mockCallback = jest.fn((x) => x);

        clock.score([
          note(durations[0], () => {
            mockCallback(durations[0]);
          }),
          note(durations[1], () => {
            mockCallback(durations[1]);
          }),
          note(durations[2], () => {
            mockCallback(durations[2]);
          }),
          note(durations[3], () => {
            mockCallback(durations[3]);
          }),
          note(durations[4], () => {
            mockCallback(durations[4]);
          }),
          note(0, () => {
            expect(mockCallback.mock.calls.length).toBe(durations.length);

            mockCallback.mock.calls.forEach((call, index) => {
              const expected = durations[index];
              expect(call[0]).toBe(expected);
              expect(mockCallback.mock.results[0].value).toBe(expected);
            });

            const sum = durations.reduce((a, b) => a + b, 0);
            const boundaries = [
              sum - clock.getTolerance().early * durations.length,
              sum + clock.getTolerance().late * durations.length,
            ];
            expect(clock.getCurrentTime() * 1000 >= boundaries[0]).toBe(true);
            expect(clock.getCurrentTime() * 1000 <= boundaries[1]).toBe(true);
          }),
        ]);
      });
    });
  });
});

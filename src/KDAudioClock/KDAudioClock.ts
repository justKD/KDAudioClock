/**
 * @file KDAudioClock.ts
 * @version 1.0.7
 * @author Cadence Holmes
 * @copyright Cadence Holmes 2020
 * @license MIT
 * @fileoverview `export const KDAudioClock`
 * A class for creating timed events using the web audio clock.
 */

import {
  KDAudioClockEvent,
  KDAudioClockEventOptions,
} from './KDAudioClockEvent';
import { KDUIDManager } from './KDUIDManager';

/**
 * A class for creating timed events using the web audio clock.
 * Originally based on WAAClock by [@sebpiq](https://github.com/sebpiq/WAAClock),
 * which is itself based on Chris Wilson's article
 * [A Tale of Two Clocks](https://www.html5rocks.com/en/tutorials/audio/scheduling/).
 */
export class KDAudioClock {
  /**
   * Start the clock. Handles the first start as well as resuming a paused or stopped clock.
   * Creates a new AudioContext if one doesn't already exist, otherwise uses the assigned or
   * previously created context. Connects the audio node and begins processing ticks.
   * @param {AudioContext} [ctx] - An external audio context to use, overriding any context originally
   * passed in the initial options.
   * @returns The promise returned by `new AudioContext().resume()`.
   * @example
   *  const clock = new KDAudioClock();
   *  // now this must be called before scheduling any events
   *  clock.start();
   */
  start: (ctx?: AudioContext) => Promise<any>;

  /**
   * An alias for `start`. This method will simply call `start`, but it may help readability if this
   * is used after a `pause` and `start` is only used in opposition to `stop`.
   * @returns The promise returned by `new AudioContext().resume()`.
   */
  resume: () => Promise<any>;

  /**
   * Deletes all currently existing events managed by the clock, disconnects the clock audio node,
   * closes the audio context and releases its internal reference.
   * @returns The promise returned by `new AudioContext().close().then()`.
   * @note If a context was passed in the initial options, it will still be referenced by the
   * options object, but a new context must be passed to the `start()` method since the original
   * will be closed.
   * @example
   *  const clock = new KDAudioClock();
   *  clock.start();
   *
   *  clock.setInterval(() => console.log("tick"), 100);
   *
   *  console.log(clock.getEvents()); // array with one event
   *  console.log(clock.isRunning()); // true
   *
   *  clock.stop();
   *
   *  console.log(clock.getEvents()); // empty array
   *  console.log(clock.isRunning()); // false
   *
   *  clock.start();
   *
   *  console.log(clock.getEvents()); // empty array
   *  console.log(clock.isRunning()); // true
   */
  stop: () => Promise<any>;

  /**
   * Pauses the clock but retains existing events. Disconnects the clock audio node
   * and suspends the audio context.
   * @returns The promise returned by `new AudioContext().suspend()`.
   * @example
   *  const clock = new KDAudioClock();
   *  clock.start();
   *
   *  clock.setInterval(() => console.log("tick"), 100);
   *
   *  console.log(clock.getEvents()); // array with one event
   *  console.log(clock.isRunning()); // true
   *
   *  clock.pause();
   *
   *  console.log(clock.getEvents()); // array with one event
   *  console.log(clock.isRunning()); // false
   *
   *  clock.start();
   *
   *  console.log(clock.getEvents()); // array with one event
   *  console.log(clock.isRunning()); // true
   */
  pause: () => Promise<any>;

  /**
   * @returns `true` if the clock is running or `false` if the clock
   *  has never been started, is paused, or has been stopped.
   */
  isRunning: () => boolean;

  /**
   * @returns `true` if the clock is paused.
   */
  isPaused: () => boolean;

  /**
   * @returns Object holding the `KDAudioClock` default values for `tolerance`, `bpm`, and `beat`.
   */
  getDefaults: () => {
    tolerance: {
      early: number;
      late: number;
    };
    bpm: number;
    beat: number;
  };

  /**
   * Create a scheduled event.
   * @param {KDAudioClockEventOptions | KDAudioClockEvent | KDAudioClockEvent[]} opts -
   * Either an existing `KDAudioEvent`, and array of `KDAudioEvent`,
   * or an object holding `KDAudioClockEventOptions`.
   * @param {number} [deadline] - The time at which an existing event should begin.
   * @returns `KDAudioClockEvent` or `KDAudioClockEvent[]`
   * @example
   *  const clock = new KDAudioClock();
   *  clock.start();
   *
   *  const event = clock.schedule({
   *    loop: {
   *      interval: 100,
   *      repetitions: 5,
   *    },
   *    onTick: (event) => {
   *      console.log(event.get.clock().getCurrentTime());
   *    },
   *    onComplete: (event) => {
   *      console.log(`event ${event.get.uid()} is done at ${event.get.clock().getCurrentTime()}`);
   *    },
   *  });
   *
   *  console.log(`start ${event.get.uid()}`)
   *
   * @example
   *  const clock = new KDAudioClock();
   *  clock.start();
   *
   *  const event = clock.setInterval(()=>{}, 100);
   *  clock.suspend(event);
   *  clock.schedule(event, clock.getCurrentTime() + 500);
   */
  schedule: (
    opts: KDAudioClockEventOptions | KDAudioClockEvent | KDAudioClockEvent[],
    deadline?: number
  ) => KDAudioClockEvent | KDAudioClockEvent[];

  /**
   * Shortcut for creating a scheduled event that mimics `window.setTimeout` functionality.
   * @param {() => void} callback
   * @param {number} delayInMs
   * @returns `KDAudioClockEvent`
   * @example
   *  const clock = new KDAudioClock();
   *  clock.start();
   *
   *  const event = clock.setTimeout(() => console.log("1 sec later"), 1000);
   *  const event2 = clock.setTimeout((ev) => console.log(ev), 2000);
   */
  setTimeout: (
    callback: (ev: KDAudioClockEvent) => void,
    delayInMs: number
  ) => KDAudioClockEvent;

  /**
   * Shortcut for creating a scheduled event that mimics `window.setInterval` functionality.
   * @param {() => void} callback
   * @param {number} intervalInMs
   * @returns `KDAudioClockEvent`
   * @example
   *  const clock = new KDAudioClock();
   *  clock.start();
   *
   *  const event = clock.setInterval(() => console.log("every second"), 1000);
   *  const event2 = clock.setInterval((ev) => console.log(`${ev.get.uid()} every 2 seconds`), 2000);
   */
  setInterval: (
    callback: (ev: KDAudioClockEvent) => void,
    intervalInMs: number
  ) => KDAudioClockEvent;

  /**
   * Shortcut for deleting an event that mimics `window.clearInterval` functionality.
   * @param {() => void} callback
   * @param {number} intervalInMs
   * @returns `KDAudioClockEvent`
   * @example
   *  const clock = new KDAudioClock();
   *  clock.start();
   *
   *  clock.setInterval((ev) => {
   *    if (ev.get.loop().elapsedTickCount >= 3) {
   *      clock.clearInterval(ev)
   *    };
   *  }, 1000);
   */
  clearInterval: (event: KDAudioClockEvent) => void;

  /**
   * Begin a series of scored events, with each subsequent event in the passed array taking place
   * after the previous event fires + the wait duration of the next event.
   * @param {[number, () => void][]} events - An array holding event descriptors, which in this
   * case are each arrays `[waitTime, callback]`. `waitTime` is the duration in ms to wait
   * after the previous event fires.
   * @returns An object `{ break: () => void }`. Calling `break` will keep future events
   * scheduled by this score from firing.
   * @example
   *  const clock = new KDAudioClock();
   *  clock.start();
   *
   *  const note = clock.createScoredEvent;
   *  clock.score([
   *     note(0, () => {
   *        console.log('start score right away');
   *     }),
   *     note(1000, () => {
   *        console.log('after 1s');
   *     }),
   *     note(500, () => {
   *        console.log('another .5s');
   *     }),
   *     note(250, () => {
   *        console.log('another .25s');
   *     }),
   *     note(1000, () => {
   *        console.log('another 1s');
   *        console.log('end score');
   *     }),
   *  ]);
   */
  score: (
    events: [number, (event: KDAudioClockEvent) => void][]
  ) => { break: () => void };

  /**
   * Helper function to make scored event arrays more readable.
   * @param {number} delayInMs - The duration in ms to wait after the previous event fires.
   * @param {() => void} callback - The function to call after the wait time (`delayInMs`).
   * @returns An event `[delayInMs, callback]` formatted for use with `new KDAudioClock.score()`.
   */
  createScoredEvent: (
    delayInMs: number,
    callback: (event: KDAudioClockEvent) => void
  ) => [number, (event: KDAudioClockEvent) => void];

  /**
   * @param {string} eventID - The unique identifier string that was automatically assigned to the event.
   * @returns `KDAudioClockEvent`
   */
  getEventFor: (eventID: string) => KDAudioClockEvent;

  /**
   * @param {KDAudioClockEvent} event - An event that is being managed by this clock instance.
   * @returns The unique identifier `string` that was automatically assigned to the event.
   */
  getUIDFor: (event: KDAudioClockEvent) => string;

  /**
   * @param {KDAudioClockEvent | string} event - Either the `KDAudioClockEvent` or the `string` unique identifer associated with the event.
   * @returns `true` if the clock is currently managing the event.
   */
  hasEvent: (event: KDAudioClockEvent | string) => boolean;

  /**
   * @returns An array `KDAudioClockEvent[]` holding all events currently being managed by the clock,
   * regardless of whether they are currently queued or not.
   */
  getEvents: () => KDAudioClockEvent[];

  /**
   * @returns An array `KDAudioClockEvent[]` holding all events currently in the event queue.
   */
  getEventQueue: () => KDAudioClockEvent[];

  /**
   * @returns An array `[KDAudioClockEvent, string][]` representing the internal map holding
   * managed events and their uid associations.
   */
  getEventUidEntries: () => [KDAudioClockEvent, string][];

  /**
   * @returns The `AudioContext` being used by the clock. Either the context passed as a constructor
   * parameter, or the internally created context if one was not provided.
   */
  getContext: () => AudioContext;

  /**
   * @returns The `context.currentTime` value or `null` if the clock does not currently have
   * a context.
   */
  getCurrentTime: () => number | null;

  /**
   * Apply a timestretch value to an array of `KDAudioClockEvent`. If the event is a looping event,
   * the initial loop interval will be multiplied by the `ratio` value. Default is `1`.
   * Applied to future ticks as well as any currently scheduled ticks. Alternatively, this value
   * can be applied to each individual event via `event.timeStretch(ratio)`.
   * @param {KDAudioClockEvent[] | KDAudioClockEvent} events - Array holding target `KDAudioClockEvent` instances.
   * @param {number} ratio - The multiplier to be applied to each events time interval.
   * @example
   *  const clock = new KDAudioClock();
   *  clock.start();
   *
   *  // clock will begin ticking every second
   *  clock.setInterval(() => console.log(clock.getCurrentTime()), 1000);
   *
   *  // clock will update all events' timeStretch value to `2`, doubling the interval of the event above
   *  clock.timeStretch(clock.getEvents(), 2);
   *
   *  // clock will update all events' timeStretch value to `0.5`
   *  // this is applied to the root interval time, not the currently doubled interval,
   *  // meaning the event will tick every half second
   *  clock.timeStretch(clock.getEvents(), 0.5);
   *
   *  // now the event will tick at the initial interval time, every second
   *  clock.timeStretch(clock.getEvents(), 1);
   */
  timeStretch: (
    events: KDAudioClockEvent[] | KDAudioClockEvent,
    ratio: number
  ) => void;

  /**
   * Sync an array of `KDAudioClockEvent` to `context.currentTime` plus the `delayInMs` value.
   * @param {KDAudioClockEvent[] | KDAudioClockEvent} events - Array holding target `KDAudioClockEvent` instances.
   * @param {number} [delayInMs] - Wait for this duration before syncing. Default is `0`.
   */
  sync: (
    events: KDAudioClockEvent[] | KDAudioClockEvent,
    delayInMs?: number
  ) => void;

  /**
   * Suspend events keeping them from being queued without deleting them.
   * @param {KDAudioClockEvent[] | KDAudioClockEvent} events - Array holding target `KDAudioClockEvent` instances.
   */
  suspend: (events: KDAudioClockEvent[] | KDAudioClockEvent) => void;

  /**
   * Delete events, removing them from the queue and preparing them for garbage collection.
   * @param {KDAudioClockEvent[] | KDAudioClockEvent} events - Array holding target `KDAudioClockEvent` instances.
   * @returns `undefined`
   */
  delete: (events: KDAudioClockEvent[] | KDAudioClockEvent) => undefined;

  /**
   * Set the defalt tolerance levels that will be used when new events are created without an explicit
   * tolerance. The tolerance is how early an event will be allowed to fire before the scheduled deadline
   * and how late the event will be allowed to fire before being skipped altogether.
   * The default default tolerance is `{early: 0.001, late: 0.1 }`.
   * @param {{early?: number; late?: number}} tolerance - Object holding `early` and `late` `number` values.
   */
  setTolerance: (tolerance: { early?: number; late?: number }) => void;

  /**
   * Get the current defalt tolerance levels that will be used when new events are created without an explicit
   * tolerance. The tolerance is how early an event will be allowed to fire before the scheduled deadline
   * and how late the event will be allowed to fire before being skipped altogether.
   * The default default tolerance is `{early: 0.001, late: 0.1 }`.
   * @returns Object `{early?: number; late?: number}` holding `early` and `late` `number` values.
   */
  getTolerance: () => {
    early: number;
    late: number;
  };

  /**
   * Set the internally referenced beats-per-minute for this clock instance. The default is `60`.
   */
  setBPM: (bpm: number) => void;

  /**
   * Get the internally referenced beats-per-minute for this clock instance. The default is `60`.
   */
  getBPM: () => number;

  /**
   * Set the internally referenced beat meter for this clock instance. The default is `4` (quarter note gets the beat).
   */
  setBeat: (beat: number) => void;

  /**
   * Get the internally referenced beat meter for this clock instance. The default is `4` (quarter note gets the beat).
   */
  getBeat: () => number;

  /**
   * Helper function to convert meter to milliseconds.
   * While you can use absolute time to control KDAudioClock, it also includes
   * an internal meter system. The internal bpm and beat defaults to `{bpm: 60, beat: 4}`
   * (60 beats-per-minute and the quarter note gets the beat). You can set the bpm and
   * beats when the instance is created or at a later time, and the `meter` method will use
   * those values along with the time signature values passed to it to compute the appropriate
   * duration in milliseconds
   * @param {number} beats - The number of beats to count (top number of the time signature).
   * @param {number} duration - Which note gets the beat (bottom number of the time signature).
   * @example
   *  const clock = new KDAudioClock();
   *
   *  // The default is bpm = 60, beat = 4. So 1/4 is 1000ms (60 quarter notes in a second).
   *  let note = clock.meter(1, 4);
   *
   *  // So 1/8 is 500ms.
   *  note = clock.meter(1, 8);
   *
   *  // And 3/16 is 750ms.
   *  note = clock.meter(3, 16);
   *
   *  // If we change the bpm to 120, 1/4 becomes 500ms (120 quarter notes in a second).
   *  clock.setBPM(120);
   *  note = clock.meter(1, 4);
   *
   *  // Then, if we change the beat to 8, 1/4 again becomes 1000ms because 1/8 is now 500ms.
   *  // (120 eighth notes in a second, or 60 quarter notes in a second).
   *  clock.setBeat(8);
   *  note = clock.meter(1, 4);
   */
  meter: (beats: number, duration: number) => number;

  /** Destroy this particular instance and make it available for garbage collection. */
  destroy: () => undefined;

  /**
   * This is used internally and should not be called directly.
   */
  _insertEvent: (event: KDAudioClockEvent) => boolean;

  /**
   * This is used internally and should not be called directly.
   */
  _removeEvent: (event: KDAudioClockEvent) => boolean;

  /**
   * This is used internally and should not be called directly.
   */
  _deleteEventFromManager: (event: KDAudioClockEvent) => boolean;

  /**
   * A class for creating timed events using the web audio clock.
   * Includes internal event management and a simple but versatile API.
   * Originally based on WAAClock by @sebpiq(https://github.com/sebpiq/WAAClock).
   * @param {KDAudioClockEventOptions} [opts] - Object holding `context` and `tolerance` default values.
   * @param {AudioContext} [opts.context] - If an external audio context should be used, this is where it is
   * passed to `KDAudioClock`. Otherwise, the instance will create and manage its own audio context, which can
   * be accessed via `new KDAudioClock().getContext()`.
   * @param {{early?: number; late?: number}} [opts.tolerance] - Object `{early?: number; late?: number}` holding default
   * `early` and `late` `number` values. Will default to `{early: 0.001, late: 0.1 }` if this is left empty. These values
   * describe the margin of error for dropping an event. If the scheduled event attempts to fire within the tolerance window,
   * the `onTick` callback is called. Otherwise the `onMissed` callback is called.
   * @param {number} [opts.bpm] - Beats per minute used by the `meter` helper method to calculate metered time. Default is `60`.
   * @param {number} [opts.beat] - The note division that is assigned to the beat. Used by the `meter` helper method to calculate metered time. Default is `4` (quarter note).
   * @example
   *  const clock = new KDAudioClock();
   *  clock.start();
   *  clock.setInterval(() => console.log( clock.getCurrentTime() ), 1000);
   */
  constructor(opts?: {
    context?: AudioContext;
    tolerance?: { early: number; late: number };
    bpm?: number;
    beat?: number;
  }) {
    let destroyed = false;

    const defaults = {
      tolerance: {
        early: 0.001,
        late: 0.1,
      },
      bpm: 60,
      beat: 4,
    };

    const self = {
      uidmanager: KDUIDManager(),
      context: opts?.context || null,
      clockNode: null,
      tolerance: {
        early: opts?.tolerance?.early || defaults.tolerance.early,
        late: opts?.tolerance?.late || defaults.tolerance.late,
      },
      bpm: opts?.bpm || defaults.bpm,
      beat: opts?.beat || defaults.beat,
      /**
       * These are queued events and may not actually contain all
       * active events at a given time. Use `state.uidmanager.keys()`
       * to retrieve all retained events, and use this property
       * `state.events` to retrieve only currently queued events.
       */
      events: [],
      /**
       * Boolean value that describes if the audio context is currently running. Will be
       * `false` if the context is disconnected, suspended, or undefined.
       */
      isRunning: false,
      /**
       * Only describes if the clock has been paused.
       */
      isPaused: false,
    };

    const _self = {
      /**
       * Guard against an event with undefined properties such as if you were to `stop`
       * the clock after `window.setTimeout` is instantiated but before it fires.
       * In that case, the event itself may still exist, but you can tell if
       * `stop` has been called by checking if the `isSuspended` property exists.
       * If the event is still being managed, `isSuspended` will be either `true` or `false`.
       * If `stop` has been called on the clock, `isSuspended` for each event will be `undefined`
       * assuming the event itself is not yet `undefined`.
       */
      scheduleGuard: (event: unknown) => {
        if (destroyed) return;
        const noEvent = !event;
        const isClockEvent = event instanceof KDAudioClockEvent;
        const isSuspended = event['isSuspended'];
        const deletedEvent = isClockEvent && isSuspended() === undefined;
        const guarded = noEvent || deletedEvent;
        return guarded;
      },

      start: (ctx?: AudioContext) => {
        if (destroyed) return;

        if (self.isRunning === true) {
          console.warn('This `KDAudioClock` instance is already running.');
          return;
        }

        /**
         * If current context isn't valid, we're stopped so use the ctx param,
         * opts context, or create a new one.
         */
        if (!self?.context?.state) {
          const setupAudioContext = (
            context?: AudioContext
          ): AudioContext | null => {
            /**
             * Check if a valid audio context was passed as a param.
             */
            const guards = [
              typeof context === 'object',
              typeof context?.currentTime === 'number',
              typeof context?.state === 'string' && context?.state !== 'closed',
              context?.hasOwnProperty('close'),
            ];
            const [isObject, hasTime, hasState, hasClose] = guards;
            const isValidContext = isObject && hasTime && hasState && hasClose;

            /** If the param is a valid context, just return it. */
            if (isValidContext) {
              return context;
            }

            /** Otherwise try to create a new one. */
            try {
              return new AudioContext();
            } catch (e) {
              console.error('Unable to create AudioContext.', e);
              return;
            }
          };

          self.context = setupAudioContext(ctx || opts?.context);
        }

        if (self.context) {
          /**
           * `createScriptProcessor` is supposed to be deprecated, so eventually should move to audio worklet processor instead.
           * But mobile safari doesn't support audio worklet processor right now (Nov-2020) and everything
           * still supports `createScriptProcessor` so we'll wait to remove it.
           *
           * Maybe add worklet processor and have both options available.
           */
          const tickWithCreateScriptProcessor = () => {
            const bufferSize = 256;

            const ctx = self.context;
            self.clockNode = ctx.createScriptProcessor(bufferSize, 1, 1);

            const node = self.clockNode;
            node.connect(ctx.destination);
            node.onaudioprocess = () => process.nextTick(() => _self.tick());
          };

          tickWithCreateScriptProcessor();

          self.isRunning = true;
          self.isPaused = false;
        }

        return self?.context?.resume();
      },

      stop: () => {
        if (destroyed) return;

        _self.pause(true);

        const keys = Array.from(self.uidmanager.keys());
        keys.forEach((event: KDAudioClockEvent) => event.delete());

        return self?.context?.close().then(() => {
          self.context = null;
        });
      },

      pause: (stopped?: boolean) => {
        if (destroyed) return;

        self.isRunning = false;
        self.isPaused = stopped ? false : true;

        if (self.clockNode) {
          self.clockNode.disconnect();
          self.clockNode = null;
        }

        return self?.context?.suspend();
      },

      tick: () => {
        if (destroyed || !self.context) return;
        let event: KDAudioClockEvent = self.events.shift();
        while (
          event?.get?.nextDeadline()?.earliest <= self.context.currentTime
        ) {
          event._execute();
          event = self.events.shift();
        }
        if (event) self.events.unshift(event);
      },

      suspend: (events: KDAudioClockEvent[] | KDAudioClockEvent) => {
        if (destroyed) return;
        if (Array.isArray(events)) {
          events.forEach((event) => event.suspend());
        } else {
          events.suspend();
        }
      },

      delete: (events: KDAudioClockEvent[] | KDAudioClockEvent) => {
        if (destroyed) return;
        if (Array.isArray(events)) {
          events.forEach((event) => event.delete());
        } else {
          events.delete();
        }
        return undefined;
      },

      createEvent: (opts: KDAudioClockEventOptions, deadline: number) => {
        if (destroyed) return;

        const optsNoTolerance = !opts.hasOwnProperty('tolerance');
        const optsNoEarly = !opts.tolerance?.hasOwnProperty('early');
        const optsNoLate = !opts.tolerance?.hasOwnProperty('late');

        if (optsNoTolerance) opts['tolerance'] = self.tolerance;
        if (optsNoEarly) opts.tolerance['early'] = self.tolerance.early;
        if (optsNoLate) opts.tolerance['late'] = self.tolerance.late;

        return new KDAudioClockEvent(this, opts, deadline);
      },

      insertEvent: (event: KDAudioClockEvent) => {
        if (destroyed) return;

        const index = _self.indexByTime(event.get.nextDeadline().earliest);
        self.events.splice(index, 0, event);

        const noEventUID = !self.uidmanager.hasUIDFor(event);
        if (noEventUID) self.uidmanager.generateUIDFor(event);

        return self.events.includes(event);
      },

      removeEvent: (event: KDAudioClockEvent) => {
        if (destroyed) return;

        const index = self.events.indexOf(event);
        if (index !== -1) self.events.splice(index, 1);
        return !self.events.includes(event);
      },

      deleteEventFromManager: (event: KDAudioClockEvent) => {
        if (destroyed) return;

        const hasEvent = self.uidmanager.hasUIDFor(event);
        if (hasEvent) self.uidmanager.deleteUIDFor(event);
        return !hasEvent;
      },

      hasEvent: (event: KDAudioClockEvent | string) => {
        if (destroyed) return;

        const isString = typeof event === 'string';
        if (isString) event = self.uidmanager.getKeyFor(event as string);
        return self.events.indexOf(event) !== -1;
      },

      indexByTime: (deadline: number) => {
        if (destroyed) return;

        let low = 0;
        let mid = 0;
        let high = self.events.length;

        while (low < high) {
          mid = Math.floor((low + high) / 2);
          const event = self.events[mid];
          const early = event?.get?.nextDeadline()?.earliest < deadline;
          if (early) low = mid + 1;
          else high = mid;
        }

        return low;
      },

      setTolerance: (tolerance: { early: number; late: number }) => {
        if (destroyed) return;
        if (typeof tolerance !== 'object') return;

        const hasEarly = tolerance.hasOwnProperty('early');
        const hasLate = tolerance.hasOwnProperty('late');

        if (hasEarly) self.tolerance.early = tolerance.early;
        if (hasLate) self.tolerance.late = tolerance.late;
      },

      schedule: (
        event:
          | KDAudioClockEventOptions
          | KDAudioClockEvent
          | KDAudioClockEvent[],
        deadline?: number
      ) => {
        if (destroyed) return;

        if (!self.context || !self.isRunning) {
          console.warn('make sure to start the clock');
          return;
        }

        const invalidEvent = _self.scheduleGuard(event);
        if (invalidEvent) {
          console.warn('event does not exist');
          return;
        }

        const deadlineIsSafe =
          typeof deadline === 'number' &&
          !Number.isNaN(deadline) &&
          Number.isFinite(deadline) &&
          deadline <= Number.MAX_SAFE_INTEGER &&
          deadline >= Number.MIN_SAFE_INTEGER;

        const _deadline = deadlineIsSafe ? deadline : self.context.currentTime;

        /**
         * If an actual existing event is passed as the `event` param, use it.
         * Otherwise it should be an event options object, so parse it and
         * register a new event.
         */
        if (event.constructor === KDAudioClockEvent) {
          event.schedule(deadline);
          return event;
        } else if (Array.isArray(event)) {
          event.forEach((event) => {
            if (event.constructor === KDAudioClockEvent) {
              event.schedule(deadline);
            }
          });
          return event;
        } else {
          const ev = event as KDAudioClockEventOptions;

          if (
            /**
             * Delay >= 0, no interval, no repetitions.
             * Assume 1 repetition.
             */
            typeof ev?.delay === 'number' &&
            !ev.loop?.interval &&
            !ev.loop?.repetitions
          ) {
            ev.loop = { repetitions: 1 };
          } else if (
            /**
             * No delay, interval >= 0, no repetitions.
             * Assume infinite repetitions.
             */
            !ev?.delay &&
            typeof ev?.loop?.interval === 'number' &&
            !ev.loop?.repetitions
          ) {
            ev.loop.repetitions = Infinity;
          }

          const infiteDelay = ev?.delay === Infinity;
          const noDelayOrLoop = ev?.delay === undefined && !ev?.loop;
          const zeroDelayWithInfiniteRepetitions =
            !ev?.delay &&
            !ev?.loop?.interval &&
            ev?.loop?.repetitions === Infinity;

          /**
           * Guard against unwanted infinite loops.
           */
          if (infiteDelay || zeroDelayWithInfiniteRepetitions) {
            console.warn('delay and/or loop repetitions must not be infinite');
            return;
          }

          /**
           * Guard against zero valid parameters.
           */
          if (noDelayOrLoop) {
            console.warn(
              'must set one of delay, loop.interval, or loop.repetitions'
            );
            return;
          }

          /**
           *  If delay is set, always use delay as wait time.
           *  To wait for the interval time before the first tick,
           *  leave delay unset or set to NaN.
           *  A delay time of 0 is actually limited to a minimum of 5ms.
           */
          const getDelay = () => {
            if (typeof ev?.delay === 'number' && !Number.isNaN(ev?.delay))
              return ev.delay / 1000;
            if (
              typeof ev?.loop?.interval === 'number' &&
              !Number.isNaN(ev?.loop?.interval)
            )
              return ev.loop.interval / 1000;
            return 0;
          };

          let interval = getDelay();
          interval = interval >= 0.05 ? interval : 0.005;

          let evt = _self.createEvent(ev, _deadline + interval);

          const uid = self.uidmanager.generateUIDFor(evt);
          evt._setUid(uid);
          evt.updateWithInterval(interval * 1000);

          return evt;
        }
      },

      setTimeout: (
        callback: (ev: KDAudioClockEvent) => void,
        delayInMs: number
      ) => {
        if (destroyed) return;
        return _self.schedule({
          delay: delayInMs,
          loop: { repetitions: 1 },
          onComplete: callback,
        });
      },

      setInterval: (
        callback: (ev: KDAudioClockEvent) => void,
        intervalInMs: number
      ) => {
        if (destroyed) return;
        return _self.schedule({
          loop: { interval: intervalInMs },
          onTick: callback,
        });
      },

      score: (
        events: [number, (event: KDAudioClockEvent) => void][]
      ): { break: () => void } => {
        if (destroyed) return;

        let breaker = false;

        const handleEvent = () => {
          if (destroyed || breaker || !events?.length) return;

          const [waitDuration, callback] = events.shift();

          _self.setTimeout((ev) => {
            if (destroyed || breaker) return;
            callback(ev);
            if (events?.length > 0) handleEvent();
          }, waitDuration);
        };

        if (events?.length > 0) handleEvent();

        return {
          break: () => {
            breaker = true;
          },
        };
      },

      createScoredEvent: (
        delayInMs: number,
        callback: (event: KDAudioClockEvent) => void
      ): [number, (event: KDAudioClockEvent) => void] => {
        if (destroyed) return;
        return [delayInMs, callback];
      },

      sync: (
        events: KDAudioClockEvent[] | KDAudioClockEvent,
        delay: number = 0
      ) => {
        if (destroyed) return;
        if (!self.context) return;

        const deadline = self.context.currentTime + delay / 1000;

        if (Array.isArray(events)) {
          events.forEach((event) => event.schedule(deadline));
        } else {
          events.schedule(deadline);
        }
      },

      timeStretch: (
        events: KDAudioClockEvent[] | KDAudioClockEvent,
        ratio: number
      ) => {
        if (destroyed) return;
        if (Array.isArray(events)) {
          events.forEach((event) => event.timeStretch(ratio));
        } else {
          events.timeStretch(ratio);
        }
      },

      meter: (beats: number, duration: number) => {
        if (destroyed) return;
        return beats * (60 / self.bpm) * 1000 * (self.beat / duration);
      },

      destroy: () => {
        if (destroyed) return;
        _self.stop();
        Object.keys(self).forEach((key) => (self[key] = undefined));
        Object.keys(_self).forEach((key) => (_self[key] = undefined));
        Object.keys(this).forEach((key) => {
          Object.defineProperty(this, key, {
            value: undefined,
          });
        });

        destroyed = true;
        return undefined;
      },
    };

    /** Public */
    this.start = (ctx) => _self.start(ctx);
    this.resume = () => _self.start();
    this.stop = () => _self.stop();
    this.pause = () => _self.pause();
    this.isRunning = () => self.isRunning;
    this.isPaused = () => self.isPaused;
    this.getDefaults = () => defaults;

    this.getEventFor = (eventID) => self.uidmanager.getKeyFor(eventID);
    this.getUIDFor = (event) => self.uidmanager.getUIDFor(event);
    this.hasEvent = (event) => _self.hasEvent(event);
    this.getEvents = () => Array.from(self.uidmanager.keys());
    this.getEventQueue = () => Array.from(self.events);
    this.getEventUidEntries = () => Array.from(self.uidmanager.entries());

    this.getContext = () => self.context;
    this.getTolerance = () => self.tolerance;
    this.setTolerance = (tolerance) =>
      _self.setTolerance({
        early: tolerance.early || self.tolerance.early,
        late: tolerance.late || self.tolerance.late,
      });
    this.getCurrentTime = () =>
      self?.context ? self.context.currentTime : null;

    this.setTimeout = (callback, delayInMs) =>
      _self.setTimeout(callback, delayInMs) as KDAudioClockEvent;
    this.setInterval = (callback, intervalInMs) =>
      _self.setInterval(callback, intervalInMs) as KDAudioClockEvent;
    this.schedule = (opts) => _self.schedule(opts) as KDAudioClockEvent;
    this.clearInterval = (event) => event.delete();

    this.timeStretch = (events, ratio) => _self.timeStretch(events, ratio);
    this.sync = (events, delayInMs) => _self.sync(events, delayInMs);
    this.suspend = (events) => _self.suspend(events);
    this.delete = (events) => _self.delete(events);

    this.setBPM = (bpm) => (self.bpm = bpm);
    this.getBPM = () => self.bpm;
    this.setBeat = (beat) => (self.beat = beat);
    this.getBeat = () => self.beat;

    this.createScoredEvent = (delayInMs, callback) =>
      _self.createScoredEvent(delayInMs, callback);
    this.score = (events) => _self.score(events);
    this.meter = (beats, duration) => _self.meter(beats, duration);
    this.destroy = () => _self.destroy();

    /** Private */
    this._insertEvent = (event) => _self.insertEvent(event);
    this._removeEvent = (event) => _self.removeEvent(event);
    this._deleteEventFromManager = (event) =>
      _self.deleteEventFromManager(event);

    /** Init */
    Object.keys(this).forEach((key) => {
      const split = key.split('_');
      const pvt = split.length > 1 && split.shift() === '';
      Object.defineProperty(this, key, {
        value: this[key],
        writable: false,
        enumerable: !pvt,
      });
    });
  }
}

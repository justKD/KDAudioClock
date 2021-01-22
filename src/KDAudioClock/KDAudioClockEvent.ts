/**
 * @file KDAudioClockEvent.ts
 * @version 1.0.7
 * @author Cadence Holmes
 * @copyright Cadence Holmes 2020
 * @license MIT
 * @fileoverview `export const KDAudioClockEvent`
 * This class represents a timed event controlled by `KDAudioClock`. While instances can be
 * retrieved and managed, it should only be instantiated internally by `KDAudioClock`.
 */

import { KDAudioClock } from './KDAudioClock';

/**
 * Available options that can be passed to `KDAudioClock` when scheduling a new event.
 */
export type KDAudioClockEventOptions = {
  /**
   * Time in ms to wait before the first tick. If this is empty, the clock will look for the `loop` option interval instead.
   * If it is explicitly set to `0`, the event will tick as soon as it is initialized.
   */
  delay?: number;
  /**
   * Describe loop time and repetitions.
   */
  loop?: {
    /**
     * The interval in ms to wait between each tick. If there is a `delay` time set, the first tick
     * will occur after `delay` time and each subsequent tick will occur after `loop.interval` time.
     * If `delay` is left empty, the first tick will occur after `loop.interval` time.
     */
    interval?: number;
    /**
     * The number of times to repeat the loop. Will default to `1` if `loop` is left empty.
     * Will default to `Infinity` if `loop.interval` is set but `loop.repetitions` is left empty.
     * Must be empty or greater than `0`. Anything less than `1` will default to `Infinity`.
     */
    repetitions?: number;
  };
  /**
   * Describe the earliest and latest times to allow a tick.
   */
  tolerance?: {
    /**
     * The event will attempt to fire at the scheduled deadline minus this value.
     */
    early?: number;
    /**
     * If the event attempts to fire after the scheduled deadline plus this value,
     * it will fail to fire, call its `onMissedDealine` callback, and attempt to
     * fire on the next tick.
     */
    late?: number;
  };
  /**
   * Called on every successful tick.
   */
  onTick?: (event: KDAudioClockEvent) => void;
  /**
   * Called when the number of intended repetitions is reached. If the `loop.repetitions` value
   * is `Infinity`, this will never be called.
   */
  onComplete?: (event: KDAudioClockEvent) => void;
  /**
   * Called if a looping event is deleted (not suspended) before it has reached its intended
   * number of repetitions, including if the `loop.repetitions` value is `Infinity`.
   */
  onAborted?: (event: KDAudioClockEvent) => void;
  /**
   * Called if a tick misses its latest deadline.
   */
  onMissed?: (event: KDAudioClockEvent) => void;
};

/**
 * This class represents a timed event controlled by `KDAudioClock`. While instances can be
 * retrieved and managed, it should only be instantiated internally by `KDAudioClock`.
 */
export class KDAudioClockEvent {
  /**
   * This will suspend scheduled deadlines, but the event and its options will be retained by the
   * owning `KDAudioClock`.
   * @example
   *  const clock = new KDAudioClock();
   *  clock.start();
   *
   *  // in one second, tick once
   *  const event = clock.setTimeout(doIt, 1000);
   *
   *  // maybe something happens before that one second and we need to stop the event from firing,
   *  // but we want to use it later
   *
   *  // suspendinging the event removes it from the queue, but it and its options all still exist
   *  // and are still being managed by the clock
   *  event.suspend();
   *
   *  // and some time later...
   *
   *  // ... we can reschedule the event - this is the same as starting a new event, but it retains
   *  // the same options (that we might have operated on) as well as the original unique identifier
   *  // so in this case, the event will fire 1 second after being rescheduled
   *  event.reschedule(clock.getCurrentTime());
   */
  suspend: () => void;

  /**
   * Schedule the next tick time for a specific deadline. This does not reset the elapsed tick count,
   * so an event with a max number of loops will retain its current loop count.
   * @param {number} deadline - The target clock time in seconds.
   */
  schedule: (deadline: number) => void;

  /**
   * Schedule the next tick for the `currentTime` plus the `delayInMs`.
   * @param {number} [delayInMs] - Duration in ms added to the `currentTime` and passed to the scheduler.
   */
  sync: (delayInMs?: number) => void;

  /**
   * Reschedule the next tick time for a specific deadline in seconds. This resets the elapsed tick count, which
   * will restart a looping event with a max number of loops.
   * @param {number} [deadline] - The target clock time in seconds. Default is `context.currentTime`.
   */
  reschedule: (deadline?: number) => void;

  /**
   * Completely delete the event and all internal references to `KDAudioClock`.
   */
  delete: () => undefined;

  /**
   * If this event is a looping event, the initial loop interval will be multiplied by the `ratio`
   * value. Default is `1`. Applied to future ticks as well as any currently scheduled ticks.
   * @param {number} ratio - Multiply the loop interval by this value.
   * @example
   *  const clock = new KDAudioClock();
   *  clock.start();
   *
   *  // clock will begin ticking every second
   *  const event = clock.setInterval(() => console.log(clock.getCurrentTime()), 1000);
   *
   *  // update timeStretch value to `2`, doubling the interval of the event
   *  event.timeStretch(2);
   *
   *  // update timeStretch value to `0.5`
   *  // this is applied to the root interval time, not the currently doubled interval,
   *  // meaning the event will tick every half second
   *  event.timeStretch(0.5);
   *
   *  // now the event will tick at the initial interval time, every second
   *  event.timeStretch(1);
   */
  timeStretch: (ratio: number) => void;

  /**
   * An object holding getters for event options.
   * @property clock - Returns the instance of `KDAudioClock` that created this event.
   * @property uid - Returns the unique identifier `string` assigned to this event.
   * @property nextDeadline - Returns an object holding `scheduled`, `earliest`, and `latest` deadline values.
   * @property tolerance - Returns an object holding `early` and `late` tolerance values.
   * @property loop - Returns an object holding `initialInterval`, `currentInterval`, `repetitions`, `elapsedTickCount`, and `timeStretch` values.
   * @property callbacks - Returns an object holding values for `onTick`, `onComplete`, `onAborted`, and `onMissed` callback functions.
   */
  get: {
    clock: () => KDAudioClock;
    uid: () => string;
    nextDeadline: () => { scheduled: number; earliest: number; latest: number };
    tolerance: () => { early: number; late: number };
    loop: () => {
      initialInterval: number;
      currentInterval: number;
      repetitions: number;
      elapsedTickCount: number;
      timeStretch: number;
    };
    callbacks: () => {
      onTick: (event: KDAudioClockEvent) => void;
      onComplete: (event: KDAudioClockEvent) => void;
      onAborted: (event: KDAudioClockEvent) => void;
      onMissed: (event: KDAudioClockEvent) => void;
    };
  };

  /**
   * @returns A boolean describing whether or not this event is a looping event.
   * This will return `true` as long as the current number of elapsed loops has not
   * exceeded the maximum number of loops.
   */
  isLooping: () => boolean;

  /**
   * @returns A boolean describing whether or not this event is suspended.
   */
  isSuspended: () => boolean;

  /**
   * Set a new interval.
   */
  updateWithInterval: (intervalInMs: number) => void;

  /**
   * This is used internally and should not be called directly.
   */
  _execute: () => void;

  /**
   * This is used internally and should not be called directly.
   */
  _setUid: (uid: string) => void;

  _setOnComplete: (callback: () => void) => void;

  constructor(
    clock: KDAudioClock,
    opts: KDAudioClockEventOptions,
    deadline: number
  ) {
    let deleted = false;

    const self = {
      clock: clock,
      uid: null,
      suspended: false,
      deadline: {
        scheduled: null,
        earliest: null,
        latest: null,
      },
      tolerance: {
        early: opts.tolerance.early,
        late: opts.tolerance.late,
      },
      loop: {
        initialInterval: null,
        currentInterval: null,
        repetitions: opts.loop.repetitions,
        elapsedTickCount: 0,
        timeStretch: 1,
      },
      callbacks: {
        onTick: opts.onTick || null,
        onComplete: opts.onComplete || null,
        onAborted: opts.onAborted || null,
        onMissed: opts.onMissed || null,
      },
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
      scheduleGuard: () => {
        if (deleted) return;
        const noEvent = self.suspended === undefined;
        return noEvent;
      },

      updateWithInterval: (intervalInMs: number) => {
        if (deleted) return;
        self.loop.initialInterval = intervalInMs;
        self.loop.currentInterval = intervalInMs * self.loop.timeStretch;
        const dl = self.deadline.scheduled + self.loop.currentInterval / 1000;
        if (!self.clock.hasEvent(this)) _self.schedule(dl);
      },

      suspend: () => {
        if (deleted) return;
        self.clock._removeEvent(this);
        self.suspended = true;
      },

      destroy: () => {
        if (deleted) return;
        Object.keys(self).forEach((key) => (self[key] = undefined));
        Object.keys(_self).forEach((key) => (_self[key] = undefined));
        Object.keys(this).forEach((key) => {
          Object.defineProperty(this, key, {
            value: undefined,
          });
        });
      },

      delete: () => {
        if (deleted) return;

        /** Handle callback */
        const aborted = _self.isLooping() && self.callbacks.onAborted;
        if (aborted) self.callbacks.onAborted(this);
        else if (self.callbacks.onComplete) self.callbacks.onComplete(this);

        _self.suspend();
        self.clock._deleteEventFromManager(this);
        _self.destroy();

        deleted = true;
        return undefined;
      },

      isLooping: () => {
        if (deleted) return;
        return self.loop.elapsedTickCount < self.loop.repetitions;
      },

      schedule: (deadline: number, sync = false) => {
        if (deleted) return;

        const invalidEvent = _self.scheduleGuard();
        if (invalidEvent) {
          console.warn('event does not exist');
          return;
        }

        self.suspended = false;
        _self.update(deadline);

        const requeue = () => {
          if (self.clock.hasEvent(this)) self.clock._removeEvent(this);
          self.clock._insertEvent(this);
        };

        /**
         * Once the event is initially scheduled, we only need to reschedule/sync it
         * if this is called before execution.
         */
        if (sync) {
          requeue();
          return;
        }

        /**
         * Otherwise check to see if we're past the earliest deadline and execute.
         * If we're too early, put the event back in the queue..
         */
        const onTime = self.clock.getCurrentTime() >= self.deadline.earliest;
        if (onTime) _self.execute();
        else requeue();
      },

      sync: (delayInMs: number = 0) => {
        const dl = self.clock.getCurrentTime() + delayInMs / 1000;
        _self?.schedule(dl, true);
      },

      reschedule: (deadline?: number) => {
        if (deleted) return;
        const dl = deadline ? deadline : self.clock.getCurrentTime();
        self.loop.elapsedTickCount = 0;
        _self.schedule(dl, true);
      },

      update: (deadline: number) => {
        if (deleted) return;
        self.deadline.scheduled = deadline;
        self.deadline.latest = deadline + self.tolerance.late;
        self.deadline.earliest = deadline - self.tolerance.early;
      },

      timeStretch: (ratio: number) => {
        if (deleted) return;
        if (!_self.isLooping()) return;

        if (self.clock.hasEvent(this)) self.clock._removeEvent(this);

        const secToMs = (sec: number) => sec / 1000;
        const interval = self.loop.currentInterval;
        const old = self.deadline.scheduled - secToMs(interval);
        self.loop.timeStretch = ratio;
        self.loop.currentInterval = self.loop.initialInterval * ratio;

        /**
         * The new deadline is a function of the old deadline plus the new current interval.
         */
        let deadline = old + secToMs(self.loop.currentInterval);
        const time = self.clock.getCurrentTime();
        const earliest = deadline - self.tolerance.early;

        /**
         * If we've missed the window for executing on time,
         * increase the deadline until the next tick time.
         */
        if (time >= earliest) {
          const latest = deadline - self.tolerance.late;
          while (time <= latest) deadline += secToMs(self.loop.currentInterval);
        }

        _self.schedule(deadline);
      },

      tolerance: (tolerance: { early?: number; late?: number }) => {
        if (deleted) return;
        if (typeof tolerance === 'object') {
          const early = tolerance.hasOwnProperty('early');
          const late = tolerance.hasOwnProperty('late');
          if (early) self.tolerance.early = tolerance.early;
          if (late) self.tolerance.late = tolerance.late;
        }
        return self.tolerance;
      },

      execute: () => {
        if (deleted) return;
        if (!self.clock.isRunning() || self.suspended) return;

        self.clock._removeEvent(this);
        self.loop.elapsedTickCount++;

        /** Handle callbacks */
        const onTime =
          self.clock.getCurrentTime() >= self.deadline.earliest &&
          self.clock.getCurrentTime() <= self.deadline.latest;
        if (onTime && self.callbacks.onTick) {
          self.callbacks.onTick(this);
        } else if (self.callbacks.onMissed) {
          self.callbacks.onMissed(this);
        }

        /** Handle a case where the event is deleted in one of its callbacks. */
        if (deleted) return;

        if (self.loop.elapsedTickCount >= self.loop.repetitions) {
          _self.delete();
          return;
        }

        /**
         * Reschedule the event only if it is supposed to.
         */
        const readyChecks = [
          !self.clock.hasEvent(this),
          _self.isLooping(),
          !self.suspended,
        ];
        const [noEvent, isLooping, notSuspended] = readyChecks;
        const ready = noEvent && isLooping && notSuspended;
        const scheduled = self.deadline.scheduled;
        const dl = scheduled + self.loop.currentInterval / 1000;
        if (ready) _self.schedule(dl);
      },

      setUid: (uid: string) => {
        if (deleted) return;
        self.uid = uid;
      },

      setOnComplete: (callback: () => void) => {
        if (deleted) return;
        self.callbacks.onComplete = callback;
      },
    };

    /** Public */
    this.sync = (delayInMs) => _self?.sync(delayInMs);
    this.schedule = (deadline) => _self?.schedule(deadline);
    this.reschedule = (deadline) => _self?.reschedule(deadline);
    this.suspend = () => _self?.suspend();
    this.delete = () => _self?.delete();
    this.timeStretch = (ratio) => _self?.timeStretch(ratio);
    this.isLooping = () => _self?.isLooping();
    this.isSuspended = () => self?.suspended;
    this.updateWithInterval = (intervalInMs: number) =>
      _self?.updateWithInterval(intervalInMs);
    this.get = {
      clock: () => self?.clock,
      uid: () => self?.uid,
      nextDeadline: () => self?.deadline,
      tolerance: () => self?.tolerance,
      loop: () => self?.loop,
      callbacks: () => self?.callbacks,
    };

    /** Private */
    this._execute = () => _self?.execute();
    this._setUid = (uid) => _self?.setUid(uid);
    this._setOnComplete = (callback) => _self?.setOnComplete(callback);

    /** Init */
    Object.freeze(this.get);
    Object.keys(this).forEach((key) => {
      const split = key.split('_');
      const pvt = split.length > 1 && split.shift() === '';
      Object.defineProperty(this, key, {
        value: this[key],
        writable: false,
        enumerable: !pvt,
      });
    });
    _self?.schedule(deadline);
  }
}

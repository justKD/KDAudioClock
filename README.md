# KDAudioClock

##### v 1.0.7 | © justKD 2020 | MIT License

#

This class lets you schedule asynchronous events using the audio hardware clock.

`KDAudioClock` creates and manages timed events, which are each assigned unique identifiers. It also includes event syncing, time stretching, and a scoring syntax for creating a repeatable series of events.

It's based on [WAAClock](https://github.com/sebpiq/WAAClock) by [@sebpiq](https://github.com/sebpiq), which is itself based on the ideas put forth by Chris Wilson in his article [A Tale of Two Clocks](https://www.html5rocks.com/en/tutorials/audio/scheduling/).

## Demo

[KDAudioClock Examples and Documentation](http://url.com/)

## Basic Use

#

#### `start()`

Create a new audio context and start the audio clock.

```
const clock = new KDAudioClock();
clock.start();
```

#### `stop()`

Stops the audio clock and deletes all managed events.

```
clock.stop();
```

#### `pause()`

Suspends the audio clock and pauses all managed events.

```
clock.pause();
```

#### Start, stop, and pause return promises.

```
clock.start().then(f);
clock.stop().then(f);
clock.pause().then(f);
```

#### `setTimeout(f, t)`

Emulates `window.setTimeout`.

```
clock.setTimeout(() => {
  console.log("tick after 2 sec");
}, 2000)
```

#### `setInterval(f, t)`

Emulates `window.setInterval`.

```
clock.setInterval(() => {
  console.log("tick every 2 sec");
}, 2000)
```

#### `clearInterval(e)`

Emulates `window.clearInterval`.

```
const ev = clock.setInterval(f, t);
// later
clock.clearInterval(ev);
```

`KDAudioClockEvent` callback functions return the event itself.

```
clock.setInterval((ev) => {
  const loop = ev.get.loop();
  const ticks = loop.elapsedTickCount;
  if (ticks >= 5) ev.delete();
}, 2000)
```

## Extended Use

#

#### `schedule(opts)`

Schedule any other timed event.

```
clock.schedule({
    loop: {
        interval: 2000,
        repetitions: 5,
    },
    onTick: (ev) => console.log("tick"),
    onComplete: (ev) => console.log("done"),
    onAborted: (ev) => console.log("abort"),
    onMissed: (ev) => console.log("missed"),
});
```

`setTimeout` and `setInterval` are just using 'schedule' under the hood.

```
// Same as `clock.setTimeout`.
clock.schedule({
    delay: 500,
    onComplete: () => console.log("done"),
});
```

```
// Same as `clock.setInterval`.
clock.schedule({
    loop: {
        interval: 500,
        repetitions: Infinity,
    },
    onTick: () => console.log("tick"),
});
```

#### `sync(events)`

Sync the passed events to the current time.

```
const events = clock.getEvents();
clock.sync(events);
```

##### Tip: use `sync` every so often to counter drifting that may occur between simultaneous long running timers.

#

```
const timer1 = clock.setInterval(playSound1, 500);
const timer2 = clock.setInterval((ev)=>{
    playSound2();
    const ticks = ev.get.loop().elapsedTickCount;
    if (ticks >= 120) clock.sync(clock.getEvents());
}, 1000);
```

#### `timeStretch(events)`

Uniformly alter the interval of looping events.

```
const events = clock.getEvents();
clock.timeStretch(events, 2 );   // intervals are double their initial value
clock.timeStretch(events, 0.5 ); // intervals are half their initial value
clock.timeStretch(events, 1 );   // intervals are reset to their initial value
```

#### `meter()`

Convert metered durations into time in milliseconds.

```
/**
 * Clock set to 60 beats per minute
 * and the quarter note gets the beat.
 */
clock.setBPM(60);
clock.setBeat(4);

/**
 * Duration in ms for one quarter note.
 */
const interval = clock.meter(1, 4);
clock.setInterval(f, interval);
```

#### `setBPM(bpm)`

This only affects how the helper method `clock.meter` calculates time.
Default is `60`.

```
clock.setBPM(60);
const tickEverySecond = clock.meter(1, 4);
const tickEveryHalfSecond = clock.meter(1, 8);
const eighthNoteTriplet = clock.meter(1, 12);

clock.setBPM(120);
const tickEveryHalfSec = clock.meter(1, 4);
const tickEveryQuarterSec = clock.meter(1, 8);
const sixteenthNoteTriplet = clock.meter(1, 12);
```

#### `setBeat(beat)`

This only affects how the helper method `clock.meter` calculates time.
Default is `4` (quarter note).

```
/**
 * Most applications probably don't need to
 * set the beat independently, but it can
 * be useful if correlating these durations
 * with notated rhythms. Just remember that
 * setting the beat will change how 'meter'
 * is calculated in relation to the BPM.
 */
clock.setBPM(60);
clock.setBeat(8);

const tickEverySecond = clock.meter(1, 8);
const tickEveryHalfSecond = clock.meter(1, 16);
```

#### `score(scoredEvents)`

Run a sequence of events in order, each firing after the end of the previous event plus the wait duration.
_This provides a more readable syntax to replace nesting calls to `clock.setTimeout`_.

```
// Helper method to create scored events.
const note = clock.createScoredEvent;

// Pass an array of scored events.
clock.score([
    note(0, (ev) => {
        // call this right away
        console.log( ev.get.uid() );
    }),
    note(1000, (ev) => {
        // after 1 second
        console.log( ev.get.uid() );
    }),
    note(500, (ev) => {
        // after another 500ms
        console.log( ev.get.uid() );
    }),
]);
```

##### Loop scores by assigning it to a variable and calling itself.

#

```
const meter = clock.meter;
const note = clock.createScoredEvent;
cosnt runScore = () => {
    clock.score([
        note(0, f),
        note(meter(1, 4), f),
        note(meter(1, 8), f),
        note(meter(1, 4), f),
        note(meter(1, 8), f),
        note(meter(1, 16), f),
        note(meter(1, 16), f),
        note(meter(1, 4), f),
        note(0, runScore),
    ]);
};

runScore();
```

##### Exit a score with `score.break()`.

#

```
const meter = clock.meter;
const note = clock.createScoredEvent;

let count = 0;
let maxLoops = 2;
let quarterNote = clock.meter(1, 4);

let runScore = () => {
    const maxed = count++ >= maxLoops;
    const score = clock.score([
        note(quarterNote, (ev) => {
            console.log('1');
        }),
        note(quarterNote, (ev) => {
            console.log('2');
            if (maxed) score.break();
        }),
        note(quarterNote, (ev) => {
            console.log('3');
        }),
        note(quarterNote, (ev) => {
            console.log('4');
            if (!maxed) runScore();
        }),
      ]);
    };

    runScore();
```

##### Create reusable "measures" and add them to a score with the spread operator.

#

```
const meter = clock.meter;
const note = clock.createScoredEvent;

const measureOne = [
    note(meter(1, 4), (ev) => {}),
    note(meter(1, 4), (ev) => {}),
];

const measureTwo = [
    note(meter(1, 8), (ev) => {}),
    note(meter(1, 8), (ev) => {}),
    note(meter(1, 8), (ev) => {}),
    note(meter(1, 8), (ev) => {}),
];

const measureThree = [
    note(meter(1, 4), (ev) => {}),
    note(meter(1, 8), (ev) => {}),
    note(meter(1, 8), (ev) => {}),
];

const runScore = () => {
    clock.score([
        ...measureOne,
        ...measureTwo,
        ...measureTwo,
        ...measureOne,
        ...measureThree,
        ...measureThree,
        note(0, runScore),
    ]);
};

runScore();
```

## API

#### KDAudioClock Constructor Parameters

```
interface KDAudioClockParams  {
    context?: AudioContext;
    tolerance?: {
        early?: number;
        late?: number;
    };
    bpm?: number;
    beat?: number
};

new KDAudioClock(opts?: KDAudioClockParams)
```

| Param        | Type                                 | Description                                                                                                                                                                                                                                                                                                                                                    |
| ------------ | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `context?`   | `AudioContext`                       | If an external audio context should be used, this is where it is passed to `KDAudioClock`. Otherwise, the instance will create and manage its own audio context, which can be accessed via `new KDAudioClock().getContext()`.                                                                                                                                  |
| `tolerance?` | `{ early?: number; late?: number; }` | Object holding default `early` and `late` tolerance values in seconds. Will default to `{early: 0.001, late: 0.1 }` if this is left empty. These values describe the margin of error for dropping an event. If the scheduled event attempts to fire within the tolerance window, the `onTick` callback is called. Otherwise the `onMissed` callback is called. |
| `bpm?`       | `number`                             | Beats per minute used by the `meter` helper method to calculate metered time. Default is `60`.                                                                                                                                                                                                                                                                 |
| `beat?`      | `number`                             | The note division that is assigned to the beat. Used by the `meter` helper method to calculate metered time. Default is `4` (quarter note).                                                                                                                                                                                                                    |

#### KDAudioClock Methods

| Method      | Type                                   | Description                                                                                                                                                                                                                                                                                                                                                |
| ----------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `start`     | `(ctx?: AudioContext) => Promise<any>` | Start the clock. Handles the first start as well as resuming a paused or stopped clock. Creates a new AudioContext if one doesn't already exist, otherwise uses the assigned or previously created context. Connects the audio node and begins processing ticks.                                                                                           |
| `stop`      | `() => Promise<any>`                   | Deletes all currently existing events managed by the clock, disconnects the clock audio node, closes the audio context and releases its internal reference. If a context was passed in the initial options, it will still be referenced by the options object, but a new context must be passed to the `start()` method since the original will be closed. |
| `pause`     | `() => Promise<any>`                   | Pauses the clock but retains existing events. Disconnects the clock audio node and suspends the audio context.                                                                                                                                                                                                                                             |
| `resume`    | `() => Promise<any>`                   | An alias for `start`. This method will simply call `start`, but it may help readability if this is used after a `pause` and `start` is only used in opposition to `stop`.                                                                                                                                                                                  |
| `destroy`   | `() => undefined`                      | Destroy this instance and make it available for garbage collection. This will release any internally held references. Always explicitly returns `undefined`.                                                                                                                                                                                               |
| `isRunning` | `() => boolean`                        | Returns `true` if the clock is running or `false` if the clock has never been started, is paused, or has been stopped.                                                                                                                                                                                                                                     |
| `isPaused`  | `() => boolean`                        | Returns `true` if the clock is paused.                                                                                                                                                                                                                                                                                                                     |

| Method          | Type                                                                                                                                       | Description                                                                                                                                                                                                                                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `setTimeout`    | `(callback: (ev: KDAudioClockEvent) => void, delayInMs: number) => KDAudioClockEvent`                                                      | Shortcut for creating a scheduled event that mimics `window.setTimeout` functionality.                                                                                                                                                                                                                                        |
| `setInterval`   | `(callback: (ev: KDAudioClockEvent) => void, intervalInMs: number) => KDAudioClockEvent`                                                   | Shortcut for creating a scheduled event that mimics `window.setInterval` functionality.                                                                                                                                                                                                                                       |
| `clearInterval` | `(event: KDAudioClockEvent) => void`                                                                                                       | Shortcut for deleting an event that mimics `window.clearInterval` functionality.                                                                                                                                                                                                                                              |
| `schedule`      | `(opts: KDAudioClockEventOptions | KDAudioClockEvent | KDAudioClockEvent[], deadline?: number) => KDAudioClockEvent | KDAudioClockEvent[]` | Create a scheduled event. The `opts` parameter must be an existing `KDAudioEvent`, an array of `KDAudioEvent`, or an object holding `KDAudioClockEventOptions`. `deadline` is optional and allows you to set an explicit start time in seconds for the event. `deadline` will default to `context.currentTime` if left empty. |

| Method               | Type                                                      | Description                                                                                                                                                                                                                                                    |
| -------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getContext`         | `() => AudioContext`                                      | Returns the `AudioContext` being used by the clock. Either the context passed as a constructor parameter, or the internally created context if one was not provided.                                                                                           |
| `getCurrentTime`     | `() => number | null`                                     | Returns the `context.currentTime` value or `null` if the clock does not currently have a context. While most `KDAudioClock` methods represent time in milliseconds, this retrieves the value directly from the audio context which represents time in seconds. |
| `getTolerance`       | `() => { early: number; late: number; }`                  | Get the current default tolerance levels in seconds that is used when new events are created without their own explicit tolerance option.                                                                                                                      |
| `setTolerance`       | `(tolerance: { early?: number; late?: number; }) => void` | Set the default tolerance levels in seconds that will be used when new events are created without their own explicit tolerance option.                                                                                                                         |
| `getEvents`          | `() => KDAudioClockEvent[]`                               | Returns an array `KDAudioClockEvent[]` holding all events currently being managed by the clock, regardless of whether they are currently queued or not (eg. this will include suspended/paused events).)                                                       |
| `getEventQueue`      | `() => KDAudioClockEvent[]`                               | Returns an array `KDAudioClockEvent[]` holding all events currently in the event queue (eg. will not include suspended/paused events).                                                                                                                         |
| `hasEvent`           | `(event: KDAudioClockEvent | string) => boolean`          | The `event` parameter is either the `KDAudioClockEvent` or the `string` unique identifier associated with the event. Returns `true` if the clock is currently managing the event.                                                                              |
| `getUIDFor`          | `(event: KDAudioClockEvent) => string`                    | When passed a valid event, this returns the unique identifier `string` that was automatically assigned to the event when it was created.                                                                                                                       |
| `getEventFor`        | `(eventID: string) => KDAudioClockEvent`                  | When passed a valid `string` identifier, this returns the associated `KDAudioClockEvent`.                                                                                                                                                                      |
| `getEventUidEntries` | `() => [KDAudioClockEvent, string][]`                     | Returns an array `[KDAudioClockEvent, string][]` representing the internal map holding managed events and their UID associations.                                                                                                                              |

| Method        | Type                                                                            | Description                                                                                                                                                                                                                                                                                                                                                         |
| ------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sync`        | `(events: KDAudioClockEvent[] | KDAudioClockEvent, delayInMs?: number) => void` | Sync an array of `KDAudioClockEvent` to `context.currentTime` plus the `delayInMs` value.                                                                                                                                                                                                                                                                           |
| `timeStretch` | `(events: KDAudioClockEvent[] | KDAudioClockEvent, ratio: number) => void`      | Alter the loop intervals for an array of `KDAudioClockEvent`. `timeStretch` will only affect looping events, and this value will always be applied to the initial interval time (ie. setting the `timeStretch` back to `1` will reset any stretching). The initial interval value will be multiplied by the `ratio` value for each subsequent tick. Default is `1`. |
| `suspend`     | `(events: KDAudioClockEvent[] | KDAudioClockEvent) => void`                     | Suspend events, keeping them from being queued without deleting them. This does the same thing as `clock.pause` but allows you to target specific events.                                                                                                                                                                                                           |
| `delete`      | `(events: KDAudioClockEvent[] | KDAudioClockEvent) => undefined`                | Delete events, removing them from the queue and preparing them for garbage collection. Always returns `undefined`.                                                                                                                                                                                                                                                  |

| Method              | Type                                                                                                                | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `score`             | `(events: [number, (event: KDAudioClockEvent) => void][]) => { break: () => void }`                                 | Process a series of events with each subsequent event in the given array taking place only after the previous event fires. The `events` parameter is an array of scored events, each represented as an array `[delayInMs, callback]`. `delayInMs` is the time after the previous event is completed, not the time since initialization. `score` returns an object `{ break: () => void; }` which can be used to break out of a score early.                                                                    |
| `createScoredEvent` | `(delayInMs: number, callback: (event: KDAudioClockEvent) => void) => [number, (event: KDAudioClockEvent) => void]` | Helper function to make scored event arrays more readable.                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `meter`             | `(beats: number, duration: number) => number`                                                                       | Helper function to convert meter to milliseconds. While you can use absolute time to control `KDAudioClock`, it also includes an internal meter system. The internal bpm and beat defaults to `{bpm: 60, beat: 4}` (60 beats-per-minute and the quarter note gets the beat). You can set the bpm and beat when the instance is created or at a later time, and the `meter` method will use those values along with the time signature values passed to it to compute the appropriate duration in milliseconds. |
| `getBPM`            | `() => number`                                                                                                      | Get the internally referenced beats-per-minute. This is only used by the `meter` method when calculating metrical durations. The default is `60`.                                                                                                                                                                                                                                                                                                                                                              |
| `setBPM`            | `(bpm: number) => void`                                                                                             | Set the internally referenced beats-per-minute.                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `getBeat`           | `() => number`                                                                                                      | Get the internally referenced metrical beat. This is only used by the `meter` method when calculating metrical durations. The default is `4` (quarter note gets the beat).                                                                                                                                                                                                                                                                                                                                     |
| `setBeat`           | `(beat: number) => void`                                                                                            | Set the internally referenced metrical beat.                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

#### KDAudioClockEventOptions Parameters

| Param         | Type                                           | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `delay?`      | `number`                                       | Delay the start of the first tick in milliseconds. Default is `0`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `loop?`       | `{ interval?: number; repetitions?: number; }` | `loop.interval` is the time in ms between successive ticks. `loop.repetitions` is the number of repetitions before ending the loop. If the `loop` parameter is empty, the event will be scheduled to fire once after `delay` time (ie. `loop` defaults to `{repetitions: 1}`). If `loop.interval` is provided but `loop.repetitions` is left empty, `loop.repetitions` will default to `Infinity`. If `loop.interval` is provided with no `delay`, the event will tick immediately and again on each successive interval. If both `delay` and `loop.interval` are provided, the first tick will be after the delay time, and each successive tick will be after the interval time. |
| `tolerance?`  | `{ early?: number; late?: number; }`           | Describe the allowed margin of error in seconds before dropping a tick (ie. earliest and latest times to allow a tick before or after the scheduled deadline). The margin is calculated as the scheduled deadline minus the `early` value or plus the `late` value. If the event tries to fire within the allowed margin of error, the `onTick` callback is called. Otherwise, the `onMissed` callback is called instead.                                                                                                                                                                                                                                                          |
| `onTick?`     | `(event: KDAudioClockEvent) => void`           | Called on every successful tick.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `onComplete?` | `(event: KDAudioClockEvent) => void`           | Called when the number of intended repetitions is reached. If the `loop.repetitions` value is `Infinity`, this will never be called.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `onAborted?`  | `(event: KDAudioClockEvent) => void`           | Called if a looping event is deleted (not suspended) before it has reached its intended number of repetitions, including if the `loop.repetitions` value is `Infinity`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `onMissed?`   | `(event: KDAudioClockEvent) => void`           | Called if a tick misses its deadline.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

#### KDAudioClockEvent Methods

| Method               | Type                             | Description                                                                                                                                                                                                                                                             |
| -------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `schedule`           | `(deadline: number) => void`     | Schedule the next tick time for a specific deadline in seconds. This does not reset the elapsed tick count, so an event with a max number of loops will retain its current loop count.                                                                                  |
| `sync`               | `(delayInMs?: number) => void`   | Schedule the next tick for the `context.currentTime` plus the `delayInMs`. This does not reset the elapsed tick count, so an event with a max number of loops will retain its current loop count.                                                                       |
| `suspend`            | `() => void`                     | This will suspend scheduled deadlines, but the event and its options will be retained by the owning `KDAudioClock`.                                                                                                                                                     |
| `reschedule`         | `(deadline?: number) => void`    | Reschedule the next tick time for a specific deadline in seconds. This resets the elapsed tick count, which will restart a looping event with a max number of loops. Default `deadline` is `context.currentTime`.                                                       |
| `delete`             | `() => undefined`                | Completely delete the event and all internal references to `KDAudioClock`. Always returns `undefined`.                                                                                                                                                                  |
| `isLooping`          | `() => boolean`                  | Returns `true` if this is a looping event and the current number of elapsed loops has not exceeded the maximum number of loops.                                                                                                                                         |
| `isSuspended`        | `() => boolean`                  | Returns `true` if this event is suspended.                                                                                                                                                                                                                              |
| `updateWithInterval` | `(intervalInMs: number) => void` | Sets this events loop interval. This will set a new `initialInterval` and then update the `currentInterval` accounting for the time stretch value.                                                                                                                      |
| `timeStretch`        | `(ratio: number) => void`        | If this event is a looping event, this will be applied to the initial interval time (ie. setting the `timeStretch` back to `1` will reset any stretching). The initial interval value will be multiplied by the `ratio` value for each subsequent tick. Default is `1`. |
| `get`                | `object`                         | See parameters below.                                                                                                                                                                                                                                                   |

#### `new KDAudioClockEvent.get` Methods

| Method                    | Type                                                            | Description                                                                                                                          |
| ------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `clock`                   | `() => KDAudioClock`                                            | Returns the `KDAudioClock` instance that owns this event.                                                                            |
| `uid`                     | `() => string`                                                  | Returns the unique identifier `string` assigned to this event.                                                                       |
| `nextDeadline`            | `() => { scheduled: number; earliest: number; latest: number }` | Returns an object holding `scheduled`, `earliest`, and `latest` deadline values in seconds.                                          |
| `tolerance`               | `() => { early: number; late: number }`                         | Returns an object holding `early` and `late` tolerance values in seconds.                                                            |
| `loop`                    | `() => object`                                                  | Returns an object holding `initialInterval`, `currentInterval`, `repetitions`, `elapsedTickCount`, and `timeStretch` values.         |
| `loop().initialInterval`  | `number`                                                        | The base interval in milliseconds for a looping event.                                                                               |
| `loop().currentInterval`  | `number`                                                        | The actual interval in milliseconds for a looping event after time stretch has been applied.                                         |
| `loop().repetitions`      | `number`                                                        | The total number of repetitions for a looping event.                                                                                 |
| `loop().elapsedTickCount` | `number`                                                        | The number of ticks/repetitions that have already elapsed.                                                                           |
| `loop().timeStretch`      | `number`                                                        | The current time stretch ratio.                                                                                                      |
| `callbacks`               | `() => object`                                                  | Returns an object holding values for `onTick`, `onComplete`, `onAborted`, and `onMissed` callback functions.                         |
| `callbacks().onTick`      | `(event: KDAudioClockEvent) => void`                            | Function called on every successful tick.                                                                                            |
| `callbacks().onCompleted` | `(event: KDAudioClockEvent) => void`                            | Function called when `elapsedTickCount` reaches the target number of `repetitions`.                                                  |
| `callbacks().onAborted`   | `(event: KDAudioClockEvent) => void`                            | Function called if an event is deleted before reaching its target number of `repetitions`, including if `repetitions` is `Infinity`. |
| `callbacks().onMissed`    | `(event: KDAudioClockEvent) => void`                            | Function called if an event attempts to fire outside its margin of error determined by its `tolerance` levels.                       |

import * as React from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import { ExampleHoc } from './ExampleHoc';
import { KDAudioClock } from '../KDAudioClock/KDAudioClock';
import { KDAudioClockEvent } from '../KDAudioClock/KDAudioClockEvent';
import { rand } from './util/rand';
import { animate } from './util/animate';

export const ExampleSchedule = (): React.ReactElement => {
  const [masterClock] = React.useState(new KDAudioClock());
  const [clock] = React.useState(new KDAudioClock());

  const [events, setEvents] = React.useState([]);

  const onadd = React.useCallback(() => {
    const interval = rand(3, 2) + 1;
    const loops = rand(5, 0) + 2;
    clock.schedule({
      loop: {
        interval: interval * 1000,
        repetitions: loops,
      },
      onTick: (ev) => {
        const node = document.getElementById(ev.get.uid());
        if (node) animate(node, 'jello');
      },
    });
  }, [clock]);

  const TableHeader = React.useMemo(() => {
    return (
      <TableRow>
        <TableCell>Event</TableCell>
        <TableCell align='right'>Ticks Left</TableCell>
        <TableCell align='right'>Next Tick</TableCell>
      </TableRow>
    );
  }, []);

  const MappedEvents = React.useMemo(() => {
    return events.map((event: KDAudioClockEvent, index: number) => {
      const current = clock.getCurrentTime();
      const scheduled = event?.get?.nextDeadline()?.scheduled;

      if (!scheduled) return null;

      const duration = scheduled - current;
      const totalReps = event.get.loop().repetitions;
      const elapsedReps = event.get.loop().elapsedTickCount;
      const reps = totalReps - elapsedReps;
      return (
        <TableRow key={index}>
          <TableCell id={event.get.uid()}>
            {event.get.uid().split('-').pop()}
          </TableCell>
          <TableCell align='right'>{reps.toFixed(0)}</TableCell>
          <TableCell align='right'>{duration.toFixed(2)}</TableCell>
        </TableRow>
      );
    });
  }, [clock, events]);

  const description = React.useMemo(() => {
    return 'Schedule a timed event.';
  }, []);

  const codeExample = React.useMemo(() => {
    return ` 
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
    `;
  }, []);

  const moreExamples = React.useMemo(() => {
    return `
    /**
     * The previous event creation examples
     * are just using 'schedule' under the
     * hood.
     * 
     * This is the same as 'clock.setTimeout'.
     */

    clock.schedule({
      delay: 500,
      onComplete: () => console.log("done"),
    });



    /**
     * And this is the same as 
     * 'clock.setInterval'.
     */

    clock.schedule({
      loop: {
        interval: 500,
        repetitions: Infinity,
      },
      onTick: () => console.log("tick"),
    });



    /**
     * Here's all of the available 
     * scheduling options:
     */

    clock.schedule({
      delay: timeInMs,
      loop: {
        interval: timeInMs,
        repetitions: wholeNumber,
      },
      onTick: (ev) => {},
      onComplete: (ev) => {},
      onAborted: (ev) => {},
      onMissed: (ev) => {},
      tolerance: {
        early: timeInSeconds,
        late: timeInSeconds,
      },
    });



    /**
     * And again but with descriptions:
     */

    clock.schedule({

      /** 
       * Delay the start of the first tick. 
       */
      delay: 100,

      /**
       * If a 'loop' option is not provided, 
       * the event will be scheduled to fire
       * once after 'delay' time.
       * 
       * If 'loop.interval' is provided with 
       * no 'delay', the event will tick 
       * immediately and again on each 
       * successive interval.
       * 
       * If both 'delay' and 'loop.interval' 
       * are provided, the first tick will be 
       * after the delay time, and each 
       * successive tick will be after the 
       * interval time.
       */
      loop: {

        /**
         * The time between successive ticks. 
         */
        interval: 500,
        
        /** 
         * The number of repetitions to loop.
         * Default is 'Infinity'.
         */
        repetitions: 5,
      },

      /**
       * Called every successful tick.
       */
      onTick: (ev) => {},

      /**
       * Called following the final tick if 
       * given a 'loop.repetitions' value.
       */
      onComplete: (ev) => {},

      /**
       * Called if the event is deleted before 
       * reaching the 'loop.repetitions' value.
       */
      onAborted: (ev) => {
        console.log("aborted");
      },

      /**
       * Called instead of the 'onTick' callback
       * whenever an event tries to fire outside 
       * the bounds of its scheduled tolerance.
       */
      onMissed: (ev) => {
        console.warn("missed");
      },

      /**
       * Sets the tolerance levels applied to 
       * just this event. If left empty, the clock 
       * instance tolerance will be used instead.
       */
      tolerance: {
        early: 0.1,
        late: 0.01,
      },
    });
    `;
  }, []);

  return (
    <ExampleHoc
      title={'schedule'}
      description={description}
      codeExample={codeExample}
      moreExamples={moreExamples}
      masterClock={masterClock}
      clock={clock}
      onMasterClockTick={() => setEvents(clock.getEvents())}
      onAdd={onadd}
      tableHeader={TableHeader}
      mappedEvents={MappedEvents}
    />
  );
};

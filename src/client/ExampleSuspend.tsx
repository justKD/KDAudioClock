import * as React from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';

import { ExampleHoc } from './ExampleHoc';
import { KDAudioClock } from '../KDAudioClock/KDAudioClock';
import { KDAudioClockEvent } from '../KDAudioClock/KDAudioClockEvent';
import { rand } from './util/rand';
import { animate } from './util/animate';

export const ExampleSuspend = (): React.ReactElement => {
  const [masterClock] = React.useState(new KDAudioClock());
  const [clock] = React.useState(new KDAudioClock());

  const [events, setEvents] = React.useState([]);

  const onadd = React.useCallback(() => {
    const interval = rand(3, 2) + 1;
    clock.setInterval((ev) => {
      const node = document.getElementById(ev.get.uid());
      if (node) animate(node, 'jello');
    }, interval * 1000);
  }, [clock]);

  const TableHeader = React.useMemo(() => {
    return (
      <TableRow>
        <TableCell>Event</TableCell>
        <TableCell align='right'>Interval</TableCell>
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
      const interval = event.get.loop().currentInterval / 1000;
      return (
        <TableRow key={index}>
          <TableCell id={event.get.uid()}>
            {event.get.uid().split('-').pop()}
          </TableCell>
          <TableCell align='right'>{interval.toFixed(2)}</TableCell>
          <TableCell align='right'>
            {event.isSuspended() ? 'suspended' : duration.toFixed(2)}
          </TableCell>
        </TableRow>
      );
    });
  }, [clock, events]);

  const Inputs = React.useMemo(() => {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <Button
          onClick={() => {
            const events = clock.getEvents();
            events.forEach((event) => event.suspend());
          }}
          variant='outlined'
          disableElevation
          fullWidth
        >
          suspend
        </Button>
        <div style={{ width: 50 }} />
        <Button
          onClick={() => {
            const events = clock.getEvents();
            events.forEach((event) => {
              if (event.isSuspended()) {
                event.schedule(clock.getCurrentTime());
              }
            });
          }}
          variant='outlined'
          disableElevation
          fullWidth
        >
          reschedule
        </Button>
      </div>
    );
  }, [clock]);

  const description = React.useMemo(() => {
    return 'Suspend an event and remove it from the queue.';
  }, []);

  const codeExample = React.useMemo(() => {
    return ` 
    clock.suspend( clock.getEvents() );
    `;
  }, []);

  const moreExamples = React.useMemo(() => {
    return `
    /**
     * This is different from 'clock.delete' 
     * and 'clock.clearInterval' which both 
     * destroy an event.
     *
     * Suspending an event will remove it from 
     * the queue but it won't be deleted.
     *
     * Here the clock is managing the event 
     * and it is in the queue.
     */

    const event = clock.setInterval(f, 100);
    console.log(clock.getEvents());
    console.log(clock.getEventQueue();)



    /**
     * After suspending, the event is removed
     * from the event queue, but not deleted
     * from the managed events.
     */

    clock.suspend(event);
    console.log(clock.getEvents());
    console.log(clock.getEventQueue();)



    /**
     * And it can be rescheduled at a later time
     * while retaining its other properties.
     */

    const now = clock.getCurrentTime();
    event.schedule(now); // tick right away

    const loop = event.get.loop();
    const interval = loop.currentInterval / 1000;
    const later = now + interval;
    event.schedule(later); // wait for first tick



    /**
     * Like 'sync' and 'timeStretch', KDAudioClock 
     * can also call suspend on individual events 
     * or an array of events. It can also be called
     * by an event itself.
     */

    const events = clock.getEvents();
    const event = events[0];

    clock.suspend(events);
    clock.suspend(event);
    event.suspend();
    `;
  }, []);

  return (
    <ExampleHoc
      title={'suspend'}
      description={description}
      codeExample={codeExample}
      moreExamples={moreExamples}
      masterClock={masterClock}
      clock={clock}
      onMasterClockTick={() => setEvents(clock.getEvents())}
      onAdd={onadd}
      inputs={Inputs}
      tableHeader={TableHeader}
      mappedEvents={MappedEvents}
    />
  );
};

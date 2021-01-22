import * as React from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';

import { ExampleHoc } from './ExampleHoc';
import { KDAudioClock } from '../KDAudioClock/KDAudioClock';
import { KDAudioClockEvent } from '../KDAudioClock/KDAudioClockEvent';
import { rand } from './util/rand';
import { animate } from './util/animate';

export const ExampleDelete = (): React.ReactElement => {
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
      <Button
        onClick={() => {
          const events = clock.getEvents();
          events.forEach((event) => event.delete());
        }}
        variant='outlined'
        disableElevation
        fullWidth
      >
        delete
      </Button>
    );
  }, [clock]);

  const description = React.useMemo(() => {
    return 'Delete an event.';
  }, []);

  const codeExample = React.useMemo(() => {
    return ` 
    clock.delete( clock.getEvents() );
    `;
  }, []);

  const moreExamples = React.useMemo(() => {
    return `
    /**
     * This will delete an event and prepare it 
     * for garbage collection.
     *
     * Here the clock is managing the event and 
     * it is in the queue.
     */
    
    const event = clock.setInterval(f, 100);
    console.log(clock.getEvents());
    console.log(clock.getEventQueue();)



    /**
     * After deleting, the event is removed
     * from the event queue and deleted
     * from the managed events.
     */

    clock.delete(event);
    console.log(clock.getEvents());
    console.log(clock.getEventQueue();)



    /**
     * Like 'suspend', KDAudioClock can 
     * also call delete on individual events 
     * or an array of events, and individual
     * events have their own delete method.
     */

    const events = clock.getEvents();
    const event = events[0];

    clock.delete(events);
    clock.delete(event);
    event.delete();



    /**
     * Note: 
     *
     * If an event is only referenced by its 
     * creating KDAudioClock, 'delete' will 
     * prepare it for garbage collection.
     */

    clock.setInterval(f, 200);
    clock.delete(clock.getEvents());



    /**
     * 'delete' removes all internally
     * held references, but if an event
     * is referenced externally you may 
     * need to do some extra clean up 
     * before the event is actually 
     * garbage collected. Here, the delete 
     * method invalidates the event and 
     * frees it from being managed by the 
     * clock, but it must still be freed 
     * from the local variable before 
     * garbage collection.
     */

    let event = clock.setInterval(f, 100)
    event.delete();
    event = undefined;
    `;
  }, []);

  return (
    <ExampleHoc
      title={'delete'}
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

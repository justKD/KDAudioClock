import * as React from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';

import { ExampleHoc } from './ExampleHoc';
import { KDAudioClock } from '../KDAudioClock/KDAudioClock';
import { KDAudioClockEvent } from '../KDAudioClock/KDAudioClockEvent';
import { animate } from './util/animate';

export const ExampleSync = (): React.ReactElement => {
  const [masterClock] = React.useState(new KDAudioClock());
  const [clock] = React.useState(new KDAudioClock());

  const [events, setEvents] = React.useState([]);

  const onadd = React.useCallback(() => {
    clock.setInterval((ev) => {
      const node = document.getElementById(ev.get.uid());
      if (node) animate(node, 'jello');
    }, 2000);
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
          <TableCell align='right'>{duration.toFixed(2)}</TableCell>
        </TableRow>
      );
    });
  }, [clock, events]);

  const Inputs = React.useMemo(() => {
    return (
      <Button
        onClick={() => {
          clock.sync(clock.getEvents());
        }}
        variant='outlined'
        disableElevation
        fullWidth
      >
        sync to now
      </Button>
    );
  }, [clock]);

  const description = React.useMemo(() => {
    return 'Sync event timers to the current time.';
  }, []);

  const codeExample = React.useMemo(() => {
    return ` 
    clock.sync( clock.getEvents() );
    `;
  }, []);

  const moreExamples = React.useMemo(() => {
    return `
    /**
     * Pass a single event.
     */

    const event = clock.setInterval(f, 500);
    clock.sync(event);



    /**
     * Or an array of events.
     */

    const event1 = clock.setInterval(f, 500);
    const event2 = clock.setInterval(f, 700);
    clock.sync([event1, event2]);



    /**
     * The second parameter is a delay time in ms.
     * The sync event will wait for this duration
     * before syncing to current time.
     */

    clock.sync(clock.getEvents(), 1500);



    /**
     * 'sync' can also be called on individual event,
     * but you must pass it an explicit time to which
     * to sync.
     */
    
    clock.setInterval((ev) => {
      const time = clock.getCurrentTime();
      if (something) ev.sync(time + 0.5);
    }, 500);
    `;
  }, []);

  return (
    <ExampleHoc
      title={'sync'}
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

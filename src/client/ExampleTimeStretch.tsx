import * as React from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';

import { ExampleHoc } from './ExampleHoc';
import { KDAudioClock } from '../KDAudioClock/KDAudioClock';
import { KDAudioClockEvent } from '../KDAudioClock/KDAudioClockEvent';
import { rand } from './util/rand';
import { animate } from './util/animate';

export const ExampleTimeStretch = (): React.ReactElement => {
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
          <TableCell align='right'>{duration.toFixed(2)}</TableCell>
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
            events.forEach((event) => {
              const current = event.get.loop().timeStretch;
              event.timeStretch(current * 2);
            });
          }}
          variant='outlined'
          disableElevation
          fullWidth
        >
          double
        </Button>
        <div style={{ width: 50 }} />
        <Button
          onClick={() => {
            const events = clock.getEvents();
            events.forEach((event) => {
              const current = event.get.loop().timeStretch;
              event.timeStretch(current / 2);
            });
          }}
          variant='outlined'
          disableElevation
          fullWidth
        >
          halve
        </Button>
      </div>
    );
  }, [clock]);

  const description = React.useMemo(() => {
    return 'Uniformly alter the interval of looping events.';
  }, []);

  const codeExample = React.useMemo(() => {
    return ` 
    clock.timeStretch( clock.getEvents(), 2 );
    `;
  }, []);

  const moreExamples = React.useMemo(() => {
    return `
    /**
     * The timestretch factor is always applied
     * to the initial interval, not necessarily
     * the current interval.
     *
     * This will double the interval of the event,
     * setting it to 1000 in this case.
     */

    const event = clock.setInterval(f, 500);
    clock.timeStretch(event, 2);



    /**
     * Given the same event, this will set the 
     * new interval to half of the original,
     * or 250.
     */

    clock.timeStretch(event, 0.5);



    /**
     * And this will finally set the interval
     * back to the original value, 500.
     */

    clock.timeStretch(event, 1);



    /**
     * Like 'sync', this method accepts a 
     * single event or an array of events.
     */

    const eventsArray = clock.getEvents();
    clock.timeStretch(eventsArray, 2.25);



    /**
     * And it can be applied to individual events.
     */

    clock.setInterval((ev) => {
      const loop = ev.get.loop();
      const ticks = loop.elapsedTickCount;
      if (ticks >= 5) ev.timeStretch(1.5);
    }, 500);
    `;
  }, []);

  return (
    <ExampleHoc
      title={'timeStretch'}
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

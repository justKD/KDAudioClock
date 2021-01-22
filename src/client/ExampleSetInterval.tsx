import * as React from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import { ExampleHoc } from './ExampleHoc';
import { KDAudioClock } from '../KDAudioClock/KDAudioClock';
import { KDAudioClockEvent } from '../KDAudioClock/KDAudioClockEvent';
import { rand } from './util/rand';
import { animate } from './util/animate';

export const ExampleSetInterval = (): React.ReactElement => {
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

  const description = React.useMemo(() => {
    return 'Mimics `window.setInterval` but uses the audio context timer.';
  }, []);

  const codeExample = React.useMemo(() => {
    return ` 
    clock.setInterval(() => {
      console.log("tick every 2 sec");
    }, 2000)
    `;
  }, []);

  const moreExamples = React.useMemo(() => {
    return `
    /**
     * Clear with 'clock.clearInterval'.
     */

    const ev = clock.setInterval(f, 500);
    clock.clearInterval(ev);

    

    /**
     * Or by deleting the event.
     */

    clock.setInterval((ev) => {
      const loop = ev.get.loop();
      const ticks = loop.elapsedTickCount;
      if (ticks >= 5) ev.delete();
    }, 500);
    `;
  }, []);

  return (
    <ExampleHoc
      title={'setInterval'}
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

import * as React from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

import { ExampleHoc } from './ExampleHoc';
import { KDAudioClock } from '../KDAudioClock/KDAudioClock';
import { KDAudioClockEvent } from '../KDAudioClock/KDAudioClockEvent';
import { rand } from './util/rand';

export const ExampleSetTimeout = (): React.ReactElement => {
  const [masterClock] = React.useState(new KDAudioClock());
  const [clock] = React.useState(new KDAudioClock());

  const [events, setEvents] = React.useState([]);

  const onadd = React.useCallback(() => {
    const timeout = rand(3, 2) + 1;
    clock.setTimeout(() => {}, timeout * 1000);
  }, [clock]);

  const TableHeader = React.useMemo(() => {
    return (
      <TableRow>
        <TableCell>Event</TableCell>
        <TableCell align='right'>Timeout</TableCell>
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
          <TableCell>{event.get.uid().split('-').pop()}</TableCell>
          <TableCell align='right'>{interval.toFixed(2)}</TableCell>
          <TableCell align='right'>{duration.toFixed(2)}</TableCell>
        </TableRow>
      );
    });
  }, [clock, events]);

  const description = React.useMemo(() => {
    return 'Mimics `window.setTimeout` but uses the audio context timer.';
  }, []);

  const beforeTable = React.useMemo(() => {
    const text =
      'Press the play button to start the clock. Then press the add button to start an event.';
    return <Typography variant={'caption'}>{text}</Typography>;
  }, []);

  const codeExample = React.useMemo(() => {
    return ` 
    clock.setTimeout(() => {
      console.log("tick after 2 sec");
    }, 2000)
    `;
  }, []);

  return (
    <ExampleHoc
      title={'setTimeout'}
      description={description}
      beforeTable={beforeTable}
      codeExample={codeExample}
      masterClock={masterClock}
      clock={clock}
      onMasterClockTick={() => setEvents(clock.getEvents())}
      onAdd={onadd}
      tableHeader={TableHeader}
      mappedEvents={MappedEvents}
    />
  );
};

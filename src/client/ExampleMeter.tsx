import * as React from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';

import { ExampleHoc } from './ExampleHoc';
import { KDAudioClock } from '../KDAudioClock/KDAudioClock';
import { KDAudioClockEvent } from '../KDAudioClock/KDAudioClockEvent';

import { animate } from './util/animate';

export const ExampleMeter = (): React.ReactElement => {
  const [masterClock] = React.useState(new KDAudioClock());
  const [clock] = React.useState(new KDAudioClock());

  const [events, setEvents] = React.useState([]);
  const [note, setNote] = React.useState(4);

  const onadd = React.useCallback(() => {
    const meter = clock.meter(1, note);
    clock.setInterval((ev) => {
      const node = document.getElementById(ev.get.uid());
      if (node) animate(node, 'jello');
    }, meter);
  }, [clock, note]);

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
    const padding = 5;

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <div style={{ width: '100%' }}>
          <Slider
            value={note}
            min={1}
            max={16}
            onChange={(_, newValue: number | number[]) => {
              setNote(newValue as number);
            }}
            valueLabelDisplay='auto'
            style={{ paddingTop: padding, paddingBottom: padding }}
          />
          <Typography>Note</Typography>
        </div>
        <div style={{ width: 50 }} />
        <Button
          onClick={() => {
            clock.sync(clock.getEvents());
          }}
          variant='outlined'
          disableElevation
          fullWidth
        >
          sync
        </Button>
      </div>
    );
  }, [note, clock]);

  const description = React.useMemo(() => {
    return 'Convert metered durations into time in milliseconds.';
  }, []);

  const codeExample = React.useMemo(() => {
    return ` 
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
    `;
  }, []);

  const moreExamples = React.useMemo(() => {
    return `
    /**
     * Usually, just setting and changing the
     * BPM will suffice. Remember the default
     * beat is the quarter note.
     */

    clock.setBPM(60);
    const tickEverySecond = clock.meter(1, 4);
    const tickEveryHalfSecond = clock.meter(1, 8);
    const eighthNoteTriplet = clock.meter(1, 12);

    clock.setBPM(120);
    const tickEveryHalfSec = clock.meter(1, 4);
    const tickEveryQuarterSec = clock.meter(1, 8);
    const sixteenthNoteTriplet = clock.meter(1, 12);

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
    `;
  }, []);

  return (
    <ExampleHoc
      title={'meter'}
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
      tableNote={'bpm = 60, ♩ gets the beat'}
    />
  );
};

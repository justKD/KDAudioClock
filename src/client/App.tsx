import * as React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import './styles/main.scss';
import './styles/code.scss';

import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { ExampleSetTimeout } from './ExampleSetTimeout';
import { ExampleSetInterval } from './ExampleSetInterval';
import { ExampleSchedule } from './ExampleSchedule';
import { ExampleSync } from './ExampleSync';
import { ExampleTimeStretch } from './ExampleTimeStretch';
import { ExampleSuspend } from './ExampleSuspend';
import { ExampleDelete } from './ExampleDelete';
import { ExampleMeter } from './ExampleMeter';
import { ExampleScore } from './ExampleScore';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      marginBottom: 100,
    },
    title: {
      paddingTop: 30,
      textAlign: 'center',
    },
    description: {
      margin: theme.spacing(2),
    },
    code: {
      fontFamily: 'Courier New',
      fontSize: '1rem',
      lineHeight: '1rem',
      margin: theme.spacing(2),
      backgroundColor: 'WhiteSmoke',
      [theme.breakpoints.down('sm')]: {
        fontSize: '0.85rem',
      },
      [theme.breakpoints.down('xs')]: {
        fontSize: '0.65rem',
      },
    },
    container: {
      width: '100%',
      maxWidth: 800,
      minWidth: 320,
      [theme.breakpoints.down('xs')]: {
        maxWidth: 500,
      },
    },
  })
);

export const App = (): React.ReactElement => {
  const classes = useStyles();

  const codeExample = React.useMemo(() => {
    return ` 
    const clock = new KDAudioClock();
    clock.start();
    `;
  }, []);

  const moreCodeExamples = React.useMemo(() => {
    return `
    /**
     * KDAudioClock will create and manage its own 
     * internal audio context, but you can also use
     * an external one.
     */
    
    const ctx = new AudioContext();
    const clock = new KDAudioClock({
      context: ctx,
    });



    /**
     * The 'tolerance' option will set the default
     * tolerance values applied to every new event.
     * The 'early' and 'late' properties correspond
     * to the time in seconds that a tick event is 
     * allowed to fire before or after the actual
     * scheduled deadline. Be careful, if the tolerance 
     * is too strict, many events may "miss".
     */

    const clock = new KDAudioClock({
      tolerance: {
        early: 0.002, // default is 0.001
        late: 0.15,   // default is 0.1
      },
    });



    /**
     * The 'bpm' and 'beat' options are used by the 
     * 'clock.meter' method to convert metered time
     * into absolute time. 'bpm' is how many beats
     * per minute, and 'beat' is which rhythmic
     * subdivision will count as one beat. The 
     * following would correspond to 120 eighth 
     * notes per minute.
     */

    const clock = new KDAudioClock({
      bpm: 120, // default is 60
      beat: 8,  // default is 4 (quarter note)
    });

    const duration = clock.meter(1, 8);
    
    clock.start();
    clock.setInterval(someFunc, duration);
    `;
  }, []);

  const MoreExamples = React.useMemo(() => {
    return (
      <Accordion
        elevation={0}
        style={{
          backgroundColor: 'WhiteSmoke',
          marginBottom: 5,
          marginLeft: 16,
          marginRight: 16,
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <pre className={classes.code} style={{ margin: 8 }}>
            {'/* More Examples */'}
          </pre>
        </AccordionSummary>
        <AccordionDetails style={{ margin: 0, padding: 0 }}>
          <pre className={classes.code} style={{ margin: 0 }}>
            {moreCodeExamples}
          </pre>
        </AccordionDetails>
      </Accordion>
    );
  }, [classes.code, moreCodeExamples]);

  const links = React.useMemo(() => {
    return {
      waaclock: 'https://github.com/sebpiq/WAAClock',
      sebpiq: 'https://github.com/sebpiq',
      chriswilson: 'https://www.html5rocks.com/en/tutorials/audio/scheduling/',
    };
  }, []);

  const linkNodes = React.useMemo(() => {
    return {
      waaclock: <a href={links.waaclock}>WAAClock</a>,
      sebpiq: <a href={links.sebpiq}>@sebpiq</a>,
      chriswilson: <a href={links.chriswilson}>A Tale of Two Clocks</a>,
    };
  }, [links]);

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <h2 className={classes.title}>KDAudioClock Examples</h2>
        <div className={classes.description}>
          This class lets you schedule asynchronous events using the audio
          hardware clock.
        </div>
        <div className={classes.description}>
          <code>KDAudioClock</code> creates and manages timed events, which are
          each assigned unique identifiers. It also includes event syncing, time
          stretching, and a scoring syntax for creating a repeatable series of
          events.
        </div>
        <div className={classes.description}>
          It's based on {linkNodes.waaclock} by {linkNodes.sebpiq}, which is
          itself based on the ideas put forth by Chris Wilson in his article{' '}
          {linkNodes.chriswilson}.
        </div>
        <pre className={classes.code}>{codeExample}</pre>
        {MoreExamples}
      </div>
      <div className={classes.container}>
        <ExampleSetTimeout />
        <ExampleSetInterval />
        <ExampleSchedule />
        <ExampleSync />
        <ExampleTimeStretch />
        <ExampleSuspend />
        <ExampleDelete />
        <ExampleMeter />
        <ExampleScore />
      </div>
    </div>
  );
};

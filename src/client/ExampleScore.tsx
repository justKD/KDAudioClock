import * as React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import { ExampleHoc } from './ExampleHoc';
import { KDAudioClock } from '../KDAudioClock/KDAudioClock';
import { KDAudioClockEvent } from '../KDAudioClock/KDAudioClockEvent';

import { animate } from './util/animate';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    beforeTable: {
      margin: theme.spacing(2),
      width: '100%',
    },
    code: {
      fontFamily: 'Courier New',
      fontSize: '1rem',
      backgroundColor: 'WhiteSmoke',
      [theme.breakpoints.down('sm')]: {
        fontSize: '0.85rem',
      },
      [theme.breakpoints.down('xs')]: {
        fontSize: '0.5rem',
      },
    },
  });
});

export const ExampleScore = (): React.ReactElement => {
  const classes = useStyles();
  const [masterClock] = React.useState(new KDAudioClock());
  const [clock] = React.useState(new KDAudioClock());

  const [events, setEvents] = React.useState([]);
  const [example, setExample] = React.useState(0);

  const onadd = React.useCallback(() => {
    const animation = (ev) => {
      const node = document.getElementById(ev.get.uid());
      if (node) animate(node, 'jello');
    };

    const meter = clock.meter;
    const note = clock.createScoredEvent;
    let runScore = () => {};

    switch (example) {
      case 0:
        runScore = () => {
          clock.score([
            note(0, (ev) => {
              animation(ev);
            }),
            note(1000, (ev) => {
              animation(ev);
            }),
            note(500, (ev) => {
              animation(ev);
            }),
            note(250, (ev) => {
              animation(ev);
            }),
            note(1000, (ev) => {
              animation(ev);
            }),
          ]);
        };
        runScore();
        break;
      case 1:
        runScore = () => {
          clock.score([
            note(0, (ev) => {
              animation(ev);
            }),
            note(meter(1, 4), (ev) => {
              animation(ev);
            }),
            note(meter(1, 8), (ev) => {
              animation(ev);
            }),
            note(meter(1, 8), (ev) => {
              animation(ev);
            }),
            note(meter(1, 16), (ev) => {
              animation(ev);
            }),
            note(meter(1, 16), (ev) => {
              animation(ev);
            }),
            note(meter(1, 16), (ev) => {
              animation(ev);
            }),
            note(meter(1, 16), (ev) => {
              animation(ev);
            }),
          ]);
        };
        runScore();
        break;
      case 2:
        runScore = () => {
          clock.score([
            note(0, (ev) => {
              animation(ev);
            }),
            note(meter(1, 4), (ev) => {
              animation(ev);
            }),
            note(meter(1, 8), (ev) => {
              animation(ev);
            }),
            note(meter(1, 4), (ev) => {
              animation(ev);
            }),
            note(meter(1, 8), (ev) => {
              animation(ev);
            }),
            note(meter(1, 16), (ev) => {
              animation(ev);
            }),
            note(meter(1, 16), (ev) => {
              animation(ev);
            }),
            note(meter(1, 4), (ev) => {
              animation(ev);
            }),
            note(0, runScore),
          ]);
        };
        runScore();
        break;
      case 3:
        let count = 0;
        runScore = () => {
          const maxed = count++ >= 2;
          const score = clock.score([
            note(meter(1, 4), (ev) => {
              animation(ev);
            }),
            note(meter(1, 4), (ev) => {
              animation(ev);
              if (maxed) score.break();
            }),
            note(meter(1, 4), (ev) => {
              animation(ev);
            }),
            note(meter(1, 4), (ev) => {
              animation(ev);
              if (!maxed) runScore();
            }),
          ]);
        };
        runScore();
        break;
      case 4:
        const measureOne = [
          note(meter(1, 4), (ev) => {
            animation(ev);
          }),
          note(meter(1, 4), (ev) => {
            animation(ev);
          }),
        ];

        const measureTwo = [
          note(meter(1, 8), (ev) => {
            animation(ev);
          }),
          note(meter(1, 8), (ev) => {
            animation(ev);
          }),
          note(meter(1, 8), (ev) => {
            animation(ev);
          }),
          note(meter(1, 8), (ev) => {
            animation(ev);
          }),
        ];

        const measureThree = [
          note(meter(1, 4), (ev) => {
            animation(ev);
          }),
          note(meter(1, 8), (ev) => {
            animation(ev);
          }),
          note(meter(1, 8), (ev) => {
            animation(ev);
          }),
        ];

        runScore = () => {
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
        break;
      default:
        break;
    }
  }, [example, clock]);

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

  const scoreExample1 = React.useMemo(() => {
    return `
    /**
     * Score events are called successively.
     * Each event in the array will create a 
     * unique 'clock.setTimeout' event with a 
     * unique identifer.
     */

    const meter = clock.meter;
    const note = clock.createScoredEvent;

    clock.score([
      note(0, (ev) => {
        // call this on start
      }),
      note(1000, (ev) => {
        // after 1 second
      }),
      note(500, (ev) => {
        // after 500ms
      }),
      note(250, (ev) => {
        // after 250ms
      }),
      note(1000, (ev) => {
        // after 1 second
      }),
    ]);
    `;
  }, []);

  const scoreExample2 = React.useMemo(() => {
    return `
    /**
     * 'clock.score' is a great place
     * to use 'clock.meter'.
     */

    const meter = clock.meter;
    const note = clock.createScoredEvent;
    const animation = doSomeAnimation;

    clock.score([
      note(0, (ev) => {
        animation(ev);
      }),
      note(meter(1, 4), (ev) => {
        animation(ev);
      }),
      note(meter(1, 8), (ev) => {
        animation(ev);
      }),
      note(meter(1, 8), (ev) => {
        animation(ev);
      }),
      note(meter(1, 16), (ev) => {
        animation(ev);
      }),
      note(meter(1, 16), (ev) => {
        animation(ev);
      }),
      note(meter(1, 16), (ev) => {
        animation(ev);
      }),
      note(meter(1, 16), (ev) => {
        animation(ev);
      }),
    ]);
    `;
  }, []);

  const scoreExample3 = React.useMemo(() => {
    return `
    /**
     * Make a repeating score by wrapping it in 
     * a function and calling the function again
     * at the end of the score.
     */

    const meter = clock.meter;
    const note = clock.createScoredEvent;

    cosnt runScore = () => {
      clock.score([
        note(0, (ev) => {}),
        note(meter(1, 4), (ev) => {}),
        note(meter(1, 8), (ev) => {}),
        note(meter(1, 4), (ev) => {}),
        note(meter(1, 8), (ev) => {}),
        note(meter(1, 16), (ev) => {}),
        note(meter(1, 16), (ev) => {}),
        note(meter(1, 4), (ev) => {}),
        note(0, runScore),
      ]);
    };

    runScore();
    `;
  }, []);

  const scoreExample4 = React.useMemo(() => {
    return `
    /**
     * 'clock.score' returns an object with a 
     * single method: 'break'. Use this should 
     * you need to break out of a score early.
     * 
     * In this example, we start a score, do two
     * complete loops and break in the middle of 
     * the third.
     */

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
    `;
  }, []);

  const scoreExample5 = React.useMemo(() => {
    return `
    /**
     * Create reusable measures and add them to 
     * a score via the spread operator.
     */

    const measureOne = [
      note(meter(1, 4), (ev) => {
        animation(ev);
      }),
      note(meter(1, 4), (ev) => {
        animation(ev);
      }),
    ];

    const measureTwo = [
      note(meter(1, 8), (ev) => {
        animation(ev);
      }),
      note(meter(1, 8), (ev) => {
        animation(ev);
      }),
      note(meter(1, 8), (ev) => {
        animation(ev);
      }),
      note(meter(1, 8), (ev) => {
        animation(ev);
      }),
    ];

    const measureThree = [
      note(meter(1, 4), (ev) => {
        animation(ev);
      }),
      note(meter(1, 8), (ev) => {
        animation(ev);
      }),
      note(meter(1, 8), (ev) => {
        animation(ev);
      }),
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
    `;
  }, []);

  const scores = React.useMemo(() => {
    return [
      ['Basic Example', scoreExample1],
      ['Using `clock.meter`', scoreExample2],
      ['Looping Scores', scoreExample3],
      ['Early Exit', scoreExample4],
      ['Reuse with Spread', scoreExample5],
    ];
  }, [
    scoreExample1,
    scoreExample2,
    scoreExample3,
    scoreExample4,
    scoreExample5,
  ]);

  const Inputs = React.useMemo(() => {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <FormControl style={{ width: '100%' }}>
          <Select
            value={example}
            onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
              setExample(event.target.value as number);
            }}
          >
            {scores.map((score, index) => {
              return (
                <MenuItem key={index} value={index}>
                  {score[0]}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </div>
    );
  }, [example, scores]);

  const BeforeTable = React.useMemo(() => {
    return (
      <div className={classes.beforeTable}>
        <Accordion
          elevation={0}
          style={{
            backgroundColor: 'WhiteSmoke',
            width: '100%',
            marginBottom: 5,
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <pre className={classes.code} style={{ margin: 0 }}>
              {`/* ${scores[example][0]} */`}
            </pre>
          </AccordionSummary>
          <AccordionDetails style={{ width: '100%', padding: 0 }}>
            <pre className={classes.code}>{scores[example][1]}</pre>
          </AccordionDetails>
        </Accordion>
      </div>
    );
  }, [classes.code, classes.beforeTable, scores, example]);

  const description = React.useMemo(() => {
    return 'Run a sequence of events in order, each firing after the end of the previous event plus the wait duration.';
  }, []);

  const codeExample = React.useMemo(() => {
    return ` 
    const note = clock.createScoredEvent;

    clock.score([
      note(0, (ev) => {
        // call this right away
      }),
      note(1000, (ev) => {
        // after 1 second
      }),
      note(500, (ev) => {
        // after another 500ms
      }),
    ]);
    `;
  }, []);

  return (
    <ExampleHoc
      title={'score'}
      description={description}
      codeExample={codeExample}
      masterClock={masterClock}
      clock={clock}
      onMasterClockTick={() => setEvents(clock.getEvents())}
      onAdd={onadd}
      inputs={Inputs}
      tableHeader={TableHeader}
      mappedEvents={MappedEvents}
      beforeTable={BeforeTable}
    />
  );
};

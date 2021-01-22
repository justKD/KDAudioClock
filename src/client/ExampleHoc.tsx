import * as React from 'react';
import {
  makeStyles,
  createStyles,
  useTheme,
  Theme,
} from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import AddIcon from '@material-ui/icons/Add';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { ClockControls } from './ClockControls';
import { KDAudioClock } from '../KDAudioClock/KDAudioClock';

import { animate } from './util/animate';
import './styles/animations/shake.scss';
import './styles/animations/jello.scss';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    root: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      fontSize: 20,
    },
    paper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      flexGrow: 1,
      marginTop: theme.spacing(5),
      marginBottom: theme.spacing(5),
      padding: theme.spacing(2),
      [theme.breakpoints.down('sm')]: {
        margin: theme.spacing(2),
      },
    },
    headerContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    header: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      [theme.breakpoints.down('xs')]: {
        flexDirection: 'column',
        alignItems: 'center',
      },
    },
    title: {
      flexGrow: 1,
    },
    inputContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      flexGrow: 0,
      marginTop: 10,
      marginBottom: 10,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
      },
    },
    extraInputs: {
      flexGrow: 1,
      marginLeft: 50,
      [theme.breakpoints.down('xs')]: {
        flexGrow: 0,
        marginLeft: 0,
      },
    },
    code: {
      fontFamily: 'Courier New',
      fontSize: '1rem',
      lineHeight: '1rem',
      margin: theme.spacing(2),
      backgroundColor: 'WhiteSmoke',
      width: '100%',
      [theme.breakpoints.down('sm')]: {
        fontSize: '0.85rem',
      },
      [theme.breakpoints.down('xs')]: {
        fontSize: '0.5rem',
      },
    },
  });
});

export const ExampleHoc = ({
  title,
  description,
  masterClock,
  clock,
  tableHeader,
  codeExample,
  moreExamples,
  onAdd,
  inputs,
  mappedEvents,
  onMasterClockTick,
  tableNote,
  beforeTable,
}: {
  title: string;
  description?: string;
  masterClock: KDAudioClock;
  clock: KDAudioClock;
  mappedEvents: React.ReactElement[];
  tableHeader?: React.ReactElement;
  codeExample?: string;
  moreExamples?: string;
  onAdd?: () => void;
  inputs?: React.ReactElement;
  onMasterClockTick?: () => void;
  tableNote?: string;
  beforeTable?: React.ReactElement;
}): React.ReactElement => {
  const classes = useStyles();
  const theme = useTheme();
  const mediaQueryXs = useMediaQuery(theme.breakpoints.down('xs'));

  const playIconRef = React.useRef<SVGSVGElement>();

  const onstart = React.useCallback(() => {
    if (!masterClock.isRunning()) masterClock.start();
    masterClock.setInterval(() => {
      if (onMasterClockTick) onMasterClockTick();
    }, 100);
    clock.start();
  }, [masterClock, onMasterClockTick, clock]);

  const onstop = React.useCallback(() => {
    clock.stop();
    if (onMasterClockTick) onMasterClockTick();
    if (masterClock.isRunning()) masterClock.stop();
  }, [masterClock, onMasterClockTick, clock]);

  const onpause = React.useCallback(() => {
    clock.pause();
  }, [clock]);

  const onadd = React.useCallback(() => {
    if (!clock.isRunning()) {
      const playIcon = playIconRef?.current;
      if (playIcon) animate(playIcon, 'shake');
    }

    if (onAdd) onAdd();
  }, [onAdd, clock]);

  const Header = React.useMemo(() => {
    return (
      <React.Fragment>
        <Typography className={classes.title} variant={'h6'}>
          {title}
        </Typography>
        {description && (
          <Typography variant={'body2'}>{description}</Typography>
        )}
      </React.Fragment>
    );
  }, [classes.title, title, description]);

  const CodeExample = React.useMemo(() => {
    return <pre className={classes.code}>{codeExample}</pre>;
  }, [classes.code, codeExample]);

  const MoreExamples = React.useMemo(() => {
    return (
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
            {'/* More Examples */'}
          </pre>
        </AccordionSummary>
        <AccordionDetails style={{ width: '100%', padding: 0 }}>
          <pre className={classes.code} style={{ margin: 0 }}>
            {moreExamples}
          </pre>
        </AccordionDetails>
      </Accordion>
    );
  }, [classes.code, moreExamples]);

  const Controls = React.useMemo(() => {
    const ExtraInputs = (
      <div className={`${classes.inputContainer} ${classes.extraInputs}`}>
        {inputs}
      </div>
    );

    return (
      <React.Fragment>
        <div className={classes.inputContainer}>
          <ClockControls
            onStart={onstart}
            onStop={onstop}
            onPause={onpause}
            playIconRef={playIconRef}
          />
          <Button variant='outlined' disableElevation onClick={onadd}>
            <AddIcon />
          </Button>
        </div>
        {inputs && ExtraInputs}
      </React.Fragment>
    );
  }, [
    onstart,
    onstop,
    onadd,
    onpause,
    inputs,
    classes.inputContainer,
    classes.extraInputs,
  ]);

  const EventTable = React.useMemo(() => {
    return (
      <TableContainer>
        <Table>
          <TableHead>{tableHeader}</TableHead>
          <TableBody>{mappedEvents}</TableBody>
        </Table>
        {tableNote && <Typography variant={'caption'}>{tableNote}</Typography>}
      </TableContainer>
    );
  }, [mappedEvents, tableHeader, tableNote]);

  return (
    <div className={classes.root}>
      <Paper className={classes.paper} elevation={3}>
        {!mediaQueryXs && (
          <div className={classes.headerContainer}>
            <div className={classes.header}>{Header}</div>
            {codeExample && CodeExample}
            {moreExamples && MoreExamples}
            <div className={classes.header}>{Controls}</div>
          </div>
        )}
        {mediaQueryXs && (
          <div className={classes.header}>
            {Header}
            {codeExample && CodeExample}
            {moreExamples && MoreExamples}
            {Controls}
          </div>
        )}
        {beforeTable}
        {EventTable}
      </Paper>
    </div>
  );
};

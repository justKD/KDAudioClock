import * as React from 'react';
import { makeStyles, createStyles, useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import StopIcon from '@material-ui/icons/Stop';
import PauseIcon from '@material-ui/icons/Pause';

const useStyles = makeStyles(() => {
  return createStyles({
    root: {
      display: 'flex',
      flexGrow: 1,
      marginRight: 8,
    },
    indicator: {
      width: 36,
      height: 36,
      borderRadius: 18,
      marginRight: 8,
      backgroundColor: '#dfe6e9',
    },
    '&.MuiButton-root': {
      maxWidth: 10,
    },
  });
});

export const ClockControls = ({
  onStart,
  onStop,
  onPause,
  playIconRef,
}: {
  onStart?: () => void;
  onStop?: () => void;
  onPause?: () => void;
  playIconRef: React.Ref<SVGSVGElement>;
}): React.ReactElement => {
  const classes = useStyles();
  const theme = useTheme();
  const mediaQueryXs = useMediaQuery(theme.breakpoints.down('xs'));
  const indicatorRef = React.useRef<HTMLDivElement>(null);

  const updateIndicatorColor = React.useCallback(
    (state: 'start' | 'stop' | 'pause') => {
      const indicator = indicatorRef?.current;
      if (!indicator) return;

      let color = '#dfe6e9';
      switch (state) {
        case 'start':
          color = '#a8e6ce';
          break;
        case 'stop':
          color = '#dfe6e9';
          break;
        case 'pause':
          color = '#fff59d';
          break;
      }

      indicator.style.backgroundColor = color;
    },
    []
  );

  const buttonSize = React.useMemo(() => {
    return mediaQueryXs ? 'small' : 'medium';
  }, [mediaQueryXs]);

  return (
    <div className={classes.root}>
      <div className={classes.indicator} ref={indicatorRef} />
      <ButtonGroup size={buttonSize}>
        <Button
          onClick={() => {
            updateIndicatorColor('start');
            if (onStart) onStart();
          }}
        >
          <PlayArrowIcon ref={playIconRef} />
        </Button>
        <Button
          onClick={() => {
            updateIndicatorColor('pause');
            if (onPause) onPause();
          }}
        >
          <PauseIcon />
        </Button>
        <Button
          onClick={() => {
            updateIndicatorColor('stop');
            if (onStop) onStop();
          }}
        >
          <StopIcon />
        </Button>
      </ButtonGroup>
    </div>
  );
};

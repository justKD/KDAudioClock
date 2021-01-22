/**
 * These weren't available at one point for some reason. But when you make the switch to an audio worklet, make sure to
 * check if they are already available in the core definitions before using this fill.
 */

interface AudioNodeOptions {
  channelCount?: number;
  channelCountMode?: 'clamped-max' | 'explicit' | 'max';
  channelInterpretation?: 'discrete' | 'speakers';
}

interface AudioWorkletNodeOptions extends AudioNodeOptions {
  numberOfInputs?: number;
  numberOfOutputs?: number;
  outputChannelCount?: number[];
  parameterData?: Record<string, number>;
  processorOptions?: any;
}

interface AudioWorkletProcessorInterface {
  readonly port: MessagePort;
  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>
  ): boolean;
}

interface AudioParamDescriptor {
  automationRate?: 'a-rate' | 'k-rate';
  defaultValue?: number;
  maxValue?: number;
  minValue?: number;
  name: string;
}

declare const AudioWorkletProcessor: {
  prototype: AudioWorkletProcessorInterface;
  new (options?: AudioWorkletNodeOptions): AudioWorkletProcessorInterface;
};

declare function registerProcessor(
  name: string,
  processorCtor: (new (
    options?: AudioWorkletNodeOptions
  ) => AudioWorkletProcessorInterface) & {
    parameterDescriptors?: AudioParamDescriptor[];
  }
): void;

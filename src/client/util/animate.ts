/**
 * @file animate.ts
 * @author Cadence Holmes
 * @copyright Cadence Holmes 2020
 * @license MIT
 * @fileoverview export const animate
 * Automatically add and remove CSS keyframe animations.
 */

/**
 * Automatically add and remove CSS keyframe animations.
 * @param {any} element - The DOM node to target.
 * @param {string} animation - The name of the animation class.
 * @param {() => void} [callback] - Optional callback function to be called when the animation is completed.
 * @example
 *  import 'jello.css';
 *  const button = document.getElementById("myButton");
 *  button.onclick = () => animate(button, "jello");
 */
export const animate = (
  element: any,
  animation: string,
  callback?: () => void
) => {
  if (!element?.classList) return;

  const animatingKey = '__animate-animating___';

  const stopAnimation = () => {
    const hasAnimation = element.classList.contains(animation);
    if (hasAnimation) element.classList.remove(animation);
    element[animatingKey] = undefined;
  };

  const handleAnimationEnd = () => {
    stopAnimation();
    element.removeEventListener('animationend', handleAnimationEnd);
    if (callback) callback();
  };

  const interruptAnimation = () => {
    stopAnimation();
    element.removeEventListener('animationend', handleAnimationEnd);
    element.parentNode.replaceChild(element, element);
  };

  const startAnimation = () => {
    if (element[animatingKey]) interruptAnimation();
    element[animatingKey] = true;
    element.classList.add(animation);
    element.addEventListener('animationend', handleAnimationEnd);
  };

  startAnimation();
};

/**
 * @file KDUIDManager.ts
 * @version 1.0.0
 * @author Cadence Holmes
 * @copyright Cadence Holmes 2020
 * @license MIT
 * @fileoverview `export const KDUIDManager`
 * Generate RFC4122 version 4 compliant unique identifiers and associate them with entities
 * in a `map`.
 */

import { KDUID } from './KDUID';

/**
 * Generate RFC4122 version 4 compliant unique identifiers and associate them with entities
 * in a `map`.
 * @returns
 */
export const KDUIDManager = () => {
  const generator = KDUID();

  const self = { map: new Map() };

  const _self = {
    /**
     * Generate a unique identifier and associate it with the `target` entity.
     * Internally, these associations are stored in a `new Map()`. The target entity
     * is set as the key, and the UID string is set as the value. If the target entity
     * already exists in the map, the existing association is deleted and a new UID is
     * mapped to that entity.
     * @param {any} target - `any` entity to be mapped to a unique identifier.
     */
    generateUIDFor: (target: any) => {
      const uid = generator.generate();
      if (self.map.has(target)) self.map.delete(target);
      self.map.set(target, uid);
      return uid;
    },

    /**
     * Retrieve the UID string for the associated object.
     * @param {any} target - The entity reference.
     * @returns {string} Returns the UID `string`.
     */
    getUIDFor: (target: any): string => self.map.get(target),

    /**
     * Retrieve the key for the associated UID string.
     * @param {string} uid - The UID string.
     * @returns {any} Returns the associated object.
     */
    getKeyFor: (uid: string): any => {
      const entries = Array.from(self.map.entries());
      for (let i in entries) {
        const [key, value] = entries[i];
        if (value === uid) return key;
      }
      return;
    },

    /**
     * Check if there is an existing UID for the target object.
     * @param {any} target - The entity reference.
     * @returns {boolean}
     */
    hasUIDFor: (target: any): boolean => self.map.has(target),

    /**
     * Retrieve a new array containing all keys held in the map.
     * @returns {any[]}
     */
    keys: (): any[] => Array.from(self.map.keys()),

    /**
     * Retrieve a new array containing all values (uids) held in the map.
     * @returns {string[]}
     */
    uids: (): string[] => Array.from(self.map.values()),

    /**
     * Retrieve a new array containing individual arrays [key, value] for each entry.
     * @returns {[any, string][]}
     */
    entries: (): [any, string][] => Array.from(self.map.entries()),

    /**
     * Delete a UID association for a given UID string.
     * @param {string} uid - The UID string.
     */
    deleteUID: (uid: string) => {
      const entries = Array.from(self.map.entries());
      for (let i in entries) {
        const [key, value] = entries[i];
        if (value === uid) {
          self.map.delete(key);
          break;
        }
      }
    },

    /**
     * Delete a UID association for a given target.
     * @param {any} target - The entity reference.
     */
    deleteUIDFor: (target: any) => {
      if (self.map.has(target)) self.map.delete(target);
    },

    /**
     * Clear all currently held target:UID associations.
     */
    deleteAll: () => self.map.clear(),

    /**
     * Retrieve a reference to the internal map object.
     * @returns {Map<any, string>}
     */
    getMap: (): Map<any, string> => self.map,
  };

  Object.freeze(_self);

  return _self;
};

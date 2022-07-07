/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview This file is a universal registry that provides generic methods
 *    for registering and unregistering different types of classes.
 */

/**
 * This file is a universal registry that provides generic methods
 *    for registering and unregistering different types of classes.
 * @namespace Blockly.registry
 */


/* eslint-disable-next-line no-unused-vars */
import {Abstract} from './events/events_abstract';
/* eslint-disable-next-line no-unused-vars */
import {Field} from './field';
/* eslint-disable-next-line no-unused-vars */
import {IBlockDragger} from './interfaces/i_block_dragger';
/* eslint-disable-next-line no-unused-vars */
import {IConnectionChecker} from './interfaces/i_connection_checker';
/* eslint-disable-next-line no-unused-vars */
import {IFlyout} from './interfaces/i_flyout';
/* eslint-disable-next-line no-unused-vars */
import {IMetricsManager} from './interfaces/i_metrics_manager';
/* eslint-disable-next-line no-unused-vars */
import {ISerializer} from './interfaces/i_serializer';
/* eslint-disable-next-line no-unused-vars */
import {IToolbox} from './interfaces/i_toolbox';
/* eslint-disable-next-line no-unused-vars */
import {Cursor} from './keyboard_nav/cursor';
/* eslint-disable-next-line no-unused-vars */
import {Options} from './options';
/* eslint-disable-next-line no-unused-vars */
import {Renderer} from './renderers/common/renderer';
/* eslint-disable-next-line no-unused-vars */
import {Theme} from './theme';
/* eslint-disable-next-line no-unused-vars */
import {ToolboxItem} from './toolbox/toolbox_item';


/**
 * A map of maps. With the keys being the type and name of the class we are
 * registering and the value being the constructor function.
 * e.g. {'field': {'field_angle': Blockly.FieldAngle}}
 */
const typeMap: {
  [key: string]:
      {[key: string]: (new () => AnyDuringMigration)|AnyDuringMigration}
} = Object.create(null);
export const TEST_ONLY = {typeMap};

/**
 * A map of maps. With the keys being the type and caseless name of the class we
 * are registring, and the value being the most recent cased name for that
 * registration.
 */
const nameMap: {[key: string]: {[key: string]: string}} = Object.create(null);

/**
 * The string used to register the default class for a type of plugin.
 * @alias Blockly.registry.DEFAULT
 */
export const DEFAULT = 'default';

/**
 * A name with the type of the element stored in the generic.
 * @alias Blockly.registry.Type
 */
export class Type<T> {
  static CONNECTION_CHECKER = new Type<IConnectionChecker>('connectionChecker');
  static CURSOR = new Type<Cursor>('cursor');
  static EVENT = new Type<Abstract>('event');
  static FIELD = new Type<Field>('field');
  static RENDERER = new Type<Renderer>('renderer');
  static TOOLBOX = new Type<IToolbox>('toolbox');
  static THEME = new Type<Theme>('theme');
  static TOOLBOX_ITEM = new Type<ToolboxItem>('toolboxItem');
  static FLYOUTS_VERTICAL_TOOLBOX = new Type<IFlyout>('flyoutsVerticalToolbox');
  static FLYOUTS_HORIZONTAL_TOOLBOX =
      new Type<IFlyout>('flyoutsHorizontalToolbox');
  static METRICS_MANAGER = new Type<IMetricsManager>('metricsManager');
  static BLOCK_DRAGGER = new Type<IBlockDragger>('blockDragger');
  /** @internal */
  static SERIALIZER = new Type<ISerializer>('serializer');

  /** @param name The name of the registry type. */
  constructor(private readonly name: string) {}

  /**
   * Returns the name of the type.
   * @return The name.
   */
  toString(): string {
    return this.name;
  }
}

// Type.CONNECTION_CHECKER = new Type('connectionChecker');

// Type.CURSOR = new Type('cursor');

// Type.EVENT = new Type('event');

// Type.FIELD = new Type('field');

// Type.RENDERER = new Type('renderer');

// Type.TOOLBOX = new Type('toolbox');

// Type.THEME = new Type('theme');

// Type.TOOLBOX_ITEM = new Type('toolboxItem');

// Type.FLYOUTS_VERTICAL_TOOLBOX = new Type('flyoutsVerticalToolbox');

// Type.FLYOUTS_HORIZONTAL_TOOLBOX = new Type('flyoutsHorizontalToolbox');

// Type.METRICS_MANAGER = new Type('metricsManager');

// Type.BLOCK_DRAGGER = new Type('blockDragger');

// Type.SERIALIZER = new Type('serializer');

/**
 * Registers a class based on a type and name.
 * @param type The type of the plugin.
 *     (e.g. Field, Renderer)
 * @param name The plugin's name. (Ex. field_angle, geras)
 * @param registryItem The class or object to register.
 * @param opt_allowOverrides True to prevent an error when overriding an already
 *     registered item.
 * @throws {Error} if the type or name is empty, a name with the given type has
 *     already been registered, or if the given class or object is not valid for
 *     its type.
 * @alias Blockly.registry.register
 */
export function register<T>(
    type: string|Type<T>, name: string,
    registryItem: (new (...p1: AnyDuringMigration[]) => T)|null|
    AnyDuringMigration,
    opt_allowOverrides?: boolean): void {
  if (!(type instanceof Type) && typeof type !== 'string' ||
      String(type).trim() === '') {
    throw Error(
        'Invalid type "' + type + '". The type must be a' +
        ' non-empty string or a Blockly.registry.Type.');
  }
  type = String(type).toLowerCase();

  if (typeof name !== 'string' || name.trim() === '') {
    throw Error(
        'Invalid name "' + name + '". The name must be a' +
        ' non-empty string.');
  }
  const caselessName = name.toLowerCase();
  if (!registryItem) {
    throw Error('Can not register a null value');
  }
  let typeRegistry = typeMap[type];
  let nameRegistry = nameMap[type];
  // If the type registry has not been created, create it.
  if (!typeRegistry) {
    typeRegistry = typeMap[type] = Object.create(null);
    nameRegistry = nameMap[type] = Object.create(null);
  }

  // Validate that the given class has all the required properties.
  validate(type, registryItem);

  // Don't throw an error if opt_allowOverrides is true.
  if (!opt_allowOverrides && typeRegistry[caselessName]) {
    throw Error(
        'Name "' + caselessName + '" with type "' + type +
        '" already registered.');
  }
  typeRegistry[caselessName] = registryItem;
  nameRegistry[caselessName] = name;
}

/**
 * Checks the given registry item for properties that are required based on the
 * type.
 * @param type The type of the plugin. (e.g. Field, Renderer)
 * @param registryItem A class or object that we are checking for the required
 *     properties.
 */
function validate(type: string, registryItem: Function|AnyDuringMigration) {
  switch (type) {
    case String(Type.FIELD):
      if (typeof registryItem.fromJson !== 'function') {
        throw Error('Type "' + type + '" must have a fromJson function');
      }
      break;
  }
}

/**
 * Unregisters the registry item with the given type and name.
 * @param type The type of the plugin.
 *     (e.g. Field, Renderer)
 * @param name The plugin's name. (Ex. field_angle, geras)
 * @alias Blockly.registry.unregister
 */
export function unregister<T>(type: string|Type<T>, name: string) {
  type = String(type).toLowerCase();
  name = name.toLowerCase();
  const typeRegistry = typeMap[type];
  if (!typeRegistry || !typeRegistry[name]) {
    console.warn(
        'Unable to unregister [' + name + '][' + type + '] from the ' +
        'registry.');
    return;
  }
  delete typeMap[type][name];
  delete nameMap[type][name];
}

/**
 * Gets the registry item for the given name and type. This can be either a
 * class or an object.
 * @param type The type of the plugin.
 *     (e.g. Field, Renderer)
 * @param name The plugin's name. (Ex. field_angle, geras)
 * @param opt_throwIfMissing Whether or not to throw an error if we are unable
 *     to find the plugin.
 * @return The class or object with the given name and type or null if none
 *     exists.
 */
function getItem<T>(
    type: string|Type<T>, name: string, opt_throwIfMissing?: boolean):
    (new (...p1: AnyDuringMigration[]) => T)|null|AnyDuringMigration {
  type = String(type).toLowerCase();
  name = name.toLowerCase();
  const typeRegistry = typeMap[type];
  if (!typeRegistry || !typeRegistry[name]) {
    const msg = 'Unable to find [' + name + '][' + type + '] in the registry.';
    if (opt_throwIfMissing) {
      throw new Error(
          msg + ' You must require or register a ' + type + ' plugin.');
    } else {
      console.warn(msg);
    }
    return null;
  }
  return typeRegistry[name];
}

/**
 * Returns whether or not the registry contains an item with the given type and
 * name.
 * @param type The type of the plugin.
 *     (e.g. Field, Renderer)
 * @param name The plugin's name. (Ex. field_angle, geras)
 * @return True if the registry has an item with the given type and name, false
 *     otherwise.
 * @alias Blockly.registry.hasItem
 */
export function hasItem<T>(type: string|Type<T>, name: string): boolean {
  type = String(type).toLowerCase();
  name = name.toLowerCase();
  const typeRegistry = typeMap[type];
  if (!typeRegistry) {
    return false;
  }
  return !!typeRegistry[name];
}

/**
 * Gets the class for the given name and type.
 * @param type The type of the plugin.
 *     (e.g. Field, Renderer)
 * @param name The plugin's name. (Ex. field_angle, geras)
 * @param opt_throwIfMissing Whether or not to throw an error if we are unable
 *     to find the plugin.
 * @return The class with the given name and type or null if none exists.
 * @alias Blockly.registry.getClass
 */
export function getClass<T>(
    type: string|Type<T>, name: string, opt_throwIfMissing?: boolean):
    (new (...p1: AnyDuringMigration[]) => T)|null {
  return getItem(type, name, opt_throwIfMissing) as (
             new (...p1: AnyDuringMigration[]) => T) |
      null;
}

/**
 * Gets the object for the given name and type.
 * @param type The type of the plugin.
 *     (e.g. Category)
 * @param name The plugin's name. (Ex. logic_category)
 * @param opt_throwIfMissing Whether or not to throw an error if we are unable
 *     to find the object.
 * @return The object with the given name and type or null if none exists.
 * @alias Blockly.registry.getObject
 */
export function getObject<T>(
    type: string|Type<T>, name: string, opt_throwIfMissing?: boolean): T|null {
  return getItem(type, name, opt_throwIfMissing) as T;
}

/**
 * Returns a map of items registered with the given type.
 * @param type The type of the plugin. (e.g. Category)
 * @param opt_cased Whether or not to return a map with cased keys (rather than
 *     caseless keys). False by default.
 * @param opt_throwIfMissing Whether or not to throw an error if we are unable
 *     to find the object. False by default.
 * @return A map of objects with the given type, or null if none exists.
 * @alias Blockly.registry.getAllItems
 */
export function getAllItems<T>(
    type: string|Type<T>, opt_cased: boolean, opt_throwIfMissing?: boolean):
    {[key: string]: T|null|(new (...p1: AnyDuringMigration[]) => T)}|null {
  type = String(type).toLowerCase();
  const typeRegistry = typeMap[type];
  if (!typeRegistry) {
    const msg = `Unable to find [${type}] in the registry.`;
    if (opt_throwIfMissing) {
      throw new Error(`${msg} You must require or register a ${type} plugin.`);
    } else {
      console.warn(msg);
    }
    return null;
  }
  if (!opt_cased) {
    return typeRegistry;
  }
  const nameRegistry = nameMap[type];
  const casedRegistry = Object.create(null);
  const keys = Object.keys(typeRegistry);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    casedRegistry[nameRegistry[key]] = typeRegistry[key];
  }
  return casedRegistry;
}

/**
 * Gets the class from Blockly options for the given type.
 * This is used for plugins that override a built in feature. (e.g. Toolbox)
 * @param type The type of the plugin.
 * @param options The option object to check for the given plugin.
 * @param opt_throwIfMissing Whether or not to throw an error if we are unable
 *     to find the plugin.
 * @return The class for the plugin.
 * @alias Blockly.registry.getClassFromOptions
 */
export function getClassFromOptions<T>(
    type: Type<T>, options: Options, opt_throwIfMissing?: boolean):
    (new (...p1: AnyDuringMigration[]) => T)|null {
  const typeName = type.toString();
  const plugin = options.plugins[typeName] || DEFAULT;

  // If the user passed in a plugin class instead of a registered plugin name.
  if (typeof plugin === 'function') {
    return plugin;
  }
  return getClass(type, plugin, opt_throwIfMissing);
}
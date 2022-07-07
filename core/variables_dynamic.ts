/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utility functions for handling typed variables.
 */

/**
 * Utility functions for handling typed variables.
 *
 * @namespace Blockly.VariablesDynamic
 */


import {Blocks} from './blocks';
import {Msg} from './msg';
import * as xml from './utils/xml';
import {VariableModel} from './variable_model';
import * as Variables from './variables';
/* eslint-disable-next-line no-unused-vars */
import {Workspace} from './workspace';
/* eslint-disable-next-line no-unused-vars */
import {WorkspaceSvg} from './workspace_svg';


/**
 * String for use in the "custom" attribute of a category in toolbox XML.
 * This string indicates that the category should be dynamically populated with
 * variable blocks.
 * See also Blockly.Variables.CATEGORY_NAME and
 * Blockly.Procedures.CATEGORY_NAME.
 * @alias Blockly.VariablesDynamic.CATEGORY_NAME
 */
export const CATEGORY_NAME = 'VARIABLE_DYNAMIC';

function stringButtonClickHandler(button: AnyDuringMigration) {
  Variables.createVariableButtonHandler(
      button.getTargetWorkspace(), undefined, 'String');
}
export const onCreateVariableButtonClick_String = stringButtonClickHandler;
function numberButtonClickHandler(button: AnyDuringMigration) {
  Variables.createVariableButtonHandler(
      button.getTargetWorkspace(), undefined, 'Number');
}
export const onCreateVariableButtonClick_Number = numberButtonClickHandler;

function colourButtonClickHandler(button: AnyDuringMigration) {
  Variables.createVariableButtonHandler(
      button.getTargetWorkspace(), undefined, 'Colour');
}
export const onCreateVariableButtonClick_Colour = colourButtonClickHandler;

/**
 * Construct the elements (blocks and button) required by the flyout for the
 * variable category.
 * @param workspace The workspace containing variables.
 * @return Array of XML elements.
 * @alias Blockly.VariablesDynamic.flyoutCategory
 */
export function flyoutCategory(workspace: WorkspaceSvg): Element[] {
  let xmlList = new Array<Element>();
  let button = document.createElement('button');
  button.setAttribute('text', Msg['NEW_STRING_VARIABLE']);
  button.setAttribute('callbackKey', 'CREATE_VARIABLE_STRING');
  xmlList.push(button);
  button = document.createElement('button');
  button.setAttribute('text', Msg['NEW_NUMBER_VARIABLE']);
  button.setAttribute('callbackKey', 'CREATE_VARIABLE_NUMBER');
  xmlList.push(button);
  button = document.createElement('button');
  button.setAttribute('text', Msg['NEW_COLOUR_VARIABLE']);
  button.setAttribute('callbackKey', 'CREATE_VARIABLE_COLOUR');
  xmlList.push(button);

  workspace.registerButtonCallback(
      'CREATE_VARIABLE_STRING', stringButtonClickHandler);
  workspace.registerButtonCallback(
      'CREATE_VARIABLE_NUMBER', numberButtonClickHandler);
  workspace.registerButtonCallback(
      'CREATE_VARIABLE_COLOUR', colourButtonClickHandler);

  // AnyDuringMigration because:  Argument of type 'WorkspaceSvg' is not
  // assignable to parameter of type 'Workspace'.
  const blockList = flyoutCategoryBlocks(workspace as AnyDuringMigration);
  xmlList = xmlList.concat(blockList);
  return xmlList;
}

/**
 * Construct the blocks required by the flyout for the variable category.
 * @param workspace The workspace containing variables.
 * @return Array of XML block elements.
 * @alias Blockly.VariablesDynamic.flyoutCategoryBlocks
 */
export function flyoutCategoryBlocks(workspace: Workspace): Element[] {
  const variableModelList = workspace.getAllVariables();

  const xmlList = [];
  if (variableModelList.length > 0) {
    if (Blocks['variables_set_dynamic']) {
      const firstVariable = variableModelList[variableModelList.length - 1];
      const block = xml.createElement('block');
      block.setAttribute('type', 'variables_set_dynamic');
      // AnyDuringMigration because:  Argument of type 'number' is not
      // assignable to parameter of type 'string'.
      block.setAttribute('gap', 24 as AnyDuringMigration);
      // AnyDuringMigration because:  Argument of type 'Element | null' is not
      // assignable to parameter of type 'Node'.
      block.appendChild(
          Variables.generateVariableFieldDom(firstVariable) as
          AnyDuringMigration);
      xmlList.push(block);
    }
    if (Blocks['variables_get_dynamic']) {
      variableModelList.sort(VariableModel.compareByName);
      for (let i = 0, variable; variable = variableModelList[i]; i++) {
        const block = xml.createElement('block');
        block.setAttribute('type', 'variables_get_dynamic');
        // AnyDuringMigration because:  Argument of type 'number' is not
        // assignable to parameter of type 'string'.
        block.setAttribute('gap', 8 as AnyDuringMigration);
        // AnyDuringMigration because:  Argument of type 'Element | null' is not
        // assignable to parameter of type 'Node'.
        block.appendChild(
            Variables.generateVariableFieldDom(variable) as AnyDuringMigration);
        xmlList.push(block);
      }
    }
  }
  return xmlList;
}
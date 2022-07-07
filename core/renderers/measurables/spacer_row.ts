/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object representing a spacer between two rows.
 */

/**
 * Object representing a spacer between two rows.
 * @class
 */


/* eslint-disable-next-line no-unused-vars */
import {ConstantProvider} from '../common/constants';

import {InRowSpacer} from './in_row_spacer';
import {Row} from './row';
import {Types} from './types';


/**
 * An object containing information about a spacer between two rows.
 * @struct
 * @alias Blockly.blockRendering.SpacerRow
 */
export class SpacerRow extends Row {
  followsStatement = false;

  precedesStatement = false;

  override widthWithConnectedBlocks = 0;
  override elements: InRowSpacer[];

  /**
   * @param constants The rendering constants provider.
   * @param height The height of the spacer.
   * @param width The width of the spacer.
   * @internal
   */
  constructor(
      constants: ConstantProvider, public override height: number,
      public override width: number) {
    super(constants);
    this.type |= Types.SPACER | Types.BETWEEN_ROW_SPACER;

    this.elements = [new InRowSpacer(this.constants_, width)];
  }

  override measure() {}
}
// NOP.  Width and height were set at creation.
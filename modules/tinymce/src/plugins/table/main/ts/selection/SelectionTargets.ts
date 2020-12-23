import { Menu, Toolbar } from '@ephox/bridge';
import { Selections } from '@ephox/darwin';
import { Arr, Cell, Optional, Thunk } from '@ephox/katamari';
import { RunOperation, Structs, TableLookup, Warehouse } from '@ephox/snooker';
import { SugarElement, SugarNode } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import * as Util from '../core/Util';
import * as TableTargets from '../queries/TableTargets';
import * as TableSelection from './TableSelection';

export type SelectionTargets = ReturnType<typeof getSelectionTargets>;

type UiApi = Menu.MenuItemInstanceApi | Toolbar.ToolbarButtonInstanceApi;

// Not sure if the details should vary by the target e.g. there is RunOperation.onCell, onPasteable, etc.
const getDetails = (targets: RunOperation.CombinedTargets): Optional<Structs.DetailExt[]> => {
  const tableOpt = TableLookup.table(targets.element);
  return tableOpt.bind((table) => {
    const warehouse = Warehouse.fromTable(table);
    return RunOperation.onCells(warehouse, targets);
  });
};

const isLocked = (details: Structs.DetailExt[]) => Arr.exists(details, (detail) => detail.isLocked);

export const getSelectionTargets = (editor: Editor, selections: Selections) => {
  const targets = Cell<Optional<RunOperation.CombinedTargets>>(Optional.none());
  const changeHandlers = Cell([]);
  const selectionDetails = Cell<Optional<Structs.DetailExt[]>>(Optional.none());

  // Maybe change this to be an object that includes the table as well as the warehouse or details
  const findTargets = (): Optional<RunOperation.CombinedTargets> => TableSelection.getSelectionStartCellOrCaption(Util.getSelectionStart(editor))
    .bind((cellOrCaption) => {
      const table = TableLookup.table(cellOrCaption);
      const isCaption = (elem: SugarElement<HTMLTableCaptionElement | HTMLTableCellElement>): elem is SugarElement<HTMLTableCaptionElement> => SugarNode.name(elem) === 'caption';
      return table.map((table) => {
        if (isCaption(cellOrCaption)) {
          return TableTargets.noMenu(cellOrCaption);
        } else {
          return TableTargets.forMenu(selections, table, cellOrCaption);
        }
      });
    });

  const resetTargets = () => {
    // Reset the targets
    targets.set(Thunk.cached(findTargets)());

    // Reset the selection details
    targets.get().each((targets) => {
      selectionDetails.set(getDetails(targets));
    });

    // Trigger change handlers
    Arr.each(changeHandlers.get(), (handler) => handler());
  };

  // Maybe include id as a parameter
  const onSetup = (api: UiApi, isDisabled: (targets: RunOperation.CombinedTargets) => boolean/* , type?: TargetTypes */) => {

    const handler = () => targets.get().fold(() => {
      api.setDisabled(true);
    }, (targets) => {
      api.setDisabled(isDisabled(targets));
    });

    // Execute the handler to set the initial state
    handler();

    // Register the handler so we can update the state when resetting targets
    changeHandlers.set(changeHandlers.get().concat([ handler ]));

    return () => {
      changeHandlers.set(Arr.filter(changeHandlers.get(), (h) => h !== handler));
    };
  };

  const onSetupTable = (api: UiApi) => onSetup(api, (_) => false);
  const onSetupCellOrRow = (api: UiApi) => onSetup(api, (targets) => SugarNode.name(targets.element) === 'caption');
  // Need to look up columns - might be able to use uniqueColumns function from ...
  const onSetupColumn = (api: UiApi) => onSetup(api, (targets) => SugarNode.name(targets.element) === 'caption' || selectionDetails.get().exists(isLocked));
  const onSetupPasteable = (getClipboardData: () => Optional<SugarElement[]>, rowOrCol: 'row' | 'column') => (api: UiApi) => onSetup(api, (targets) =>
    SugarNode.name(targets.element) === 'caption' || getClipboardData().isNone() || (rowOrCol === 'column' && selectionDetails.get().exists(isLocked))
  );
  // TODO: Need to disable if any cells in selection are part of locked column
  const onSetupMergeable = (api: UiApi) => onSetup(api, (targets) => targets.mergable.isNone());
  const onSetupUnmergeable = (api: UiApi) => onSetup(api, (targets) => targets.unmergable.isNone());

  editor.on('NodeChange ExecCommand TableSelectorChange', resetTargets);

  return {
    onSetupTable,
    onSetupCellOrRow,
    onSetupColumn,
    onSetupPasteable,
    onSetupMergeable,
    onSetupUnmergeable,
    resetTargets,
    targets: () => targets.get()
  };
};

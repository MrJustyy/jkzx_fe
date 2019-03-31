import SwitchCell from './cells/SwitchCell';

class FormManager {
  public cellNodes: Array<{
    node: SwitchCell;
    id: string;
  }> = [];

  public registeCell(colId: string, cellNode: SwitchCell) {
    if (this.cellNodes && this.cellNodes.findIndex(item => item.id === colId) === -1) {
      this.cellNodes.push({
        node: cellNode,
        id: colId,
      });
    } else {
      this.cellNodes = [
        {
          node: cellNode,
          id: colId,
        },
      ];
    }
  }

  public getNextCell(colId: string, isCur = false) {
    if (!this.cellNodes) return null;
    const cellIndex = this.cellNodes.findIndex(item => item.id === colId);
    if (cellIndex !== -1) {
      const nextCell = this.cellNodes[isCur ? cellIndex : cellIndex + 1];
      if (nextCell) {
        return nextCell.node;
      }
    }
    return null;
  }
}

export default FormManager;

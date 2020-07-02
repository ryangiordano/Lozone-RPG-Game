import { DialogListItem } from "./DialogListItem";
import { PanelContainer } from "./PanelContainer";
import { HasOptions } from "./UserInterface";
import { KeyboardControlKeys } from "./Keyboard";
import { BLACK } from "../../utility/Constants";

export class UIPanel extends PanelContainer implements HasOptions {
  protected caret: Phaser.GameObjects.Text;
  public options: any[] = [];
  protected focusedIndex: number = 0;

  constructor(
    dimensions: Coords,
    pos: Coords,
    spriteKey: string,
    scene: Phaser.Scene,
    public escapable: boolean = true,
    id?: string
  ) {
    super(dimensions, pos, spriteKey, scene, id);
  }
  protected getNumberOfVisibleOptions() {
    if (this.options.length) {
      return Math.floor(this.panel.height / this.options[0].height);
    }
    return 1;
  }

  protected optionsPerPage() {
    if (this.options.length) {
      return Math.ceil(this.panel.height / this.options[0].height);
    }
    return 1;
  }

  protected buildPages() {
    return this.options.reduce((acc, p) => {
      if (
        acc.length <= 0 ||
        acc[acc.length - 1].length >= this.optionsPerPage()
      ) {
        acc.push([p]);
      } else {
        acc[acc.length - 1].push(p);
      }
      return acc;
    }, []);
  }
  protected pages: DialogListItem[][];
  protected currentPageIndex: number = 0;
  protected renderPage() {
    let toAdd = this.pages[this.currentPageIndex];
    let lastPlacement = 20;
    toAdd.forEach((o, i) => {
      o.y = i > 0 ? lastPlacement + 40 : lastPlacement;
      lastPlacement = o.y;
      this.add(o);
    });
  }
  protected getcurrentPage() {
    return this.pages[this.currentPageIndex];
  }
  protected showNextPage() {
    this.currentPageIndex = Math.min(
      this.currentPageIndex + 1,
      this.pages.length - 1
    );
    this.setVisibilityByCurrentPage();
    this.renderPage();
    this.focusOption(0);
    this.setCaret();
  }
  protected showPreviousPage() {
    this.currentPageIndex = Math.max(this.currentPageIndex - 1, 0);
    this.setVisibilityByCurrentPage();
    this.renderPage();
    this.focusOption(this.getcurrentPage().length - 1);
    this.setCaret();
  }

  protected setVisibilityByCurrentPage() {
    this.pages.forEach((p, i) => {
      p.forEach((x) => x.setVisible(i === this.currentPageIndex));
    });
  }

  public show() {
    this.createCaret();
    this.pages = this.buildPages();
    this.setVisibilityByCurrentPage();

    this.setCaret();
    this.bringToTop(this.caret);
    this.visible = true;
    this.renderPage();
    this.showChildren();
    this.focusOption(this.getLastFocused());
  }

  private lastFocused: number = 0;

  private getLastFocused() {
    return this.lastFocused > this.options.length - 1
      ? this.options.length - 1
      : this.lastFocused;
  }
  private setLastFocused(index: number) {
    this.lastFocused = index;
  }

  public close() {
    this.destroyCaret();
    this.visible = false;
    this.handleClose();
    this.hideChildren();
  }

  protected destroyCaret() {
    this.caret && this.caret.destroy(true);
    delete this.caret;
  }

  public addOption(
    text: string,
    selectCallback: Function,
    focusCallback?: Function
  ): UIPanel {
    const toAdd = new DialogListItem(
      this.scene,
      0,
      0,
      text,
      {
        fontFamily: "pixel",
        fontSize: "32px",
        fill: BLACK.hex,
      },
      selectCallback,
      focusCallback
    );
    toAdd.setPadding(30, 0, 0, 0);
    this.bringToTop(toAdd);
    this.options.push(toAdd);
    return this;
  }

  resetOptions() {
    this.remove(this.options);
  }

  public removeOption(name: string) {
    this.options.filter((listItem) => listItem.name !== name);
  }

  public focusOption(index: number) {
    this.getcurrentPage().forEach((option, i) => {
      if (i === index) {
        this.focusedIndex = i;
        option.focused = true;
        option.focus();
      } else {
        option.focused = false;
      }
    });
    this.setLastFocused(index);
    this.setCaret();
  }
  public getFocusIndex() {
    const current = this.getcurrentPage().find((opt) => opt.focused);
    return this.getcurrentPage().findIndex((opt) => opt === current);
  }

  public focusNextOption() {
    const index = this.getFocusIndex();
    /** If we're at the bottom of the list */
    if (index + 1 > this.getcurrentPage().length - 1) {
      /** If we're on the last page, do nothing */
      if (this.currentPageIndex === this.pages.length - 1) {
        return;
      }
      return this.showNextPage();
    }

    const toFocus =
      index >= this.getcurrentPage().length - 1 ? index : index + 1;
    this.focusOption(toFocus);
  }

  public focusPreviousOption() {
    const index = this.getFocusIndex();
    /**If we're at the top of the list */
    if (index - 1 < 0) {
      /** If we're on the first page, do nothing */
      if (this.currentPageIndex === 0) {
        return;
      }
      return this.showPreviousPage();
    }
    const toFocus = index <= 0 ? this.getcurrentPage().length - 1 : index - 1;
    this.focusOption(toFocus);
  }

  public getFocusedOption() {
    const option = this.getcurrentPage().find((opt) => opt.focused);
    if (option) {
      return option;
    }
  }

  public selectFocusedOption() {
    const toSelect = this.getFocusedOption();
    if (toSelect && !toSelect.disabled) {
      toSelect.select();
    }
  }

  protected createCaret() {
    if (this.caret) {
      return;
    }
    this.caret = this.scene.add.text(-100, -100, ">", {
      fontFamily: "pixel",
      fontSize: "32px",
      fill: BLACK.hex,
    });
    this.add(this.caret);
    //TODO: Refactor to create a correct cursor object
    this.caret.type = "Cursor";
  }

  protected setCaret() {
    const focusedOption = this.getFocusedOption();
    if (this.caret && focusedOption) {
      this.caret.x = focusedOption.x + 5;
      this.caret.y = focusedOption.y;
      this.bringToTop(this.caret);
    }
  }

  public onKeyDown(key: KeyboardControlKeys) {
    switch (key) {
      case KeyboardControlKeys.UP:
      case KeyboardControlKeys.LEFT:
        this.scene.sound.play("menu-tick", { volume: 0.1 });
        this.focusPreviousOption();

        break;
      case KeyboardControlKeys.RIGHT:
      case KeyboardControlKeys.DOWN:
        this.scene.sound.play("menu-tick", { volume: 0.1 });
        this.focusNextOption();

        break;
      case KeyboardControlKeys.ESC:
        this.emit("escape-pressed");
        this.parentContainer["traverseBackward"]();
        break;
      case KeyboardControlKeys.SPACE:
        this.scene.sound.play("menu-select", { volume: 0.1 });
        this.selectFocusedOption();
        break;
    }
  }

  public refreshPanel(callback?: Function) {
    this.list = this.list.filter((item) => item.type !== "Text");
    this.options = [];

    callback && callback();
  }
}

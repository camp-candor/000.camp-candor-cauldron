### Sower Terminal OS: Native Blessed Menu Injection & UI Buzzer Spec
A step-by-step engineering specification detailing the native integration of the Goblin Showrunner UI into the worker-sower-engine terminal operating system using blessed grid widgets and the ste.hunt() Redux-style action bus.

--------------------------------------------------------------------------------

#### 1. Unit Scaffolding & Action Declarations
##### Step 1: Scaffolding the 00.goblin.unit
1. Execute Library Menu  $\longrightarrow$  Create Unit with verb goblin.
2. Relocate output directory to 000.sower/00.goblin.unit/.
3. Execute Update Library to wire exports into BEE.ts.
##### Step 2: Action Definitions
*   **995.library/98.menu.unit/menu.action.ts**  **:**
```typescript
export const GOBLIN_MENU = '[Menu action] Goblin Menu';
export class GoblinMenu implements Action {
  readonly type = GOBLIN_MENU;
  constructor(public bale: MenuBit) {}
}

```
*   **000.sower/00.goblin.unit/goblin.action.ts**  **:**
```typescript
export const DRAFT_SCENE = '[Goblin action] Draft Scene';
export const COMMIT_SCENE = '[Goblin action] Commit Scene';

```

--------------------------------------------------------------------------------

#### 2. Menu Reduction & Interactive Routing
##### 995.library/98.menu.unit/buz/menu.goblin.ts
Chains 81.grid.unit, 83.console.unit, and 85.choice.unit to render the showrunner interface:
```typescript
import { MenuModel } from '../menu.model';
import MenuBit from '../fce/menu.bit';
import State from '../../99.core/state';
import * as Grid from '../../val/grid';
import * as Align from '../../val/align';
import * as Color from '../../val/console-color';
import * as ActMnu from '../menu.action';
import * as ActChc from '../../85.choice.unit/choice.action';
import * as ActGrd from '../../81.grid.unit/grid.action';
import * as ActCns from '../../83.console.unit/console.action';
import * as ActGob from '../../act/goblin.action';

export const goblinMenu = async (cpy: MenuModel, bal: MenuBit, ste: State) => {
  await ste.hunt(ActCns.UPDATE_CONSOLE, { idx: 'cns00', src: 'Entering GOBLIN SHOWRUNNER MENU...' });

  const lst = [
    ActGob.DRAFT_SCENE.split(']')[1],
    ActGob.COMMIT_SCENE.split(']')[1]
  ];

  let bit = await ste.hunt(ActGrd.UPDATE_GRID, { x: 0, y: 4, xSpan: 4, ySpan: 12 });
  bit = await ste.hunt(ActChc.OPEN_CHOICE, {
    dat: { clr0: Color.BLACK, clr1: Color.MAGENTA },
    src: Align.VERTICAL,
    lst,
    net: bit.grdBit.dat,
  });

  const src = bit.chcBit.src;
  switch (src) {
    case ActGob.DRAFT_SCENE.split(']')[1]:
      await global.SOWER.hunt(ActGob.DRAFT_SCENE, {});
      break;
    case ActGob.COMMIT_SCENE.split(']')[1]:
      await global.SOWER.hunt(ActGob.COMMIT_SCENE, {});
      break;
  }

  setTimeout(async () => {
    await ste.hunt(ActMnu.UPDATE_MENU, {});
  }, 1111);

  return cpy;
};

```
##### Wiring Reducers
*   **menu.buzzer.ts**  **:**  export { goblinMenu } from './buz/menu.goblin';
*   **menu.reduce.ts**  **:**
```typescript
case Act.GOBLIN_MENU:
  return Buzz.goblinMenu(clone(model), act.bale, state);

```
*   **00.menu.buzz.ts**  **:**  Injects ActMnu.GOBLIN_MENU into the primary root menu list.

--------------------------------------------------------------------------------

#### 3. Execution Buzzers: Draft & Commit (000.sower/00.goblin.unit/buz/goblin.buzz.ts)
```typescript
import * as ActChc from '../../85.choice.unit/choice.action';
import * as ActPut from '../../84.input.unit/input.action';
import * as ActCns from '../../83.console.unit/console.action';
import * as ActGrd from '../../81.grid.unit/grid.action';
import { generate } from '../util/generate';
import { extract } from '../util/extract';

export const draftScene = async (cpy: any, bal: any, ste: any) => {
  let bit = await ste.hunt(ActGrd.UPDATE_GRID, { x: 4, y: 4, xSpan: 4, ySpan: 6 });
  bit = await ste.hunt(ActChc.OPEN_CHOICE, {
    lst: ['pantry_wall', 'the_warm_pipe', 'the_attic_stair'],
    net: bit.grdBit.dat,
  });
  const selectedLocation = bit.chcBit.src;

  await ste.hunt(ActCns.UPDATE_CONSOLE, { 
    idx: 'cns00', 
    src: `[GOBLIN] Wrote outline draft for ${selectedLocation} to disk.` 
  });
  return cpy;
};

export const commitScene = async (cpy: any, bal: any, ste: any) => {
  let bit = await ste.hunt(ActGrd.UPDATE_GRID, { x: 4, y: 4, xSpan: 4, ySpan: 2 });
  bit = await ste.hunt(ActPut.OPEN_INPUT, {
    src: 'Enter filename to commit:',
    net: bit.grdBit.dat,
  });
  const filename = bit.putBit.src;

  await ste.hunt(ActCns.UPDATE_CONSOLE, { 
    idx: 'cns00', 
    src: `[WARNING] Drift detected in peak_level. Authorize?` 
  });

  bit = await ste.hunt(ActGrd.UPDATE_GRID, { x: 4, y: 6, xSpan: 4, ySpan: 4 });
  bit = await ste.hunt(ActChc.OPEN_CHOICE, {
    lst: ['YES - Authorize Drift', 'NO - Abort Commit'],
    net: bit.grdBit.dat,
  });

  if (bit.chcBit.src === 'YES - Authorize Drift') {
    await ste.hunt(ActCns.UPDATE_CONSOLE, { idx: 'cns00', src: `[GOBLIN] Scene committed to ledger.` });
  } else {
    await ste.hunt(ActCns.UPDATE_CONSOLE, { idx: 'cns00', src: `[GOBLIN] Commit aborted by Showrunner.` });
  }

  return cpy;
};

```

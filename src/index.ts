import { Terminal, commands, ExtensionContext, workspace } from 'coc.nvim';

let terminal: Terminal | undefined;
let showing: boolean = false;

export async function activate(context: ExtensionContext): Promise<void> {
  context.subscriptions.push(
    commands.registerCommand('terminal.Toggle', async () => {
      await toggle();
    }),

    commands.registerCommand('terminal.Destroy', () => {
      if (terminal) {
        terminal.dispose();
        terminal = undefined;
      }
    }),

    workspace.registerKeymap(
      ['n'],
      'terminal-toggle',
      async () => {
        await toggle();
      },
      { sync: false }
    )
  );
}

async function toggle(): Promise<void> {
  if (terminal) {
    const doc = await workspace.getDocument(terminal.bufnr);
    if (doc) {
      workspace.jumpTo(doc.uri);
    } else {
      terminal = undefined;
    }
  }
  if (!terminal) {
    terminal = await workspace.createTerminal({ name: 'coc-terminal' });
    if (!terminal) {
      workspace.showMessage(`Create terminal failed`, 'error');
      return;
    }

    terminal.show();
    showing = true;
    return;
  }

  if (showing) {
    terminal.hide();
    showing = false;
  } else {
    terminal.show();
    showing = true;
  }
}

import { commands, ExtensionContext, Terminal, workspace } from 'coc.nvim';

const replAvailableLanguages = ['javascript', 'typescript', 'python'];
let terminal: Terminal | null = null;
let showing: boolean = false;

export async function activate(context: ExtensionContext): Promise<void> {
  context.subscriptions.push(
    commands.registerCommand('terminal.Toggle', async () => {
      await toggle();
    }),

    commands.registerCommand('terminal.REPL', async () => {
      await repl();
    }),

    commands.registerCommand('terminal.Destroy', () => {
      if (terminal) {
        terminal.dispose();
        terminal = null;
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
  if (!terminal) {
    terminal = await workspace.createTerminal({ name: 'coc-terminal' });
    if (!terminal) {
      workspace.showMessage(`Create terminal failed`, 'error');
      return;
    }
  }

  if (showing) {
    terminal.hide();
    showing = false;
  } else {
    terminal.show();
    showing = true;
  }
}

async function repl(): Promise<void> {
  const { nvim } = workspace;
  const filetype = await nvim.eval('&filetype');
  if (!replAvailableLanguages.includes(filetype.toString())) {
    workspace.showMessage(`No REPL support for ${filetype} yet`, 'warning');
    return;
  }

  let prog = '';
  if (filetype === 'javascript') {
    prog = 'node';
  } else if (filetype === 'typescript') {
    prog = 'ts-node';
  } else if (filetype === 'python') {
    prog = 'python';
  }

  if (terminal) {
    terminal.dispose();
  }
  terminal = await workspace.createTerminal({ name: 'coc-terminal' });
  if (!terminal) {
    workspace.showMessage(`Create terminal failed`, 'error');
    return;
  }

  terminal.sendText(prog, true);
  await nvim.command('startinsert');
  showing = true;
}

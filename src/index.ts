import { commands, ExtensionContext, Terminal, workspace, events, window } from 'coc.nvim';

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
        showing = false
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

  events.on('BufHidden', async (bufnr) => {
    if (terminal?.bufnr === bufnr) {
      showing = false
    }
  });

  events.on('BufUnload', async (bufnr) => {
    if (terminal?.bufnr === bufnr) {
      terminal = null
      showing = false
    }
  });

  events.on('BufEnter', async (bufnr) => {
    if (terminal?.bufnr === bufnr) {
      terminal.sendText("", false)
      await workspace.nvim.command('startinsert');
    }
  });
}

async function toggle(): Promise<void> {
  if (!terminal) {
    const config = workspace.getConfiguration('terminal');
    const shellPath = config.get<string>('shellPath');
    const shellArgs = config.get<string[]>('shellArgs');
    terminal = await workspace.createTerminal({ name: 'coc-terminal', shellPath, shellArgs });
    if (!terminal) {
      window.showMessage(`Create terminal failed`, 'error');
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
  const doc = await workspace.document;
  if (!doc.filetype) {
    window.showMessage(`Unknown buffer filetype ${doc.filetype}`, 'warning');
    return;
  }

  const config = workspace.getConfiguration('terminal');
  const mappings = config.get('REPLMappings', {})
  const prog = mappings[doc.filetype]
  if (!prog) {
    window.showMessage(`No REPL program found for ${doc.filetype}, you can custom it with "terminal.REPLMappings"`, 'warning');
    return;
  }

  if (terminal) terminal.dispose();
  const shellPath = config.get<string>('shellPath');
  const shellArgs = config.get<string[]>('shellArgs');
  terminal = await workspace.createTerminal({ name: 'coc-terminal', shellPath, shellArgs });
  if (!terminal) {
    window.showMessage(`Create terminal failed`, 'error');
    return;
  }

  terminal.sendText(prog, true);
  await workspace.nvim.command('startinsert');
  showing = true;
}

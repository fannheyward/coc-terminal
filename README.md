# coc-terminal

Toggle terminal with coc.nvim. Inspired by [repl with coc.nvim](https://gist.github.com/chemzqm/e22ddf489ec24c7d21bbcb047f4b3f86).

## Install

`:CocInstall coc-terminal`

## Keymaps

`<Plug>(coc-terminal-toggle)`: toggle terminal show/hide

## Configurations

- `terminal.REPLMappings`: association overrides between file types and the
  command called for their REPL, default:

      {
        "c": "cling",
        "cpp": "cling",
        "javascript": "node",
        "typescript": "ts-node",
        "python": "python"
      }

## Commands

- `terminal.Toggle`: Show/hide terminal
- `terminal.REPL`: Create REPL for current file, only support `JS`, `TS`, `Python`, `C++` for now
- `terminal.Destroy`: Destroy and free terminal

## License

MIT

---
> This extension is created by [create-coc-extension](https://github.com/fannheyward/create-coc-extension)

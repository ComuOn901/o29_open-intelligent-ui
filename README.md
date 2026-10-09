# Open Intelligent UI

**An open-source implementation of the "Intelligent UI" experience introduced in ChatGPT, built on [OpenUI](https://openui.com).**

In ChatGPT's Intelligent UI, a request such as "plan a day in San Francisco" returns an interactive answer (a map, photographs and an editable itinerary) rather than text. This repository reproduces that experience with open-source components, so that the same kind of interface can be built, modified and shipped inside any application.

[OpenUI](https://github.com/thesysdev/openui) is the open standard for Generative UI.

> This project is independent and is not affiliated with or endorsed by OpenAI. "Intelligent UI" refers to the ChatGPT feature that this demo recreates.

## Demo video

ChatGPT's Intelligent UI (left) and this project (right) answering the same request. Select the image to play the video.

[![ChatGPT and OpenUI side by side, each showing a one-day San Francisco route with photos and a map](docs/openui-chatgpt-comparison.jpg)](docs/openui-chatgpt-comparison.mp4)

## What's in the demo

The model streams OpenUI Lang 1.0, and the app renders it with a library of primitives the model arranges itself: no layout is fixed in the components. The library (`src/lib/library.ts`, components in `src/lib/components/`) follows the Open Intelligent UI design in light and dark:

- **Layout:** `Col`, `Row`, `Box` (background, radius, border, sizes, flex), `Grid`, `Card`, `Divider`, `Spacer`.
- **Text:** `Title`, `Text` (inline **bold**, *italic*, `code`, links), `Caption`, `Label`, `Badge`, `Link`, `List` and `ListItem` (bullets, numbers, a timeline), `Markdown`.
- **Inputs:** `Button`, `IconButton`, `Pressable`, `Input`, `TextArea`, `Select`, `SegmentedControl`, `Slider`, `Checkbox`, `RadioGroup`, `DatePicker`, `Form`. Each input's first argument is its value, usually a `$variable` other statements read.
- **Media and data:** `Icon` (lucide names), `Image` (searches Wikipedia when there is no `src` or it fails), `Table`, `Chart` (bar, line, area, pie, donut), and `Map` with `MapMarker` ([MapLibre GL](https://maplibre.org), category filter, expansion, a street route).
- **Drawing:** `Svg` with `G`, `Circle`, `Ellipse`, `Rect`, `Line`, `Path`, `Polyline`, `Polygon` and `SvgText`, whose attributes take expressions so state can move them; `HtmlView` runs an HTML page (a game, a canvas) in a sandboxed iframe.

The dev-only page `/gallery` renders hand-written programs that exercise every component.

## Setup

Requires Node 24.

```bash
cp .env.example .env.local   # add your THESYS_API_KEY
npm install
npm run dev
```

Open http://localhost:3000 and try: `I'm in San Francisco for a day, plan a sightseeing route for me`

| Variable | Required | Purpose |
| --- | --- | --- |
| `THESYS_API_KEY` | Yes, unless using Ollama | OpenUI Gateway key, used only on the server. |
| `THESYS_MODEL` | No | A `{provider}/{model}` id. Defaults to `openai/gpt-5.5`. |
| `MODEL_PROVIDER` | No | Set to `ollama` to run a local model instead of Gateway; see [Run with a local model](#run-with-a-local-model-ollama). |
| `OLLAMA_MODEL` | No | The Ollama model to use. Defaults to `qwen3.8:27b`. |
| `OLLAMA_BASE_URL` | No | Ollama's OpenAI-compatible endpoint. Defaults to `http://localhost:11434/v1`. |

## Run with a local model (Ollama)

The demo can also run on a local model through [Ollama](https://ollama.com), with no API key required.

You can use **OpenUI / Open Intelligent UI** with any local LLM provider, including:
- [Ollama](https://ollama.com)
- [LM Studio](https://lmstudio.ai)
- [Unsloth Studio](https://unsloth.ai)
- [AnythingLLM](https://anythingllm.com)

We also have an [OpenWebUI plugin](https://github.com/thesysdev/openwebui-plugin) that can be set up with Open Intelligent UI.
1. Install Ollama and pull a model. The default is `qwen3.8:27b` (about 18 GB, best with 32 GB of memory or more); `gpt-oss:20b` and `qwen3:8b` are smaller alternatives.

   ```bash
   ollama pull qwen3.8:27b
   ```

2. Give the model a larger context window. The OpenUI prompt for this app is about 3,600 tokens, and Ollama's default window is 4,096, which silently cuts the prompt and produces broken output. Either start Ollama with a larger default:

   ```bash
   OLLAMA_CONTEXT_LENGTH=32768 ollama serve
   ```

   or create a model variant with a larger window and use its name as `OLLAMA_MODEL`:

   ```bash
   printf 'FROM qwen3.8:27b\nPARAMETER num_ctx 32768\n' > Modelfile
   ollama create qwen3.8-32k -f Modelfile
   ```

3. In `.env.local`, set `MODEL_PROVIDER=ollama` (and `OLLAMA_MODEL` to use another model), then `npm run dev`.

What changes with a local model:

- **No image search.** Gateway's hosted `image_search` is not available, so photos come from Wikipedia.
- **No output correction.** Gateway validates and corrects the generated OpenUI Lang; locally, the model's output is rendered as written, so larger models give better results.
- **Speed depends on your hardware.** The first request after Ollama loads the model has to read the whole prompt; later requests reuse it and are much faster. For reasoning models, `REASONING_EFFORT=low` cuts the wait considerably. 
## How it works

- **Generation.** `/api/chat` calls OpenUI Gateway's Responses API with `generateSystemPrompt({ cloud: true })`, so Gateway validates and corrects the generated OpenUI Lang against this app's component library. Gateway's hosted `image_search` tool finds current photos the model can pass to `Image`.
- **Chat Completions.** OpenUI Gateway also supports the Chat Completions API, and OpenUI works with either. This example uses the Responses API because Gateway's hosted tools, such as `image_search`, are available only there. An application already built on Chat Completions can keep that protocol and pair it with `openAIReadableStreamAdapter` or `openAIAdapter` in the browser.
- **State.** Inputs bind to `$variables` (`Slider($price, 0, 100)`), and any statement that reads them updates as the user interacts. Buttons and `Pressable` run `@Set`, `@Reset`, `@ToAssistant` and `@OpenUrl` steps.
- **Photos.** `Image` loads its `src`; without one, or when it fails, it asks `/api/image-search`, which returns Wikipedia lead images and Wikimedia Commons files for the description.
- **Map data.** Street geometry comes from `/api/street-route`, which validates input and caches results from the public OSRM demo server's driving profile: a road overview, not walking or transit directions. When it's unavailable, a labelled direct connection is drawn instead.
- **Theme.** Colors, type, radii and spacing are tokens in `src/lib/components/theme.css`, with a dark set under `data-theme="dark"`. The chat shell keeps its `AgentInterface` theme from `src/lib/response-theme.ts`.

## Project structure

| File | Purpose |
| --- | --- |
| `src/app/layout.tsx` | Root layout: page metadata, the Inter font and `globals.css`. |
| `src/app/page.tsx` | The chat page. Renders `AgentInterface` with the component library, theme, welcome screen and starter prompts, and connects it to `/api/chat`. |
| `src/app/globals.css` | Global CSS reset. |
| `src/app/shell.css` | Restyles the `AgentInterface` shell (sidebar, composer, starters, message bubbles), using theme tokens where they exist. |
| `src/app/api/chat/route.ts` | Chat endpoint. Validates the request, forwards the conversation to OpenUI Gateway with image search enabled (or to a local Ollama model when `OLLAMA_MODEL` is set), and streams the response back. |
| `src/app/api/wiki/route.ts` | Wikipedia lookup: photos and coordinates for a place, cached on the server. |
| `src/app/api/street-route/route.ts` | Street geometry between stops from OSRM, cached on the server. |
| `src/app/api/image-search/route.ts` | Photo search for `Image`: Wikipedia lead images, then Wikimedia Commons, cached on the server. |
| `src/app/gallery/` | The dev-only `/gallery` page and its OpenUI Lang programs. |
| `src/lib/library.ts` | The OpenUI component library: the primitives, their groups and prompt notes. |
| `src/lib/prompt-options.ts` | The OpenUI Lang 1.0 prompt flags the library uses. |
| `src/lib/response-theme.ts` | Theme tokens for the `AgentInterface` shell (colors, fonts, radii, chat bubbles), built with `createTheme()`. |
| `src/lib/components/` | The components (`defineComponent` + Zod schema each), their styles and tokens, and the map in `map/`. |
| `src/generated/spec.json` | Library spec sent to Gateway in the system prompt. Regenerate with `npm run generate` after changing a component schema. |
| `src/generated/system-prompt.txt` | The full system prompt for the library. Regenerate with `npm run prompt`. |
| `vendor/openui/` | The OpenUI 1.0 packages, packed from the release branch by `scripts/pack-openui.sh`. |
| `docs/openui-chatgpt-comparison.mp4` | Side-by-side video of ChatGPT and this project; `docs/openui-chatgpt-comparison.jpg` is its README preview. |
| `.env.example` | The environment variables to copy into `.env.local`. |

## Checks

```bash
npm run generate && npm run prompt   # after changing a component schema
npm run typecheck
npm run build
```

Then open `/gallery` (`npm run dev`), switch between light and dark, and try it at phone width. `scripts/gallery-shots.mjs` takes the same screenshots headlessly and checks console errors, overflow and the main interactions.

# <img src="https://github.com/polyglot-translate/polyglot-translate/blob/main/src/icons/icon-128.png" height="50"> Polyglot Translate

Translate web pages in real-time using Google, Bing, Yandex, DeepL or **LLM** (OpenAI-compatible).

## Features

- **Real-time page translation** — Translate entire pages without opening new tabs
- **Multiple translation engines** — Google, Bing, Yandex, DeepL
- **LLM Translation** — Use any OpenAI-compatible API (OpenAI, Groq, DeepSeek, Ollama, etc.)
- **Aggressive caching** — Never translate the same text twice (TTL + Size limit + LRU eviction)
- **Text selection translation** — Select text and get instant translation
- **Auto-translate** — Automatically translate specific sites or languages
- **Cross-browser** — Firefox, Chrome, Edge, Brave

## Install

### Firefox
- Download from [Mozilla Addons](https://addons.mozilla.org/firefox/addon/traduzir-paginas-web/) (coming soon)

### Chrome, Edge and Brave
- Download from Chrome Web Store (coming soon)

### Manual Install
1. Clone this repository
2. Run `npm install`
3. Run `npm run build:local-sourcemaps`
4. Load the extension from `build/Polyglot_0.1.0_Chromium` or `build/Polyglot_0.1.0_Firefox`

## LLM Translation Setup

1. Open extension options
2. Go to **Translations** section
3. Find **LLM Translation Settings**
4. Enter your **API Key**
5. Set the **API URL** (default: OpenAI)
6. Choose a **Model** (default: gpt-4o-mini)
7. Click **Test Connection** to verify

### Supported LLM Providers

| Provider | API URL |
|----------|---------|
| OpenAI | `https://api.openai.com/v1/chat/completions` |
| Groq | `https://api.groq.com/openai/v1/chat/completions` |
| DeepSeek | `https://api.deepseek.com/v1/chat/completions` |
| OpenRouter | `https://openrouter.ai/api/v1/chat/completions` |
| Ollama (local) | `http://localhost:11434/v1/chat/completions` |
| LM Studio (local) | `http://localhost:1234/v1/chat/completions` |
| LocalAI (local) | `http://localhost:8080/v1/chat/completions` |
| Azure OpenAI | `https://{resource}.openai.azure.com/...` |

### Cache Settings

- **Cache Duration (TTL):** Default 30 days (configurable: 1/7/30/90 days or never)
- **Max Cache Size:** Default 50 MB (configurable: 10/50/100/250 MB)
- **LRU Eviction:** When cache is full, least recently used entries are removed first
- Manual **Clear Cache** button available

## Build Instructions

See [build-instructions.md](build-instructions.md) for detailed build steps.

## Changelog

See [docs/CHANGELOG.md](docs/CHANGELOG.md) for version history.

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md) for planned features.

## Contribute

- Report issues at [GitHub Issues](https://github.com/polyglot-translate/polyglot-translate/issues)

## License

This project is licensed under the terms found in the [LICENSE](LICENSE) file.

---

Based on [TWP - Translate Web Pages](https://github.com/FilipePS/Traduzir-paginas-web) by FilipePS.
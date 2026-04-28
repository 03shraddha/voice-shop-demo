# voice-shop-demo

Shop by talking. No clicking needed.

This is a fake Amazon storefront where you control everything with your voice. Add items to cart, apply promo codes, fill out shipping fields, navigate pages - all hands-free using OpenAI's Realtime API over WebRTC.

---

## Why it's cool

Real-time voice + tool calls = the AI does not just talk back, it **acts on the UI**. A ghost cursor animates to each element as the AI fills it in. It feels like someone else is using your browser for you.

```
You speak --> OpenAI Realtime (WebRTC) --> tool call --> React state update --> UI changes
```

---

## Tech stack

| Layer | What |
|---|---|
| Frontend | React + Vite + Tailwind |
| Voice transport | WebRTC via `realtime-voice-component` |
| AI model | `gpt-realtime-1.5` (OpenAI Realtime API) |
| VAD | Server-side VAD, threshold 0.65, 600ms silence |
| Session proxy | Node.js (`session-server.mjs`) keeps API key off the browser |
| Routing | React Router v6 |
| State | React Context (cart + shipping) |

---

## Try it yourself

You need an OpenAI API key with Realtime API access.

**1. Clone and install**
```bash
git clone https://github.com/03shraddha/voice-shop-demo.git
cd voice-shop-demo
npm install
```

**2. Add your key**
```bash
# create .env.local (never committed)
echo "OPENAI_API_KEY=sk-..." > .env.local
```

**3. Start both servers**
```bash
# terminal 1 - session proxy (keeps key off browser)
node session-server.mjs

# terminal 2 - frontend
npm run dev
```

Open `http://localhost:5173` and click the mic button.

---

## Voice commands to try

```
"Add two blue hoodies in size medium"
"Apply promo code SAVE20"
"Go to checkout"
"Fill in my shipping details"
```

Valid promo code: `SAVE20` (20% off)

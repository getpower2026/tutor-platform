import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>白板</title>
  <link rel="stylesheet" href="https://unpkg.com/@excalidraw/excalidraw@0.18.0/dist/excalidraw.production.min.css">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #app { width: 100%; height: 100%; overflow: hidden; }
  </style>
</head>
<body>
  <div id="app"></div>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@excalidraw/excalidraw@0.18.0/dist/excalidraw.production.min.js"></script>
  <script src="https://js.pusher.com/8.3/pusher.min.js"></script>
  <script>
    const BOOKING_ID = ${JSON.stringify(id)};
    const PUSHER_KEY = ${JSON.stringify(process.env.NEXT_PUBLIC_PUSHER_KEY)};
    const PUSHER_CLUSTER = ${JSON.stringify(process.env.NEXT_PUBLIC_PUSHER_CLUSTER)};

    const { Excalidraw } = ExcalidrawLib;
    const { createElement, useEffect, useRef, useCallback } = React;

    function App() {
      const apiRef = useRef(null);
      const channelRef = useRef(null);
      const mySocketIdRef = useRef('');
      const pendingRef = useRef(null);
      const lastJsonRef = useRef('');

      useEffect(() => {
        const pusher = new Pusher(PUSHER_KEY, {
          cluster: PUSHER_CLUSTER,
          authEndpoint: '/api/pusher/auth',
        });
        pusher.connection.bind('connected', () => {
          mySocketIdRef.current = pusher.connection.socket_id;
        });
        const ch = pusher.subscribe('private-whiteboard-' + BOOKING_ID);
        channelRef.current = ch;

        ch.bind('client-wb', (data) => {
          if (data.sid === mySocketIdRef.current) return;
          if (apiRef.current && data.elements) {
            apiRef.current.updateScene({ elements: data.elements });
          }
        });

        ch.bind('client-wb-clear', () => {
          if (apiRef.current) apiRef.current.resetScene();
        });

        const timer = setInterval(() => {
          if (!pendingRef.current || !channelRef.current) return;
          try {
            channelRef.current.trigger('client-wb', {
              elements: pendingRef.current,
              sid: mySocketIdRef.current,
            });
          } catch (e) {}
          pendingRef.current = null;
        }, 120);

        return () => { clearInterval(timer); pusher.disconnect(); };
      }, []);

      const onChange = useCallback((elements) => {
        const json = JSON.stringify(elements);
        if (json === lastJsonRef.current) return;
        lastJsonRef.current = json;
        pendingRef.current = elements;
      }, []);

      return createElement(Excalidraw, {
        theme: 'light',
        excalidrawAPI: (api) => { apiRef.current = api; },
        onChange,
        UIOptions: {
          canvasActions: { export: false, loadScene: false, saveAsImage: true, saveToActiveFile: false },
        },
      });
    }

    ReactDOM.createRoot(document.getElementById('app')).render(createElement(App));
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}

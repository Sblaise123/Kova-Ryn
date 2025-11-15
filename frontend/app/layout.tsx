export const metadata = {
  title: 'AI Chat Platform',
  description: 'Chat with AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{__html: `
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #1e293b 0%, #4c1d95 50%, #1e293b 100%);
            color: white;
            min-height: 100vh;
          }
          input, button {
            font-family: inherit;
          }
        `}} />
      </head>
      <body>{children}</body>
    </html>
  );
}
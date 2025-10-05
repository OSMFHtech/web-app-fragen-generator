export const metadata = {
  title: "AI Question Generator",
  description: "Frontend demo for generating, reviewing, and exporting Moodle XML question banks."
};

import "../styles/globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}

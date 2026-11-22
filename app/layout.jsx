import './globals.css';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/700.css';
import { eventConfig } from './event-config';

export const metadata = {
  title: `${eventConfig.series} · ${eventConfig.title} | OSCode REVA`,
  description: `${eventConfig.title} on ${eventConfig.dateLabel} at ${eventConfig.venue}, ${eventConfig.location}. Teams of ${eventConfig.teamSize} compete across four elimination rounds. ${eventConfig.feeLabel}.`,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

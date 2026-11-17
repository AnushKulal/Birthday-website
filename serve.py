"""
Serve this birthday website to every device on your Wi-Fi (phone, tablet, laptop).

    Windows:      double-click  start-site.bat
    Mac / Linux:  python3 serve.py

Only THIS folder is shared, no matter where you run it from.
Optional: pick another port with  python serve.py 8080
"""
import functools
import http.server
import os
import socket
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 1130
HERE = os.path.dirname(os.path.abspath(__file__))


def lan_ip():
    """This computer's address on the local network (no data is actually sent)."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("10.255.255.255", 1))
        return s.getsockname()[0]
    except OSError:
        return None
    finally:
        s.close()


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # always send the latest files, so edits to config.js show up on refresh
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, fmt, *args):
        # only mention page opens, not every image/script request
        if self.command == "GET" and self.path.split("?")[0] in ("/", "/index.html"):
            print("  Site opened by device at " + self.client_address[0])


def main():
    handler = functools.partial(Handler, directory=HERE)
    try:
        server = http.server.ThreadingHTTPServer(("0.0.0.0", PORT), handler)
    except OSError:
        print("\n  Port %d is already in use (maybe the site is already running in another window)." % PORT)
        print("  Close that window, or use another port:  python serve.py 8080\n")
        sys.exit(1)

    ip = lan_ip()
    line = "=" * 60
    print("\n" + line)
    print("  Birthday website is running!")
    print(line)
    print("  On this computer:          http://localhost:%d" % PORT)
    if ip:
        print("  On phones / other devices: http://%s:%d" % (ip, PORT))
        print("  (they must be on the same Wi-Fi as this computer)")
    print(line)
    print("  Keep this window open. Press Ctrl+C to stop.\n")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Stopped. Bye!")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()

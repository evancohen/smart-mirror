import BaseHTTPServer, SimpleHTTPServer
import ssl

'''
The certfile can be generated with the following:
openssl req -new -x509 -keyout server.pem -out server.pem -days 365 -nodes
'''


httpd = BaseHTTPServer.HTTPServer(('localhost', 4443), SimpleHTTPServer.SimpleHTTPRequestHandler)
httpd.socket = ssl.wrap_socket (httpd.socket, certfile='C:\Users\evcohen\.ssh\python.pem', server_side=True)
httpd.serve_forever()
import getpass
import sys
import telnetlib

HOST = "192.168.69.9"
PORT = 7072
print "python running, printing args passed to script:"
print sys.argv[1]
tn = telnetlib.Telnet(HOST,PORT)

#tn.write("\n\n\n")
tn.write(sys.argv[1])
tn.write("\n")
tn.write("exit\n")

print tn.read_all()

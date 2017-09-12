import os
import argparse
import time
import datetime

parser = argparse.ArgumentParser(description='Outputs a file to STDOUT if it was modified less than 30 sec ago.')
parser.add_argument('--filename', metavar='f', type=str)
args = parser.parse_args()

now = time.time()
mtime = os.stat(args.filename).st_mtime

# this makes the script fail if the file is old
assert now-mtime < 30

with open(args.filename, 'r') as f:
    print(f.read())

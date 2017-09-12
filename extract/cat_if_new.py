import os
import argparse
import time
import datetime

parser = argparse.ArgumentParser(description='Outputs a file to STDOUT if it was modified less than a minute ago.')
parser.add_argument('--filename', metavar='f', type=str)
args = parser.parse_args()

now = time.time()
mtime = os.stat(args.filename).st_mtime

# this makes the script fail if the file is old
assert now-mtime < 60

with open(args.filename, 'r') as f:
    print(f.read())

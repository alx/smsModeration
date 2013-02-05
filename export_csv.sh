#!/bin/sh

# to use: ./export_csv.sh >out.csv

sqlite3 ./smssync.db <<!
.headers on
.mode csv
.output out.csv
select * from messages;
!

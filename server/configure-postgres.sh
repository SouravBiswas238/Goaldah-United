#!/bin/bash

# PostgreSQL 18 Configuration Helper for Goaldah United

echo "=== PostgreSQL 18 Configuration Helper ==="
echo ""

# Check if PostgreSQL is running
if pgrep -f "postgres -D /Library/PostgreSQL/18/data" > /dev/null; then
    echo "✓ PostgreSQL is running"
else
    echo "✗ PostgreSQL is NOT running"
    echo "  Please start PostgreSQL from pgAdmin 4 or System Preferences"
    exit 1
fi

echo ""
echo "To enable TCP/IP connections on localhost, we need to modify PostgreSQL configuration."
echo "This requires editing /Library/PostgreSQL/18/data/postgresql.conf"
echo ""
echo "Please follow these steps in pgAdmin 4:"
echo ""
echo "1. Open pgAdmin 4"
echo "2. Connect to your PostgreSQL server"
echo "3. Right-click on 'PostgreSQL 18' server → Properties"
echo "4. Go to the 'Connection' tab"
echo "5. Ensure 'Host name/address' is set to 'localhost' or '127.0.0.1'"
echo ""
echo "OR manually edit the configuration:"
echo ""
echo "sudo nano /Library/PostgreSQL/18/data/postgresql.conf"
echo ""
echo "Find and uncomment/modify this line:"
echo "  listen_addresses = 'localhost'"
echo ""
echo "Then restart PostgreSQL from pgAdmin 4 or run:"
echo "  sudo /Library/PostgreSQL/18/bin/pg_ctl -D /Library/PostgreSQL/18/data restart"
echo ""

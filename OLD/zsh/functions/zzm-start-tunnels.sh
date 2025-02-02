#!/bin/bash

zzm-start-tunnels() {
  tunnelto --subdomain rback -p 5001 &
  tunnelto --subdomain rportal -p 4000 &
  tunnelto --subdomain rdashboard -p 3000 &
  echo '🔌 Tunnels ready 🟢'
}

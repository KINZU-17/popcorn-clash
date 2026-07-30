import multiprocessing

bind = "0.0.0.0:5555"
workers = multiprocessing.cpu_count() * 2 + 1
threads = 2
max_requests = 1000
max_requests_jitter = 50
timeout = 120
keepalive = 5
error_log = "-"
access_log = "-"
loglevel = "info"
capture_output = True
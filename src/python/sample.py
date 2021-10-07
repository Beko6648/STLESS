import json
import datetime
import time
import random
import sys

total = 0

def get_dict_data(access):
    global total
    dt_now = datetime.datetime.now()
    time_str = dt_now.isoformat(timespec='seconds') # 2018-12-31T05:00:30 という形式
    
    if(access == 'enter'):
        total+=1
    elif(access == 'leave'):
        total-=1

    dict = {
        "time_data": time_str,
        "enter_or_leave": access,
        "people_count": total
    }
    return dict

# print(json.dumps(get_dict_data('enter')))

while True:
    if(random.randint(0,1) == 0):
        print(json.dumps(get_dict_data('enter')))
    elif(total>0):
        print(json.dumps(get_dict_data('leave')))
    sys.stdout.flush()
    time.sleep(5)

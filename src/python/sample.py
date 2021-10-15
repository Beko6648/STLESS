import json
import datetime
import time
import random
import pytz

total = 0

def get_dict_data(access):
    global total
    dt_now = datetime.datetime.now(pytz.timezone('Asia/Tokyo'))
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



while True:
    for i in range(10):
        print(json.dumps(get_dict_data('enter')))
        time.sleep(1)
    time.sleep(5)

    for i in range(10):
        print(json.dumps(get_dict_data('leave')))
        time.sleep(1)
    
    # if(random.randint(0,1) == 0):
    #     print(json.dumps(get_dict_data('enter')))
    # elif(total>0):
    #     print(json.dumps(get_dict_data('leave')))
    # time.sleep(2)

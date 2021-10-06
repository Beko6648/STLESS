import json
import datetime
import time

total = 0

def date_class(access):
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

# print(json.dumps(date_class('enter')))

while True:
    print(json.dumps(date_class('enter')))
    time.sleep(10)
    print(json.dumps(date_class('leave')))
    time.sleep(10)


# f = open('./src/python/test.json', 'r')
# json_dict = json.load(f)
# json_str = json.dumps(json_dict)
# print(json_str)

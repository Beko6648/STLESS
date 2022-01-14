import json
import datetime
import time
import random
import pytz

# total = 0

# def get_dict_data(access):
#     global total
#     dt_now = datetime.datetime.now(pytz.timezone('Asia/Tokyo'))
#     time_str = dt_now.isoformat(timespec='seconds') # 2018-12-31T05:00:30 という形式
#     if(access == 'enter'):
#         total+=1
#     elif(access == 'leave'):
#         total-=1

#     dict = {
#         "time_data": time_str,
#         "enter_or_leave": access,
#         "people_count": total
#     }
#     return dict


people_in_store = 0

while True:
    random_num = random.randint(1,10)
    if(people_in_store<10):
        if(random_num<=7):
            people_in_store+=1
            print(json.dumps(['enter',0]))
        else:
            if(people_in_store!=0):
                people_in_store-=1
                print(json.dumps(['leave',0]))
    else:
        if(random_num>5):
            people_in_store+=1
            print(json.dumps(['enter',0]))
        else:
            if(people_in_store!=0):
                people_in_store-=1 
                print(json.dumps(['leave',0]))

    time.sleep(random.randint(60,180)) # 1分~10分
    # time.sleep(1)



    # for i in range(10):
    #     random_num = random.randint(0,1)
    #     print(json.dumps(['enter', random_num]))
    #     time.sleep(1)
    # time.sleep(5)

    # for i in range(10):
    #     random_num = random.randint(0,1)
    #     print(json.dumps(['leave', random_num]))
    #     time.sleep(1)
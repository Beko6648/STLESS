import json
import datetime


def date_class(access):
    dt_now = datetime.datetime.now()
    time_str = dt_now.isoformat(timespec='seconds') # 2018-12-31T05:00:30 という形式
    # self.date_data = [self.dt_now.month, self.dt_now.day, self.dt_now.hour, self.dt_now.minute]
    dict = {
        "time_data": time_str,
        "enter_or_leave": access,
        "people_count": total
    }
    return dict

print(json.dumps(date_class('enter')))


# f = open('./src/python/test.json', 'r')
# json_dict = json.load(f)
# json_str = json.dumps(json_dict)
# print(json_str)

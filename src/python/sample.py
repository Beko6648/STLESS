import json
import datetime


def date_class(access):
    dt_now = datetime.datetime.now()
    # self.date_data = [self.dt_now.month, self.dt_now.day, self.dt_now.hour, self.dt_now.minute]
    access = access
    dict = {
        "time_data": dt_now,
        "enter_or_leave": access
    }
    return dict

print(json.dumps(date_class('enter')))


# f = open('./src/python/test.json', 'r')
# json_dict = json.load(f)
# json_str = json.dumps(json_dict)
# print(json_str)

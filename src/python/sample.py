import json
import datetime

class date_class:
    def __init__(self, access):
        self.dt_now = datetime.datetime.now()
        # self.date_data = [self.dt_now.month, self.dt_now.day, self.dt_now.hour, self.dt_now.minute]
        self.access = access
        
print(json.dumps(date_class('enter')))

# f = open('./src/python/test.json', 'r')
# json_dict = json.load(f)
# json_str = json.dumps(json_dict)
# print(json_str)
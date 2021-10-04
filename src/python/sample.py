import json

f = open('./src/python/test.json', 'r')
json_dict = json.load(f)
json_str = json.dumps(json_dict)
print('json_str:{}'.format(type(json_str)))